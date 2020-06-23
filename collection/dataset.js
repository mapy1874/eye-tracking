window.dataset = {
  inputWidth: $('#eyes').width(),
  inputHeight: $('#eyes').height(),
  postIDs: [], // for recording the id of the data posted into the server
  train: {
    n: 0,
    x: null,
    y: null,
  },

  getImage: function() {
    // Capture the current image in the eyes canvas as a tensor.
    const eyesCanvas = document.getElementById('eyes');
    // viz the last collected image
    const ctx = eyesCanvas.getContext('2d');
    const image = ctx.getImageData(0,0,eyesCanvas.width,eyesCanvas.height);
    document.getElementById("lastImage").getContext("2d").putImageData(image,0,0);
    // return the Base64 encoding of the image
    return eyesCanvas.toDataURL();
  },

  getMetaInfos: function(mirror) {
    // Get some meta info about the rectangle as a tensor:
    // - middle x, y of the eye rectangle, relative to video size
    // - size of eye rectangle, relative to video size
    // - angle of rectangle (TODO)
    let leftEye = facetracker.currentLeftEye;
    let rightEye = facetracker.currentRightEye;
    
    // normalize the pos of leftEye
    for(let i = 0; i<leftEye.length; i++){
      leftEye[i][0] = (leftEye[i][0]/facetracker.videoWidthExternal)*2-1;
      leftEye[i][1] = (leftEye[i][1]/facetracker.videoHeightExternal)*2-1;
    }

    for(let i = 0; i<rightEye.length; i++){
      rightEye[i][0] = (rightEye[i][0]/facetracker.videoWidthExternal)*2-1;
      rightEye[i][1] = (rightEye[i][1]/facetracker.videoHeightExternal)*2-1;
    }
    return {leftEye:leftEye,rightEye:rightEye};
  },

  addToDataset: function(image, metaInfos, target, key) {
    const set = dataset[key];
    // memorize whether this one is in train or validation
    if (set.x == null) {
      set.x = [[image], [metaInfos]];
      set.y = [target];
    } else {
      // if set.x[0]
      set.x[0].push(image);
      set.x[1].push(metaInfos);
      set.y.push(target)
    }
    set.n += 1;
  },

  addExample: async function(image, metaInfos, target) {
    // Given an image, eye pos and target coordinates, adds them to our dataset.
    target[0] = (target[0] - 0.5)*2;
    target[1] = (target[1] - 0.5)*2;
    const key = "train";

    await dataset.addToDataset(image, metaInfos, target, key);
    ui.onAddExample(dataset.train.n);
    // post the data into data set
    const postID = await dataset.postData('https://gb.cs.unc.edu/json/drop',dataset.train.n-1);
    dataset.postIDs.push(postID);
    // console.log("post successfully");
  },

  /*
  * delete the very last data added into the dataset
  */
  deleteExample: function(){
    // get whether the last example is in train or validation set
    if (this.train.n == 0) {
      return;
    } else {
      const set = dataset["train"];  
      set.x[0].pop();
      set.x[1].pop();
      set.y.pop();

      // get the last image's id and delete it from the server
      const lastID = this.postIDs.pop();
      dataset.deleteData("https://gb.cs.unc.edu/json/drop/", lastID);

      // update the n and UI
      set.n -= 1
      ui.onDeleteExample(dataset.train.n);
      
      const lastImage = document.getElementById('lastImage');
      const ctx = lastImage.getContext("2d");

      // if no more example, set the x,y to null
      if (set.n == 0){
        set.x = null;
        set.y = null;
        ctx.clearRect(0,0,lastImage.width,lastImage.height);
      } else { // else put the previous image to the eyeImage canvas
        var image = new Image();
        image.onload = function() {
          ctx.drawImage(image, 0, 0);
        };
        image.src = set.x[0][set.x[0].length-1];
      }
    }
  },
  
  captureExample: function() {
    // Take the latest image from the eyes canvas and add it to our dataset.
    // Takes the coordinates of the mouse.
    const img = dataset.getImage();

    // make sure this image is different from the last one
    if (this.train.n && img == dataset.train.x[0][this.train.n-1]){
      ui.showInfo("The eye image is the same as your last example! Please adjust your head pose slightly to make sure the facetracker follows you.");
      calibration.moveCalibration();
      return;
    }
    
    const positions = calibration.getCurPosition();
    const metaInfos = dataset.getMetaInfos();
    dataset.addExample(img, metaInfos, positions);
    calibration.moveCalibration();
  },

  toJSON: function(index) {
    // transform the index th data to a json object
    if (dataset.train.n){
      return {
          x: {
            eyeImage:dataset.train.x[0][index],
            eyePositions:dataset.train.x[1][index],
          },
          y: dataset.train.y[index],
        }
      };  
  },

  postData: async function(url = 'https://gb.cs.unc.edu/json/drop', index) {
    // post the index th data to the server and return its id
    if(dataset.train.n){
      const data = await dataset.toJSON(index);
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      }).catch(() => {
        alert("Fail to post the data! Please check your network connection.");
      });
      let dat = await response.json();
      let id = dat.id;
      return id;
    }
  },

  

  deleteData: async function(url='https://gb.cs.unc.edu/json/drop/',id){
    // delete the related id on the server
    const response = await fetch(url+id, {
      method: "DELETE"
    }).catch((err) => {
      alert("fail to delete the data, error:"+err);
    });
  },

  // get all available IDs and return them in a list
  getAvailableIDs: async function(){
    const IDs = [];
    let resp = await fetch("https://gb.cs.unc.edu/json/drop", {
      headers: { Accept: "application/json" }
    });
    // console.log("get resp", resp);
    let data = await resp.json();
    console.log("get data", data);  
    for (drop of data.drops){
      IDs.push(drop.id);
      console.log(IDs)
    }
    return IDs;
  },

  // get all available examples from the dataset
  getAllExamples: async function(){
    const allData = [];
    const availableIDs = await this.getAvailableIDs();
    const promiseList = [];
    for (i of availableIDs){
        console.log("pushing");
        promiseList.push(
            fetch("https://gb.cs.unc.edu/json/drop/"+i, {
                method: 'GET',
            }).then(async (resp)=>{
                if (resp.status >= 200 && resp.status < 300) {
                  // to avoid 404 response etc
                  console.log("get resp", resp);
                  let data = await resp.json();
                  console.log("get data", data);
                  let newItem = await JSON.stringify(data);
                  if (newItem != "{}"){
                      await allData.push(JSON.stringify(data));
                  }
                }
            }).catch(()=>{
                console.log("error");
            })
        )   
    }
    Promise.all(promiseList).then(()=>{
        dataset.download(JSON.stringify(allData), 'dataset.json', 'text/plain');
    });    
  },

  
  download: function (content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([[content]], {
      type: contentType,
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  },

  fromJSON: function(data) {
    dataset.inputWidth = data.inputWidth;
    dataset.inputHeight = data.inputHeight;
    dataset.train.n = data.train.n;
    dataset.train.x = data.train.x && [
      tf.tensor(data.train.x[0], data.train.shapes.x0),
      tf.tensor(data.train.x[1], data.train.shapes.x1),
    ];
    dataset.train.y = tf.tensor(data.train.y, data.train.shapes.y);
    ui.onAddExample(dataset.train.n);
  },
};



// for (let id = 350; id <400; id++){
//   let response = await fetch("https://gb.cs.unc.edu/json/drop/"+id, {
//     method: "DELETE"
//   }).catch((err) => {
//     alert("fail to delete the data, error:"+err);
//   });
  
// }

