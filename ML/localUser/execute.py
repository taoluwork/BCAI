import os
#from flask import Flask
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

#Overall flow:
#1) Start loop thread and onionshare thread, wait for onionshare.txt to contain address
#2) Once onionshare.txt contains address onionshare has started, write address to onionaddr.txt
#3) Wait for a GET request in onionshare.txt, means worker has received file
### Write "Executing" to stat.txt
#4) Wait for stat.txt to contain an onion address, means worker has completed execution, 
## and result file is being hosted at that address. Make TOR get request
#5) Download completed result file
### Write "Ready" to stat.txt

def loop():
    while True:
        time.sleep(5)
        ##check file##
        statF=open("stat.txt", "r")
        status = statF.readline().rstrip()
        statF.close()
        #if file ready to be received from worker. Status will hold the .onion address
        if status != '' and status != 'Executing' and status != 'Ready':
            getTime("Requesting Files")
            #res = r.get('http://' + reqIp + '/files')
            #onionshare GET
            session = r.session()
            session.proxies = {}
            session.proxies['http'] = 'socks5h://localhost:9050'
            session.proxies['https'] = 'socks5h://localhost:9050'

            res = session.get(status + '/image.zip')

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
        elif status == "": #file not yet received
            onionshareLog = open("onionshare.txt", 'r')
            lines = onionshareLog.readlines()
            while lines != "":
                if (lines[0:4] == "http" and address == ""): #found address
                    address = lines
                    statF=open("onionaddr.txt", 'w')
                    statF.close()
                    statF=open("onionaddr.txt", 'w')
                    statF.write(lines)
                    statF.close()
                elif ("GET" in lines): #file has been received
                    t2._stop() #kill thread
                    statF=open("stat.txt", 'w')
                    statF.close()
                    statF=open("stat.txt", 'w')
                    statF.write("Executing")
                    statF.close()
                lines = onionshareLog.readlines()

def startshare():
    #start onionshare server to host file
    os.system("~/onionshare/dev_scripts/onionshare --website image.zip > onionshare.txt")

t1 = threading.Thread(target=loop)
t2 = threading.Thread(target=startshare)

#########file server###########
# app = Flask(__name__)

# @app.route('/')
# def hello():
#     return "Hello World!"

# @app.route('/getaddress')
# def getAddress():
#     return address

# @app.route('/setaddress')
# def setAddress():
#     #address = parameter

# @app.route('/files')
# def fileRead():
#     if os.path.isfile('image.zip'):
#         f = open('image.zip' , 'rb') 
#         getTime("File Requested")
#         return f.read()
#     else:
#         return b'err'

if __name__ == '__main__':

    t1.start()
    t2.start()
    #app.run(host='0.0.0.0', threaded=False)
    