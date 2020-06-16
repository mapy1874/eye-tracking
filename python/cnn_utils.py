import json
import ijson
import base64
import cv2
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def create_dataframe():
    """
    convert the JSON file of my research into a dataframe with the following columns:
    eyeImage: np array with shape (25, 50, 3)
    leftEye: np array with shape (6,2): 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    rightEye: np array with shape (6,2): 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
    """
    f = open('/Users/patrick/OneDrive - University of North Carolina at Chapel Hill/SMART_research/lookie-lookie/dataset.json')
    eyeImages,leftEyes,rightEyes,ys = [], [], [], []
    for item in ijson.items(f, "item"):
        # convert the string into a python dict
        temp = json.loads(item) 
        # convert the image into the np array
        eyeImage = convert_base64_to_nparray(temp["x"]["eyeImage"])
        eyeImages.append(eyeImage)

        leftEye = np.array(temp["x"]["eyePositions"]["leftEye"])
        leftEyes.append(leftEye)
        print(leftEye.shape)
        rightEye = np.array(temp["x"]["eyePositions"]["rightEye"])
        rightEyes.append(rightEye)

        y = np.array(temp["y"])
        ys.append(y)

    list_of_tuples = list(zip(eyeImages,leftEyes,rightEyes,ys))
    df = pd.DataFrame(list_of_tuples, columns =['eyeImage','leftEye', 'rightEye', 'y'])
    print(df["leftEye"][0])
    df.to_csv('experiment.csv',na_rep='Unkown') # missing value save as Unknown
    return df

def convert_base64_to_nparray(image_data):
    image = image_data.split(",")[1]
    image = np.asarray(bytearray(base64.b64decode(image)), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image

create_dataframe()
