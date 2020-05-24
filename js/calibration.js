class CalibrationPositions {
    constructor(){
        this.i = 0;
        this.positions = [[-1,-1],[1,-1],[1,1],[-1,1],
                        [0, -1],[1,0],[0, 1],[-1,0],
                        [-0.5,-1],[0.5,-1],[1,-0.5],[1,0.5],
                        [0.5,1],[-0.5,1],[-1,0.5],[-1,-0.5],
                        ];
    }
    next() {
        // [width, height]
        let coord =  [this.positions[this.i][0]*0.95,this.positions[this.i][1]*0.95];
        this.i++;
        if (this.i == this.positions.length) {
        this.i = 0;
        }
        return coord;
    }
}
$(document).ready(() => {
    window.calibration = {
        iterator : new CalibrationPositions(),
        /**
         * Get the calibration pointer's current percentage position
         * i.e.: from 0 to 1
         */
        getCurPosition: function() {
            const $pointer = $('#pointer');
            const X = (parseInt($pointer.css("left"),10)/$('body').width());
            const Y = (parseInt($pointer.css("top"),10)/$('body').height());
            console.log(`X:${X}, Y: ${Y}`);
            return [X, Y];
        },

        /**
         * Move the calibration pointer to the next available position
         */
        moveCalibration: function() {
            position = this.iterator.next();
            const pointerWidth = $('#pointer').outerWidth();
            const pointerHeight = $('#pointer').outerHeight();
    
            const x = ((position[0] + 1) / 2) * ($(window).width()-pointerWidth);
            const y = ((position[1] + 1) / 2) * ($(window).height()-pointerHeight);
            // Move pointer there:
            const $pointer = $('#pointer');
            $pointer.css('left', x + 'px');
            $pointer.css('top', y + 'px');
        },
    }
});


