# Eye Tracking for Physically Challenged People

The project is about applying deep learning and computer vision to recognize the eye gaze of physically challenged people (e.g. people with ALS, aka Lou Gehrig’s disease). Right now the project has three parts: Data Collection, Naive Eye Tracking Demo, and Tensorflow Processing

## 1. Data Collection

We collect data from users [here](https://patrickma.me/eye-collection/). A single data point is collected in the following format:

```{json}
{
    x: {
        eyeImage: <key>,
        eyePositions: {
            leftEye: <key>,
            rightEye: <key>
        }
    },
    y: <key>
}
```

1. eyeImage: Base64 encoding of the user's eye image, 25\*50\*3

2. leftEye: 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1

3. rightEye: 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1

4. y: The relative position (x,y) that the user looks at in the browser, where -1<=x,y<=1, (-1,-1) means upper left corner of the browser.

    Here are the landmarks and their indexes:

    ![landmarks](landmarks_68.png)

## 2. Naive Eye Tracking Demo

You may play with the demo [here](https://mapy1874.github.·io/eye-tracking/). This is a client-side project, meaning your data **won't** be sent to our database. Contribute to our project by visiting the collection webpage

## 3. Tensorflow Processing

## Contributors

Created with TensorFlow.js by [Max Schumacher](https://github.com/cpury). Revised by [Patrick Ma](https://github.com/mapy1874/) under the supervision of [Prof. Gary Bishop](https://www.cs.unc.edu/~gb/).