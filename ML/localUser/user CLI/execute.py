import os
import sys
from flask import Flask
import requests as r
import time
import json
from signal import signal, SIGINT

# 0-> provider
# 1-> validator
mode = sys.argv[1]
ip   = sys.argv[2]
file = sys.argv[3]
print('FILE PROCESS BEGINNING')


if file == 'none':
    res = None
    if len(sys.argv) == 3:
        ip = sys.argv[1]
        file = sys.argv[2]
    if file == 'none' and ip != 'none':
        print('requesting files from: ' + ip)
        res = r.get('http://' + ip + '/files')
        open('image.zip', 'wb').write(res.content)
        res = r.get('http://' + ip + '/exit')
        #unzip file (!!!!assume that image.zip is created by cli!!!!)
        os.system("unzip image.zip")

else:
    app = Flask(__name__)
    f = open(file , 'rb')
    
    @app.route('/')
    def hello():
        return "Hello World!"

    @app.route('/files')
    def fileRead():
        file = f.read()
        print(type(file))
        data = file 
        return data
    
    @app.route('/exit')
    def exit():
        os.kill(os.getpid(), SIGINT)
        return "BYE"

    if __name__ == '__main__':
        app.run()
        