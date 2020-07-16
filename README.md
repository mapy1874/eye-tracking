# Eye Tracking for People with ALS

The project is about applying deep learning and computer vision to recognize the eye gaze of physically challenged people (e.g. people with ALS, aka Lou Gehrig’s disease). Right now the project has three parts: Data Collection, Naive Eye Tracking Demo, and Machine Learning Experiment

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

## 3. Machine Learning Experiment

To the date of July 16, 2020, we scored 0.95+ in test on classifying whether the user is looking at left or right. 

We achieve the above test score by applying PCA and logistic regression with L1 regularization after researching advanced methods like transfer learning, convolutional neural network, SVM. To achieve this test score, the data should be those eyes looking at far left/right of the screen. If we use all data in the DB, we can achieve a test score of 0.91+.

Future research should be done on increasing the test score in various ways. We hope a usable website using our ML model will be online in the near future.

## Contributors

Created with TensorFlow.js by [Max Schumacher](https://github.com/cpury). Revised by [Patrick Ma](https://github.com/mapy1874/) under the supervision of [Prof. Gary Bishop](https://www.cs.unc.edu/~gb/).

