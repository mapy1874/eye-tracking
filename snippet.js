function moveTarget() {
    // Move the model target to where we predict the user is looking to
    if (training.currentModel == null || training.inTraining) {
    window.requestAnimationFrame(moveTarget);
    return;
    }
    console.log("RAF called!");
    training.getPrediction().then(prediction => {
    const left = prediction[0] * ($('body').width() - targetSize);
    const top = prediction[1] * ($('body').height() - targetSize);
    console.log(`left:${left}, top: ${top}`);
    $target.css('left', left + 'px');
    $target.css('top', top + 'px');
    window.requestAnimationFrame(moveTarget);
    });
  }
  setInterval(moveTarget);