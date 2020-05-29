class CalibrationPositions {
    constructor(){
        this.i = 0;
        this.positions = [[-1,-1],[-1/3,-1],[1/3,-1],[1,-1],
                        [-1,-1/3],[-1/3,-1/3],[1/3,-1/3],[1,-1/3],
                        [-1,1/3],[-1/3,1/3],[1/3,1/3],[1,1/3],
                        [-1,1],[-1/3,1],[1/3,1],[1,1]
                        ];
    }
    next() {
        // [width, height]
        this.i = Math.floor(Math.random()*this.positions.length)
        let coord =  [this.positions[this.i][0]*0.9,this.positions[this.i][1]*0.9];
        return coord;
    }
}
$(document).ready(() => {
    window.calibration = {
        iterator : new CalibrationPositions(),
        proceedKey: "left", // record which key is required to proceed to next butterfly position
        /**
         * Get the calibration pointer's current percentage position
         * i.e.: from 0 to 1
         */
        getCurPosition: function() {
            const $pointer = $('#pointer');
            const X = (parseInt($pointer.css("left"),10)/$('body').width());
            const Y = (parseInt($pointer.css("top"),10)/$('body').height());
            return [X, Y];
        },

        /**
         * Move the calibration pointer to the next available position
         */
        moveCalibration: function() {
            position = this.iterator.next();
            const pointerWidth = $('#pointer').outerWidth();
            const pointerHeight = $('#pointer').outerHeight();

            const $pointer = $('#pointer');
            const oldX = parseInt($pointer.css("left"),10);
            const oldY = parseInt($pointer.css("top"),10);
            const nextX = ((position[0] + 1) / 2) * ($(window).width()-pointerWidth);
            const nextY = ((position[1] + 1) / 2) * ($(window).height()-pointerHeight);
            // Move pointer there:
            const deltaX = (nextX-oldX)/100;
            const deltaY = (nextY-oldY)/100;
            let x = oldX;
            let y = oldY;

            let id = requestAnimationFrame(frame);
            function frame() {
                if (Math.abs(nextX-x)<10e-3) {
                    // give user different instruction
                    if (Math.random()>0.5){
                        proceedKey = "left";
                        $('.verification').
                            html("press LEFT arrow <div><strong>&larr;</strong></div>");
                    } else {
                        proceedKey = "right";
                        $('.verification').
                            html("press RIGHT arrow <div><strong>&rarr;</strong></div>");
                    }
                    cancelAnimationFrame(id);
                } else {
                  x+=deltaX;
                  y+=deltaY; 
                  $pointer.css('left', x + 'px');
                  $pointer.css('top', y + 'px');
                  id = requestAnimationFrame(frame);
                }
              }
            },

            /**
             * get the proceed Key for moving the butterfly
             */
            getProceedKey: function(){
                return proceedKey;
            }
        }
});


