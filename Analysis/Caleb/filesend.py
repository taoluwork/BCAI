import time
import gc
from flask import Flask
import requests as r
import json
app = Flask(__name__)

#this script will send each file to filereceive 100 times

gc.enable()

@app.route('/file')
def returnfile(filename): #filename from sender request
    file = open(filename, "rb")
    f = file.read()
    file.close()
    gc.collect()
    return f

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=False)