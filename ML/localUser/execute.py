import os
from flask import Flask
import requests as r
import time
import threading

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

            res = r.get('http://' + reqIp + '/files')
            ##removes file
            os.system("sudo rm -rf image.*")
            open('image.zip', 'wb').write(res.content)
            res = r.get('http://' + reqIp + '/exit')
            os.system("unzip image.zip")

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
        return f.read()
    else:
        return b'err'

if __name__ == '__main__':
    t1 = threading.Thread(target=loop)
    t1.start()
    app.run(host='0.0.0.0', threaded=False)
    