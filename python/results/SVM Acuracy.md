
## 1. Features from 3rd max pool in VGG16


```
Model: "model_4"
_________________________________________________________________
Layer (type)                 Output Shape              Param #   
=================================================================
input_1 (InputLayer)         (None, None, None, 3)     0         
_________________________________________________________________
block1_conv1 (**Conv2D**)        (None, None, None, 64)    1792      
_________________________________________________________________
block1_conv2 (Conv2D)        (None, None, None, 64)    36928     
_________________________________________________________________
block1_pool (MaxPooling2D)   (None, None, None, 64)    0         
_________________________________________________________________
block2_conv1 (Conv2D)        (None, None, None, 128)   73856     
_________________________________________________________________
block2_conv2 (Conv2D)        (None, None, None, 128)   147584    
_________________________________________________________________
block2_pool (MaxPooling2D)   (None, None, None, 128)   0         
_________________________________________________________________
block3_conv1 (Conv2D)        (None, None, None, 256)   295168    
_________________________________________________________________
block3_conv2 (Conv2D)        (None, None, None, 256)   590080    
_________________________________________________________________
block3_conv3 (Conv2D)        (None, None, None, 256)   590080    
_________________________________________________________________
block3_pool (MaxPooling2D)   (None, None, None, 256)   0         
=================================================================
Total params: 1,735,488
Trainable params: 1,735,488
Non-trainable params: 0
_________________________________________________________________
```

### 256 features after passing a image through the 3rd max pooling

![](results/../layer3_activation.png)

Extract the features from the 3rd layer and reshape to (None,200704) to feed into a SVM

### Binary classification

SVM binary Accuracy (train): 0.6277695716395865

SVM binary Accuracy (test): 0.863905325443787


### Quaternary classification

SVM Accuracy test: 0.621301775147929


## 2. Features from 2nd max pool in VGG16

```
Model: "model_1"
_________________________________________________________________
Layer (type)                 Output Shape              Param #   
=================================================================
input_1 (InputLayer)         (None, None, None, 3)     0         
_________________________________________________________________
block1_conv1 (Conv2D)        (None, None, None, 64)    1792      
_________________________________________________________________
block1_conv2 (Conv2D)        (None, None, None, 64)    36928     
_________________________________________________________________
block1_pool (MaxPooling2D)   (None, None, None, 64)    0         
_________________________________________________________________
block2_conv1 (Conv2D)        (None, None, None, 128)   73856     
_________________________________________________________________
block2_conv2 (Conv2D)        (None, None, None, 128)   147584    
_________________________________________________________________
block2_pool (MaxPooling2D)   (None, None, None, 128)   0         
=================================================================
Total params: 260,160
Trainable params: 260,160
Non-trainable params: 0
_________________________________________________________________
```

### 64 features after passing a image through the 3rd max pooling

![](results/../layer2_activation.png)


Extract the features from the 2nd layer and reshape to (None, 401408) to feed into a SVM

### Binary classification

SVM binary train Accuracy: 0.9409158050221565

SVM binary test Accuracy: 0.8816568047337278


### Quaternary classification

SVM train quaternary Accuracy: 0.7872968980797637

SVM test Accuracy: 0.5976331360946746


## 3. Features from PCA

Actually takes longer to predict SVD is harder to be performed

We need to do another grid search
```
CPU times: user 1h 17min 8s, sys: 5min 22s, total: 1h 22min 30s
Wall time: 21min 14s
{'svc__C': 1, 'svc__gamma': 0.0001}
```

Testing:

```
                precision    recall  f1-score   support

           0       0.88      0.84      0.86        89
           1       0.83      0.88      0.85        80

    accuracy                           0.86       169
   macro avg       0.86      0.86      0.86       169
weighted avg       0.86      0.86      0.86       169
```