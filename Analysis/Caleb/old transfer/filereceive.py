import time
import gc
from flask import Flask
import requests as r
import json
app = Flask(__name__)

#this script will request each file 100 time

gc.enable()
filenames = ["1MB.txt", "10MB.txt", "100MB.txt", "1GB.txt"]
for j in range(0, 4): #run once for each file size in above list
    times = []
    sum = 0
    for i in range(0, 100): #100 iterations
        start = int(round(time.time() * 1000)) #start time in ms
        res = r.get('http://130.39.223.54:5000/file?filename=' + filenames[j]) #wait until response given
        timetaken = int(round(time.time() * 1000)) - start #diff between current and start time
        times.append(timetaken) #add to list
    for i in range(0, 100): #make sum so we can find average
        sum += times[i]
    print("Avg time taken for " + filenames[j] + ": " + str(sum / 100) + " milliseconds")