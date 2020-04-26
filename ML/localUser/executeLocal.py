
import os
from flask import Flask
import requests as r
import time
import threading
from datetime import datetime

def getTime(mess):
    now = datetime.now()
    end = open('log.txt', 'r').readline().rstrip()[24:]
    #print(now.strftime("%a %b %d %Y %H:%M:%S" + end))
    time = now.strftime("%a %b %d %Y %H:%M:%S" + end)
    f = open('log.txt', 'a')
    f.write(time + " "+ mess)
    f.close()

def loop():
    while True:
        time.sleep(5)
        ##check file##
        statF=open("stat.txt", "r")
        reqIp = statF.readline().rstrip()
        statF.close()
        if reqIp != '' and reqIp != 'Executing' and reqIp != 'Ready':
            statF=open("stat.txt", 'w')
            statF.close()
            statF=open("stat.txt", 'w')
            statF.write("Executing")
            statF.close()

            getTime("Requesting Files")

            res = r.get('http://' + reqIp + '/files')

            getTime("Image Files Recieved")

            ##removes file
            os.system("sudo rm -rf image.*")
            
            getTime("Writing Image to File")
            
            open('image.zip', 'wb').write(res.content)
            #res = r.get('http://' + reqIp + '/exit')
            os.system("unzip image.zip")

            getTime("File ready")

            os.system("sudo docker load -i image.tgz")
            
            getTime("Docker Script Loaded")

            statF=open("stat.txt", 'w')
            statF.close()
            statF=open("stat.txt", 'w')
            statF.write("Ready")
            statF.close()

#########file server###########
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello World!"

@app.route('/files')
def fileRead():
    if os.path.isfile('image.zip'):
        f = open('image.zip' , 'rb') 
        getTime("File Requested")
        return f.read()
    else:
        return b'err'

if __name__ == '__main__':
    t1 = threading.Thread(target=loop)
    t1.start()
    app.run(host='0.0.0.0', threaded=False)