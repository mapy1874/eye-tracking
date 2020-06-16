import json
import ijson
import base64
import cv2
import pandas as pd
import numpy as np

def create_dataframe():
    """
    convert the JSON file of my research into a dataframe with the following columns:
    eyeImage: np array with shape (25, 50, 3)
    leftEye: 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    rightEye: 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
    """
    f = open('/Users/patrick/OneDrive - University of North Carolina at Chapel Hill/SMART_research/lookie-lookie/dataset.json')
    eyeImage,leftEye,rightEye,y = [], [], [], []
    for item in ijson.items(f, "item"):
        temp = json.loads(item) # convert the string into a python dict
        eyeImage.append(temp["x"]["eyeImage"].split(",")[1])
        leftEye.append(temp["x"]["eyePositions"]["leftEye"])
        rightEye.append(temp["x"]["eyePositions"]["rightEye"])
        y.append(temp["y"])

    list_of_tuples = list(zip(eyeImage,leftEye,rightEye,y))
    df = pd.DataFrame(list_of_tuples, columns =['eyeImage','leftEye', 'rightEye', 'y'])
    print(df["leftEye"][100:120])
    return df

create_dataframe()
img_data = "data:image/png;base64,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"

filename = 'some_image.jpg'  # I assume you have a way of picking unique filenames
with open(filename, 'wb') as f:
        f.write(base64.b64decode(img_data[22:]))

image = np.asarray(bytearray(base64.b64decode(img_data[22:])), dtype="uint8")
image = cv2.imdecode(image, cv2.IMREAD_COLOR)
print(type(image))
print(image.shape)
# data = json.load(f)
# temp = json.loads(data[0]) # convert the string into a python dict
# print(type(data)) # list
# print(type(data[0])) # str
# print(temp["x"]["eyeImage"]) # should use the dict in this way
