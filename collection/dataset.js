window.dataset = {
  inputWidth: $('#eyes').width(),
  inputHeight: $('#eyes').height(),
  train: {
    n: 0,
    x: null,
    y: null,
  },

  getImage: function() {
    // Capture the current image in the eyes canvas as a tensor.
    const eyesCanvas = document.getElementById('eyes');
    const ctx = eyesCanvas.getContext('2d');
    const image = ctx.getImageData(0,0,eyesCanvas.width,eyesCanvas.height);

    // viz the last collected image
    document.getElementById("lastImage").getContext("2d").putImageData(image,0,0);
    return image;
  },

  getMetaInfos: function(mirror) {
    // Get some meta info about the rectangle as a tensor:
    // - middle x, y of the eye rectangle, relative to video size
    // - size of eye rectangle, relative to video size
    // - angle of rectangle (TODO)
    let x = facetracker.currentEyeRect[0] + facetracker.currentEyeRect[2] / 2;
    let y = facetracker.currentEyeRect[1] + facetracker.currentEyeRect[3] / 2;

    x = (x / facetracker.videoWidthExternal) * 2 - 1;
    y = (y / facetracker.videoHeightExternal) * 2 - 1;

    const rectWidth =
      facetracker.currentEyeRect[2] / facetracker.videoWidthExternal;
    const rectHeight =
      facetracker.currentEyeRect[3] / facetracker.videoHeightExternal;

    if (mirror) {
      x = 1 - x;
      y = 1 - y;
    }
    return [x, y, rectWidth, rectHeight];
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
    console.log(set.x);
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
      console.log(set.y);

      // update the n and UI
      set.n -= 1
      ui.onDeleteExample(dataset.train.n);
      
      // if no more example, set the x,y to null
      if (set.n == 0){
        set.x = null;
        set.y = null;
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
    const tensorToArray = function(t) {
      const typedArray = t.dataSync();
      return Array.prototype.slice.call(typedArray);
    };

    return {
      inputWidth: dataset.inputWidth,
      inputHeight: dataset.inputHeight,
      train: {
        shapes: {
          x0: dataset.train.x[0].shape,
          x1: dataset.train.x[1].shape,
          y: dataset.train.y.shape,
        },
        n: dataset.train.n,
        x: dataset.train.x && [
          tensorToArray(dataset.train.x[0]),
          tensorToArray(dataset.train.x[1]),
        ],
        y: tensorToArray(dataset.train.y),
      }
    };
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
