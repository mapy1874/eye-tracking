class CalibrationPositions {
    constructor(){
        this.i = 0;
        this.positions = [[-1,-1],[-1/3,-1],[1/3,-1],[1,-1],
                        [-1,-1/3],[-1/3,-1/3],[1/3,-1/3],[1,-1/3],
                        [-1,1/3],[-1/3,1/3],[1/3,1/3],[1,1/3],
                        [-1,1],[-1/3,1],[1/3,1],[1,1]
                        ];
        this.lastLast = [100,100];
    }
    next() {
        if (this.i == 0){   
            // record the last position of the last shuffled array
            this.lastLast = this.positions[this.positions.length-1]
            this.shuffle();
            if (Math.abs(this.positions[0][0]-this.lastLast[0])<1e-6 && Math.abs(this.positions[0][1]-this.lastLast[0][1])<1e-6){
                // the butterfly won't move as the last pos of the last array is the same as the first pos of this array
                this.i += 1;
            }
        }
        let coord =  [this.positions[this.i][0]*0.9,this.positions[this.i][1]*0.9];
        this.i = (this.i + 1)%this.positions.length;
        return coord;
    }
    shuffle(){
        // shuffle the positions
        
        for(let k = this.positions.length-1; k > 0; k--){
            const j = Math.floor(Math.random() * k)
            const temp = this.positions[k]
            this.positions[k] = this.positions[j]
            this.positions[j] = temp
        }
    }
}
$(document).ready(() => {
    window.calibration = {
        iterator: new CalibrationPositions(),
        moving: true, // record whether the butterfly is moving
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
        moveCalibration: async function() {
            position = this.iterator.next();
            // clear the prompt till the butterfly arrive at the next position
            $('.verification').html("");
            calibration.moving = true;

            const $pointer = $('#pointer');
            const oldX = parseInt($pointer.css("left"),10);
            const oldY = parseInt($pointer.css("top"),10);
            const nextX = ((position[0] + 1) / 2) * ($(window).width());
            const nextY = ((position[1] + 1) / 2) * ($(window).height());
            // Move pointer there:
            const deltaX = (nextX-oldX)/100;
            const deltaY = (nextY-oldY)/100;
            let x = oldX;
            let y = oldY;

            let id = requestAnimationFrame(frame);
            function frame() {
                if (Math.abs(nextX-x)<10e-3&&Math.abs(nextY-y)<10e-3) {
                    // give user different instruction
                    if (Math.random()>0.5){
                        proceedKey = "left";
                        $('.verification').
                            html("<div><strong>&larr;</strong></div>");
                    } else { 
                        proceedKey = "right";
                        $('.verification').
                            html("<div><strong>&rarr;</strong></div>");
                    }

                    // make the arrow be at the top of the butterfly if it is at the bottom
                    if (nextY>0.85*$(window).height()){
                        $('.verification').css({"top": "-40px"});
                    } else{
                        $('.verification').css({"top": "20px"});
                    }

                    cancelAnimationFrame(id);
                    calibration.moving = false;
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


