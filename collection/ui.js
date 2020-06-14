window.ui = {
  state: 'loading',
  readyToCollect: false,
  nExamples: 0,
  nTrainings: 0,

  setContent: function(key, value) {
    // Set an element's content based on the data-content key.
    $('[data-content="' + key + '"]').html(value);
  },

  showInfo: function(text, dontFlash) {
    // Show info and beep / flash.
    this.setContent('info', text);
    if (!dontFlash) {
      $('#info').addClass('flash');
      new Audio('hint.mp3').play();
      setTimeout(function() {
        $('#info').removeClass('flash');
      }, 1000);
    }
  },

  onWebcamEnabled: function() {
    this.state = 'finding face';
    this.showInfo("Thanks! Now let's find your face! 🤨 <br>This may take a while", true);
  },

  onFoundFace: function() {
    if (this.state == 'finding face') {
      this.state = 'collecting';
      this.readyToCollect = true;
      this.showInfo(
        "<h3>Let's start! 🙂</h3>" +
          '<ul><li>Collect data points by following the "butterfly" with your eyes and pressing left/right arrow 👀</li></br>' +
          '<li>You can also delete previous data points one by one by hitting the space key</li></ul>',
        true,
      );
    }
  },

  onAddExample: function(nTrain) {
    // Call this when an example is added.
    this.nExamples = nTrain;
    this.setContent('n-train', nTrain);
    if (nTrain == 5) {
      this.showInfo(
        '<h3>Awesome! 😍</h3>' +
          'You\'ve collected 5 data. Let\'s make it to 100<br>'+
          'Your data points has been stored in our database!'
      );
    } else if (nTrain == 20) {
      this.showInfo(
        '<h3>Keep going! 😍</h3>' +
          'You\'ve collected 20 data. Half way from 100<br>'+
          'Your data points has been stored in our database!'
      );
    } else if (nTrain == 50) {
      this.showInfo(
        '<h3>Keep going! 😍</h3>' +
          'You\'ve collected 50 data. Half way from 100<br>'+
          'Your data points has been stored in our database!'
      );
    } else if (nTrain == 100) {
      this.showInfo(
        '<h3>100!</h3>' +
          'Thank you for contributing to our project!<br>'+
          'Your data points has been stored in our database!<br>'+
          'Feel free to collect more if you want.<br>'+
          'Check out a basic eye tracking website <a href="https://patrickma.me/eye-tracking" target="_blank">here</a> 😄'
      );
    }
  },

  onDeleteExample: function(nTrain){
    this.setContent('n-train', nTrain);
    // this.setContent('n-val', nVal);
    this.showInfo(
      '<h3>Delete successfully 👌</h3>' +
        "You can continue deleting by pressing the space key<br> "
    );
  },

  onFinishTraining: function() {
    // Call this when training is finished.
    this.nTrainings += 1;
    $('#target').css('opacity', '0.9');
    $('#draw-heatmap').prop('disabled', false);
    $('#reset-model').prop('disabled', false);
    $('#store-model').prop('disabled', false);

    if (this.nTrainings == 1) {
      this.state = 'trained';
      this.showInfo(
        '<h3>Awesome! 😍</h3>' +
          'The green target should start following your eyes around.<br>' +
          "I guess it's still very bad... 😅<br>" +
          "Let's collect more training data! Keep following the mouse cursor and hitting space.",
      );
    } else if (this.nTrainings == 2) {
      this.state = 'trained_twice';
      this.showInfo(
        '<h3>Getting better! 🚀</h3>' +
          'Keep collecting and retraining!<br>' +
          'You can also draw a heatmap that shows you where your ' +
          'model has its strong and weak points.',
      );
    } else if (this.nTrainings == 3) {
      this.state = 'trained_thrice';
      this.showInfo(
        'If your model is overfitting, remember you can reset it anytime 👻',
      );
    } else if (this.nTrainings == 4) {
      this.state = 'trained_thrice';
      this.showInfo(
        '<h3>Have fun!</h3>' +
          'Check out the source code at <a href="https://github.com/mapy1874/lookie-lookie" target="_blank">github.com/mapy1874/lookie-lookie</a> 😄',
      );
    }
  }, 
  onPostData: function(){
    $('#post-data').prop('disabled', true);
    this.showInfo(
      '<h3>Thank you for making the world a bit better!</h3>' +
        'Check out a basic eye tracking website <a href="https://patrickma.me/eye-tracking" target="_blank">here</a> 😄',
    );
  }
};
