$(document).ready(function() {
  const $target = $('#target');
  const targetSize = $target.outerWidth();

  function moveTarget() {
    // Move the model target to where we predict the user is looking to
    if (training.currentModel == null || training.inTraining) {
      return;
    }

    training.getPrediction().then(prediction => {
      const left = prediction[0] * ($('body').width() - targetSize);
      const top = prediction[1] * ($('body').height() - targetSize);
      $target.css('left', left + 'px');
      $target.css('top', top + 'px');
    });
  }   

  setInterval(moveTarget, 100);

  function download(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {
      type: contentType,
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  // initialize the pointers randomly
  calibration.moveCalibration()

  // Map functions to keys and buttons:
  $('body').keyup(function(event) {
    if (!ui.readyToCollect) {
      return;
    }


    if (event.keyCode == 32){
      // space key, delete the previous example
      dataset.deleteExample();
      event.preventDefault();
    } else{
      let key;
      if (event.keyCode == 37) {
        key = "left";
      } else if (event.keyCode == 39){
        key = "right";
      }
  
      if (key == calibration.getProceedKey()&&!dataset.posted) {
        // user presses the correct key
        dataset.captureExample();
        event.preventDefault();
        return false;
      } else {
        // flash the text to alert the user
        $('.verification').addClass('flash-verification');
        setTimeout(function() {
          $('.verification').removeClass('flash-verification');
        }, 2000);
    
      }
    }

  });

  $('#post-data').click(function(e) {
    if(!dataset.posted){
      // avoid posting multiply times
      dataset.posted = true;
      dataset.postData();
      ui.onPostData();
    }
  });
});
