import time
import gc
from flask import Flask, request
import requests as r
import json
app = Flask(__name__)

#this script will send each file to filereceive 100 times

gc.enable()

@app.route('/file/')
def returnfile(): #filename from sender request
    filename = request.args.get('filename') #how to get url parameter
    print(filename) #testing
    file = open(filename, "rb")
    f = file.read() #reading in file
    file.close()
    gc.collect() #collect garbage
    return f #return bytes of file

if __name__ == '__main__': #start hosting server
    app.run(host='0.0.0.0', threaded=False)