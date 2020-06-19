import json
import ijson
import base64
import cv2
import random
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

        leftEye = np.array(temp["x"]["eyePositions"]["leftEye"]).reshape(12)
        leftEyes.append(leftEye)
        rightEye = np.array(temp["x"]["eyePositions"]["rightEye"]).reshape(12)
        rightEyes.append(rightEye)

        y = np.array(temp["y"])
        ys.append(y)

    list_of_tuples = list(zip(eyeImages,leftEyes,rightEyes,ys))
    df = pd.DataFrame(list_of_tuples, columns =['eyeImage','leftEye', 'rightEye', 'y'])
    return df

def create_train_validation(df, train_percentage=0.7):
    """
    Take in original dataframe and split it into train&validation set
    Follow the 70/30 convention
    input:
        df
    output:
        X_train
        X_validation
        Y_train,
        Y_validation
    """
    train = df.sample(frac=train_percentage).sort_index()
    validation = df.drop(train.index).sort_index()
    return train.iloc[:,0:3], validation.iloc[:,0:3], pd.DataFrame(train.iloc[:,-1]), pd.DataFrame(validation.iloc[:,-1])

def convert_base64_to_nparray(image_data):
    """
    takes in *a* base64 encoding image and convert it into a numpy array
    every element in the array ranges from 0 to 1
    """
    image = image_data.split(",")[1]
    image = np.asarray(bytearray(base64.b64decode(image)), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)/255.
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

def plot_eyeImages(X, Y):
    """
    Plot 30 images with their labels in a 5*6 grid
    Input:
        X: a df with column eyeImage
        Y: a df with column y
    Return:
        None
    """
    indexes = np.array(random.sample(range(len(Y)), 30))
    indexes.sort()    
    images_arr = X["eyeImage"].iloc[indexes]
    labels_arr = Y["y"].iloc[indexes]
    fig, axes = plt.subplots(5, 6, figsize=(20,12.5))
    axes = axes.flatten()
    for img, ax, label, index in zip(images_arr, axes, labels_arr, indexes):
        ax.imshow(img)
        ax.set_title("idx: "+str(index)+" label: "+label,fontdict = {'fontsize': 20})
    plt.tight_layout()
    plt.show()