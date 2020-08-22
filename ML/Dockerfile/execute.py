import tensorflow as tf
from tensorflow import keras
import numpy as np
import sys

#sys.argv[1] definition
#0->providor
#1->validator


#data section
(trainData, trainLabel), (testData,testLabel) = keras.datasets.mnist.load_data()
trainData=trainData/ 255.0
testData= testData/255.0

#create model
if sys.argv[1] == '0':
  mod = keras.Sequential([
    keras.layers.Conv1D(64, 2, padding="same", activation=tf.nn.relu, input_shape=(28,28)),
    keras.layers.Conv1D(64, 2, padding="same", activation=tf.nn.relu),
    keras.layers.MaxPooling1D(2),
    keras.layers.Dropout(.25),
    keras.layers.BatchNormalization(),
    keras.layers.Flatten(),
    keras.layers.Dense(128, activation=tf.nn.relu),
    keras.layers.Dense(10, activation=tf.nn.softmax)
    ])
else:
  mod =  keras.models.load_model("result.h5")


mod.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

if sys.argv[1] == '0':
  mod.fit(trainData, trainLabel, epochs=2)
  mod.save('result.h5') 
loss, acc = mod.evaluate(testData, testLabel)
print('acc: ', acc)
print('loss: ',loss)