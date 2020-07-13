import json
import ijson
import base64
import cv2
import random
import requests
import matplotlib.pyplot as plt
from PIL import Image
import pandas as pd
import numpy as np
import os.path
import decimal

def create_dataframe(relative_dir ='/../raw_data/dataset_062120.json', image_size=(224,224)):
    """
    convert the JSON file of my research into a dataframe with the following columns:
    eyeImage: np array with shape @image_size
    leftEye: np array with shape (6,2): 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    rightEye: np array with shape (6,2): 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
    """

    f = open(os.path.join(os.path.dirname(__file__))+relative_dir)
    eyeImages,leftEyes,rightEyes,ys = [], [], [], []

    # for dealing with error in json.dumps
    def decimal_default(obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        raise TypeError

    for item in ijson.items(f, "item"):
        # convert the string into a python dict
        temp = json.dumps(item, default=decimal_default)
        temp = json.loads(temp) 
        # convert the image into the np array
        eyeImage = convert_base64_to_nparray(temp["x"]["eyeImage"],image_size)
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

# def create_dataframe(relative_dir ='/../raw_data/dataset_062120.json' ):
#     """
#     convert the JSON file of my research into a dataframe with the following columns:
#     eyeImage: np array with shape (25, 50, 3)
#     leftEye: np array with shape (6,2): 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
#     rightEye: np array with shape (6,2): 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
#     y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
#     """
#     f = open(os.path.join(os.path.dirname(__file__))+relative_dir)
#     eyeImages,leftEyes,rightEyes,ys = [], [], [], []
#     for item in ijson.items(f, "item"):
#         # convert the string into a python dict
#         temp = json.loads(item) 
#         # convert the image into the np array
#         eyeImage = convert_base64_to_nparray(temp["x"]["eyeImage"])
#         eyeImages.append(eyeImage)

#         leftEye = np.array(temp["x"]["eyePositions"]["leftEye"]).reshape(12)
#         leftEyes.append(leftEye)
#         rightEye = np.array(temp["x"]["eyePositions"]["rightEye"]).reshape(12)
#         rightEyes.append(rightEye)

#         y = np.array(temp["y"])
#         ys.append(y)

#     list_of_tuples = list(zip(eyeImages,leftEyes,rightEyes,ys))
#     df = pd.DataFrame(list_of_tuples, columns =['eyeImage','leftEye', 'rightEye', 'y'])
#     return df

def create_train_validation(df, train_percentage=0.8):
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

def convert_base64_to_nparray(image_data, image_size):
    """
    takes in *a* base64 encoding image and convert it into a numpy array of shape (256,256,3)
    every element in the array ranges from 0 to 1
    """
    image = image_data.split(",")[1]
    image = np.asarray(bytearray(base64.b64decode(image)), dtype="uint8")
    image = cv2.imdecode(image, cv2.COLOR_BGR2RGB)
    res = cv2.resize(image, dsize=image_size, interpolation=cv2.INTER_CUBIC)
    # get a normal color as the openCV use BGR in default
    RGB_img = cv2.cvtColor(res, cv2.COLOR_BGR2RGB)
    RGB_img = RGB_img/255.
    return RGB_img


def save_jpgs(relative_dir ='/../raw_data/dataset_062120.json' ):
    """
    convert the JSON file of my research into a dataframe with the following columns:
    eyeImage: np array with shape (25, 50, 3)
    leftEye: np array with shape (6,2): 6 left eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    rightEye: np array with shape (6,2): 6 right eye landmarks positions in the form of (x,y), where -1<=x,y<=1
    y: the position that the user looks at on the screen in the form of (x,y), where -1<=x,y<=1
    """
    f = open(os.path.join(os.path.dirname(__file__))+relative_dir)
    i = 0
    for item in ijson.items(f, "item"):
        # convert the string into a python dict
        temp = json.loads(item) 
        # convert the image into the np array
        eyeImage = save_nparray_to_jpg(temp["x"]["eyeImage"],i)
        i += 1

def save_nparray_to_jpg(image_data,idx):
    image = image_data.split(",")[1]
    image = np.asarray(bytearray(base64.b64decode(image)), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    im = Image.fromarray(image)
    im.save("image_data/"+str(idx)+".jpeg")

    

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
        0: upperleft, where x<=0, y<=0
        1: upperright, where x>0, y<=0
        2: lowerright, where x>0, y>0
        3: lowerleft, where x<=0, y>0
    input:
        y_labels: a 1*n pandas df with its element in the form of [x,y]
    output:
        a converted binary label with the described four encoding, which may be used in quaternary classification
    """
    quanternary_labels = pd.DataFrame().reindex_like(y_labels)
    isRight = y_labels["y"].map(lambda x: x[0]) > 0
    isLower = y_labels["y"].map(lambda x: x[1]) > 0
    quanternary_labels.loc[~isRight & ~isLower] = "UL"
    quanternary_labels.loc[isRight & ~isLower] = "UR"
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
        ax.set_xlabel("idx: "+str(index)+" label: "+label,fontdict = {'fontsize': 20})
    plt.tight_layout()
    plt.show()

    
def create_tf_data(X, Y):
    """
    take in the X and Y and transform each column into np array
    Every column in X will be substracted from its mean
    """
    
    eyeImage = np.stack(X['eyeImage'].to_numpy())
    image_mean = np.mean(eyeImage, axis=0)
    eyeImage = eyeImage-image_mean

    leftEye = np.stack(X['leftEye'].to_numpy())
    leftEye_mean = np.mean(leftEye, axis=0)
    leftEye = leftEye-leftEye_mean

    rightEye = np.stack(X['rightEye'].to_numpy())
    rightEye_mean = np.mean(rightEye, axis=0)
    rightEye = rightEye-rightEye_mean

    y = np.stack(Y['y'].to_numpy())
    return eyeImage, leftEye, rightEye, y


def create_df_with_ids():
    """
    request all good data from the API and return a new dataframe
    The dataframe has the following column:
        id: int, the actual id of the data in the database
        eyeImage: String, the base64 encoding of an 25*50 eye image
        leftEye: array of shape (6,2), the 6 landmark positions of the left eyes
        rightEye: array of shape (6,2), the 6 landmark positions of the right eyes
        y: array of shape (2,) the position that the user looking at
        * leftEye, rightEye, y are represented from -1<=x,y<1, where (-1,-1) denotes the upper left of the screen
    """
    # request the available ids
    data = requests.get("https://gb.cs.unc.edu/json/drop",headers= { "Accept": "application/json" })
    available_ids = []
    for drop in data.json()['drops']:
        available_ids.append(drop['id'])

    # There are some bad ids that we have discovered
    # load the recording file and exclude them
    # One can get bad ids from http://patrickma.me/simple_filter/
    with open('bad_indexes.json') as file:
        bad_ids = json.load(file)

    # get the ids we want to put in our dataframe
    valid_ids = [x for x in available_ids if x not in bad_ids]

    # request data from our API
    allData = []
    for valid_id in valid_ids:
        data = requests.get('https://gb.cs.unc.edu/json/drop/'+str(valid_id))
        allData.append(data.json())

    # create the data frame
    eyeImages,leftEyes,rightEyes,ys = [], [], [], []

    for temp in allData:
        eyeImages.append(temp["x"]["eyeImage"])

        leftEye = np.array(temp["x"]["eyePositions"]["leftEye"])
        leftEyes.append(leftEye)
        rightEye = np.array(temp["x"]["eyePositions"]["rightEye"])
        rightEyes.append(rightEye)

        y = np.array(temp["y"])
        ys.append(y)

    list_of_tuples = list(zip(valid_ids, eyeImages,leftEyes,rightEyes,ys))
    df = pd.DataFrame(list_of_tuples, columns =['id','eyeImage','leftEye', 'rightEye', 'y'])

    return df


def verify_df(df):
    """
    take in a dataframe with id of each images and 
    return the ids of the row that does not match the actual data in the database
    parameter: df with columns id, eyeImage, leftEye, rightEye, y
    return: a list of bad ids
    """
    ## Validate that the data frame has the same result from the API
    bad_data_ids = []
    for _, row in df.iterrows():
        id = row["id"]
        eyeImage = row["eyeImage"]
        leftEye = row["leftEye"]
        rightEye = row["rightEye"]
        y = row["y"]

        data = requests.get('https://gb.cs.unc.edu/json/drop/'+str(id))
        data = data.json()
        if str(eyeImage) != str(data["x"]["eyeImage"]) or not (leftEye == data["x"]["eyePositions"]["leftEye"]).all() or not (rightEye == data["x"]["eyePositions"]["rightEye"]).all() or not (y == data["y"]).all():
            bad_data_ids.append(id)

    return bad_data_ids


def test_robustness(df):
    """
    For testing the robustness of our PCA+SVM model when we split the train and test randomly
    """
    train_scores, test_scores = [], []
    for i in range(200):
        X_train, X_test, y_train, y_test = train_test_split(df.loc[:,df.columns!="y"],df.loc[:,df.columns=="y"], test_size=0.3)

        eyeImage_train = np.stack(X_train['eyeImage'].to_numpy())
        eyeImage_test = np.stack(X_test['eyeImage'].to_numpy())
        y_train_binary = create_binary_labels(y_train)
        y_test_binary = create_binary_labels(y_test)

        # reshape to make it possible to feed into SVM
        eyeImage_train = eyeImage_train.reshape(eyeImage_train.shape[0],eyeImage_train.shape[1]*eyeImage_train.shape[2]*eyeImage_train.shape[3])
        eyeImage_test = eyeImage_test.reshape(eyeImage_test.shape[0],eyeImage_test.shape[1]*eyeImage_test.shape[2]*eyeImage_test.shape[3])
        pca = PCA(n_components=150, whiten=True, random_state=42)
        svc = SVC(kernel='linear', C=0.05)
        svm_model = make_pipeline(pca, svc)
        svm_model.fit(eyeImage_train, y_train_binary)
        # param_grid = {'svc__C': [100,50,10,5,1,0.5,0.1, 0.05, 0.01, 0.005, 0.001]}
        # grid = GridSearchCV(svm_model, param_grid)
        # %time grid.fit(eyeImage_train, y_train_binary)
        # print(grid.best_params_)

        # svm_model = grid.best_estimator_

        train_score = svm_model.score(eyeImage_train, y_train_binary, sample_weight=None)
        test_score = svm_model.score(eyeImage_test, y_test_binary, sample_weight=None)

        train_scores.append(train_score)
        test_scores.append(test_score)
        svm_model = None

    data = {'train_score':train_scores, 'test_score':test_scores}

    return pd.DataFrame(data)