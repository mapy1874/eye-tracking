# lookie-lookie

This is a demo project to try out TensorFlow.js. It's a website that learns to
track your eye movement inside the browser. No backend neccessary.

[Demo](https://mapy1874.github.·io/eye-tracking/)

## How to use

Open index.html in a modern browser like Chrome or Firefox. A tutorial will
guide you through it.

## Dataset
We collect data from users [here](http://patrickma.me/eye-tracking/collection/collection.html). The data is collected in the following format:

1. User's eye image, 25\*50\*3

1. The relative positions of the rectangular surrounding user's eyes in the video. we denote the rectangular in (centerX, centerY, width, hieght), all of these parameters are between 0 and 1.

1. The relative position (x,y) that the user looks at in the browser, where 0<=x,y<=1, (0,0) means upper left corner of the browser.
 

## Contributors

Created with TensorFlow.js by [Max Schumacher](https://github.com/cpury). Revised by [Patrick Ma](https://github.com/mapy1874/) under the supervision of [Prof. Gary Bishop](https://www.cs.unc.edu/~gb/).