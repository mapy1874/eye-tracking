# lookie-lookie

This is a demo project to try out TensorFlow.js. It's a website that learns to
track your eye movement inside the browser. No backend neccessary.

[Demo](https://mapy1874.github.·io/eye-tracking/)

## How to use

Open index.html in a modern browser like Chrome or Firefox. A tutorial will
guide you through it.

## Dataset
We collect data from users [here](https://patrickma.me/eye-tracking/collection/collection.html). The data is collected in the following format:

1. Base64 encoding of the user's eye image, 25\*50\*3

1. leftEye: 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1

1. rightEye: 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1

Here are the landmarks and their indexes:

![landmarks](landmarks_68.png)

1. The relative position (x,y) that the user looks at in the browser, where -1<=x,y<=1, (-1,-1) means upper left corner of the browser.
 

## Contributors

Created with TensorFlow.js by [Max Schumacher](https://github.com/cpury). Revised by [Patrick Ma](https://github.com/mapy1874/) under the supervision of [Prof. Gary Bishop](https://www.cs.unc.edu/~gb/).