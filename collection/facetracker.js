$(document).ready(function() {
  const video = document.getElementById('webcam');
  const overlay = document.getElementById('overlay');

  window.facetracker = {
    video: video,
    videoWidthExternal: video.width,
    videoHeightExternal: video.height,
    videoWidthInternal: video.videoWidth,
    videoHeightInternal: video.videoHeight,
    overlay: overlay,
    overlayCC: overlay.getContext('2d'),
    currentLeftEye: null,
    currentRightEye: null,
    trackingStarted: false,
    currentPosition: null,
    currentEyeRect: null,

    adjustVideoProportions: function() {
      // resize overlay and video if proportions of video are not 4:3
      // keep same height, just change width
      facetracker.videoWidthInternal = video.videoWidth;
      facetracker.videoHeightInternal = video.videoHeight;
      const proportion =
        facetracker.videoWidthInternal / facetracker.videoHeightInternal;
      facetracker.videoWidthExternal = Math.round(
        facetracker.videoHeightExternal * proportion,
      );
      facetracker.video.width = facetracker.videoWidthExternal;
      facetracker.overlay.width = facetracker.videoWidthExternal;
    },

    gumSuccess: function(stream) {
      ui.onWebcamEnabled();

      // add camera stream if getUserMedia succeeded
      if ('srcObject' in facetracker.video) {
        facetracker.video.srcObject = stream;
      } else {
        facetracker.video.src =
          window.URL && window.URL.createObjectURL(stream);
      }

      facetracker.video.onloadedmetadata = function() {
        facetracker.adjustVideoProportions();
        facetracker.video.play();
      };

      facetracker.video.onresize = function() {
        facetracker.adjustVideoProportions();
        // if (facetracker.trackingStarted) {
        //   facetracker.ctrack.stop();
        //   facetracker.ctrack.reset();
        //   facetracker.ctrack.start(facetracker.video);
        // }
      };
    },

    gumFail: function() {
      ui.showInfo(
        'There was some problem trying to fetch video from your webcam 😭',
        true,
      );
    },

    startVideo: function() {
      // navigator.mediaDevices.getUserMedia(
      //   {video: true}
      // ).then(stream => facetracker.video.srcObject = stream);
      console.log("start video")
      if (navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
          })
          .then(facetracker.gumSuccess)
          .catch(facetracker.gumFail);
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {
            video: true,
          },
          facetracker.gumSuccess,
          facetracker.gumFail,
        );
      } else {
        ui.showInfo(
          'Your browser does not seem to support getUserMedia. 😭 This will probably only work in Chrome or Firefox. If you are using Chrome, please make sure https:// is added before patrickma.me',
          true,
        );
      }
    },

    getEyesRect: function(leftEyePosition, rightEyePosition) {
      // Given a tracked face, returns a rectangle surrounding the eyes.
      const minX = leftEyePosition[0]._x-15;
      const maxX = rightEyePosition[3]._x+15;
      const minY =
        Math.min(
          leftEyePosition[1]._y,
          leftEyePosition[2]._y,
          rightEyePosition[1]._y,
          rightEyePosition[2]._y,
        )-2;
      const maxY =
        Math.max(
          leftEyePosition[4]._y,
          leftEyePosition[5]._y,
          rightEyePosition[4]._y,
          rightEyePosition[5]._y,
        )+2;

      const width = maxX - minX;
      const height = maxY - minY;

      return [minX, minY, width, height * 1.25];
    },

    getEyePositions: function(eyePosition){
      // convert a landmark to an array with length of 6
      const res = [];
      for(let i = 0; i < eyePosition.length; i++){
        res.push([eyePosition[i]._x,eyePosition[i]._y]);
      }      
      return res;
    },

    trackFace: function(leftEyePosition, rightEyePosition) {
      // Given a tracked face, crops out the eyes and draws them in the eyes canvas.
      const rect = facetracker.getEyesRect(leftEyePosition, rightEyePosition);
      facetracker.currentEyeRect = rect;

      facetracker.currentLeftEye = facetracker.getEyePositions(leftEyePosition);
      facetracker.currentRightEye = facetracker.getEyePositions(rightEyePosition);

      const eyesCanvas = document.getElementById('eyes');
      const eyesCtx = eyesCanvas.getContext('2d');

      // Resize because the underlying video might be a different resolution:
      const resizeFactorX =
        facetracker.videoWidthInternal / facetracker.videoWidthExternal;
      const resizeFactorY =
        facetracker.videoHeightInternal / facetracker.videoHeightExternal;
      facetracker.overlayCC.strokeStyle = 'red';
      facetracker.overlayCC.strokeRect(rect[0], rect[1], rect[2], rect[3]);
      eyesCtx.drawImage(
        facetracker.video,
        rect[0] * resizeFactorX,
        rect[1] * resizeFactorY,
        rect[2] * resizeFactorX,
        rect[3] * resizeFactorY,
        0,
        0,
        eyesCanvas.width,
        eyesCanvas.height,
      );
    },
  };

  // set up video
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  ]).then(facetracker.startVideo)
  

  facetracker.video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(overlay, displaySize);

    let id = requestAnimationFrame(frame);
    async function frame() {
      try{
        const useTinyModel =true;
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(useTinyModel);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
        faceapi.draw.drawFaceLandmarks(overlay, resizedDetections);
        ui.onFoundFace();
        facetracker.trackFace(resizedDetections.landmarks.getLeftEye(),resizedDetections.landmarks.getRightEye());
        requestAnimationFrame(frame);
      }catch{
        requestAnimationFrame(frame);
      }
    };
    // setInterval(async ()=>{
    //   try{
    //     const useTinyModel =true;
    //     const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(useTinyModel);
    //     const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //     overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
    //     faceapi.draw.drawFaceLandmarks(overlay, resizedDetections);
    //     ui.onFoundFace();
    //     facetracker.trackFace(resizedDetections.landmarks.getLeftEye(),resizedDetections.landmarks.getRightEye());
    //     requestAnimationFrame(detectLandmarks);
    //   }catch{
    //   }  
    // },200);
  })      

});
