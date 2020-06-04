window.dataset = {
  inputWidth: $('#eyes').width(),
  inputHeight: $('#eyes').height(),
  posted: false, // for recording whether the data has been posted
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
    console.log( {leftEye:leftEye,rightEye:rightEye});
    return {leftEye:leftEye,rightEye:rightEye};
  },

  addToDataset: function(image, metaInfos, target, key) {
    const set = dataset[key];
    // memorize whether this one is in train or validation
    if (set.x == null) {
      set.x = [[image], [metaInfos]];
      set.y = [target];
    } else {
      set.x[0].push(image);
      set.x[1].push(metaInfos);
      set.y.push(target)
    }
    set.n += 1;
  },

  addExample: async function(image, metaInfos, target) {
    // Given an image, eye pos and target coordinates, adds them to our dataset.
    target[0] = target[0] - 0.5;
    target[1] = target[1] - 0.5;
    const key = "train";

    dataset.addToDataset(image, metaInfos, target, key);

    ui.onAddExample(dataset.train.n);
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
    const positions = calibration.getCurPosition();
    const metaInfos = dataset.getMetaInfos();
    dataset.addExample(img, metaInfos, positions);
    calibration.moveCalibration();
  },

  toJSON: function() {
    if (dataset.train.n){
      return {
        inputWidth: dataset.inputWidth,
        inputHeight: dataset.inputHeight,
        train: {
          shapes: {
            image: [dataset.train.n, dataset.inputWidth, dataset.inputHeight, 3],
            y: [dataset.train.n, dataset.train.y[0].length]
          },
          n: dataset.train.n,
          x: {
            eyeImage:dataset.train.x[0],
            eyePositions:dataset.train.x[1],
          },
          y: dataset.train.y,
        }
      };  
    }
  },

  postData: async function(url = 'https://gb.cs.unc.edu/json/drop') {
    if(dataset.train.n){
      const data = dataset.toJSON();
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    }
  },

  deleteData: async function(){
    for(let i = 1; i++; i<23){
      resp = await fetch("https://gb.cs.unc.edu/json/drop/"+i, {
        method: "DELETE"
      });
    }
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
