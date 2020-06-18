import json
import ijson
import base64
import cv2
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os.path

def create_dataframe():
    """
    convert the JSON file of my research into a dataframe with the following columns:
    eyeImage: np array with shape (25, 50, 3)
    leftEye: np array with shape (6,2): 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    rightEye: np array with shape (6,2): 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
    """
    f = open(os.path.join(os.path.dirname(__file__))+'/../dataset.json')
    eyeImages,leftEyes,rightEyes,ys = [], [], [], []
    for item in ijson.items(f, "item"):
        # convert the string into a python dict
        temp = json.loads(item) 
        # convert the image into the np array
        eyeImage = convert_base64_to_nparray(temp["x"]["eyeImage"])
        eyeImages.append(eyeImage)

        leftEye = np.array(temp["x"]["eyePositions"]["leftEye"])
        leftEyes.append(leftEye)
        rightEye = np.array(temp["x"]["eyePositions"]["rightEye"])
        rightEyes.append(rightEye)

        y = np.array(temp["y"])
        ys.append(y)

    list_of_tuples = list(zip(eyeImages,leftEyes,rightEyes,ys))
    df = pd.DataFrame(list_of_tuples, columns =['eyeImage','leftEye', 'rightEye', 'y'])
    x_train = df.loc[:,["eyeImage","leftEye","rightEye"]]
    y_train = df.loc[:,["y"]]
    return x_train, y_train

def convert_base64_to_nparray(image_data):
    """
    takes in *a* base64 encoding image and convert it into a numpy array
    """
    image = image_data.split(",")[1]
    image = np.asarray(bytearray(base64.b64decode(image)), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image

def create_binary_labels(y_labels):
    """
    takes in our original y labels, each label is in the form of [x,y]
    convert the original labels into a new y labels which is "R" when x>0, "L" elsewise
    input:
        y_labels: a 1*n pandas df with its element in the form of [x,y]
    output:
        a converted binary label with its element == R if x>0 eles L
    """
    binary_labels = pd.DataFrame().reindex_like(y_labels)
    isRight = y_labels["y"].map(lambda x: x[0]) >0
    binary_labels.loc[isRight] = "R"
    binary_labels.loc[~isRight] = "L"
    return binary_labels

def create_quaternary_labels(y_labels):
    """
    takes in our original y labels, each label is in the form of [x,y]
    convert the original labels into a new y labels which has the following encoding:
        UR: upperright, where x>0, y<=0
        UL: upperleft, where x<=0, y<=0
        LR: lowerright, where x>0, y>0
        LL: lowerleft, where x<=0, y>0
    input:
        y_labels: a 1*n pandas df with its element in the form of [x,y]
    output:
        a converted binary label with the described four encoding, which may be used in quaternary classification
    """
    quanternary_labels = pd.DataFrame().reindex_like(y_labels)
    isRight = y_labels["y"].map(lambda x: x[0]) > 0
    isLower = y_labels["y"].map(lambda x: x[1]) > 0
    quanternary_labels.loc[isRight & ~isLower] = "UR"
    quanternary_labels.loc[~isRight & ~isLower] = "UL"
    quanternary_labels.loc[isRight & isLower] = "LR"
    quanternary_labels.loc[~isRight & isLower] = "LL"
    return quanternary_labels