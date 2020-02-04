import os
import sys
from flask import Flask
import requests as r
import time
import json
from signal import signal, SIGINT
import threading
from datetime import datetime

# 0-> provider
# 1-> validator
#myIp = sys.argv[1]

#mode = sys.argv[1] 
#ip   = sys.argv[2] 
#file = sys.argv[3]
#myIp = sys.argv[4] 
#print('FILE PROCESS BEGINNING')

#t1 = threading.Thread(target=loop)
t2 = threading.Thread(target=startshare)

def getTime(mess):
    now = datetime.now()
    end = open('log.txt', 'r').readline().rstrip()[24:]
    #print(now.strftime("%a %b %d %Y %H:%M:%S" + end))
    time = now.strftime("%a %b %d %Y %H:%M:%S" + end)
    f = open('log.txt', 'a')
    f.write(time + " "+ mess)
    f.close()

#app = Flask(__name__)
#f = open(file , 'rb')

#@app.route('/')
def hello():
    return "Hello World!"

#@app.route('/files')
def fileRead():
    if os.path.isfile("image.zip"):
        #open("stat.txt", "w").writelines("Sending File")
        file = open("image.zip", "rb")
        f = file.read()
        file.close()
        getTime('File Requested')
        return f
    else:
        return "Not Ready"

#Overall flow:
#1) Start loop function, wait for user onion address written to stat file
#2) Once onion address written (the address of the user's image.zip),
## start executeDocker function, make Tor GET request, receive file
### Write "Executing" to stat.txt
#3) Once execution completed, start onionshare thread, wait until address printed to onionshare.txt
### Write "Ready" to stat.txt
#4) Once address printed (onionshare started) write to onionaddr.txt, wait for GET
#5) Once GET request in onionshare.txt, user has downloaded file, kill onionshare thread
### Write "Received" to stat.txt


#@app.route('/execute')
def executeDocker(onionaddr, mode):
    statF = open("stat.txt", "w")
    statF.close() #empties file
    statF = open("stat.txt", "w")
    statF.writelines("Executing") #write executing so .js knows status
    statF.close()

    getTime('Requesting file for Execution')

    #print('requesting files from: ' + ip)
    #res = r.get('http://' + ip + '/files')
    ##removes file

    #Tor GET request
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(onionaddr + '/image.zip')

    os.system("sudo rm -rf image.*")
    open('image.zip', 'wb').write(res.content)
    #res = r.put('http://' + ip + '/exit')
    #unzip file (!!!!assume that image.zip is created by cli!!!!)
    os.system("unzip image.zip")

    getTime('File Received and Saved')

    #this will load the image back into docker
    os.system("sudo docker load -i image.tgz")
    #this will start the container in a bash
    os.system("sudo docker run -dit execute:latest bash")

    getTime('Docker Image Loaded and Executing')

    #this will execute the code
    os.system("sudo docker exec $(sudo docker container ls -q) python3 execute.py " + str(mode) )
    #this will delete the old image file
    os.system("sudo rm -rf image.tgz")
    #this will update the container
    os.system("sudo docker commit $(sudo docker container ls -q) execute:latest")

    getTime("Execution Finished")

    #this will remove the image to be transmitted to the next step
    os.system("sudo docker save execute -o image.tgz")
    #zip the image
    os.system('sudo zip -0 image.zip image.tgz')
    #this will stop the docker image
    os.system("sudo docker stop $(sudo docker container ls -q)")

    getTime('Image Unloaded and Ready For Transmission')

    #start sharing file on onionshare
    t2 = threading.Thread(target=startshare)
    t2.start()
    statF = open("stat.txt", "w")
    statF.close() #empties file
    statF = open("stat.txt", "w")
    statF.writelines("Ready") #write read so .js knows status
    statF.close()
    while True:
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
                statF.write("Received")
                statF.close()
            lines = onionshareLog.readlines()


def loop():
    while True:
        time.sleep(5)
        #print("hello")
        if os.stat("stat.txt").st_size > 0: #if file is not empty
            statF = open("stat.txt", "r")
            onionaddr = statF.readline().rstrip() #first line: ip
            if(onionaddr != "Ready" and onionaddr != "Executing" and onionaddr != "Received"): #make sure it's not reading ready or executing 
                #print(ip)
                mode = statF.readline().rstrip() #second line: mode
                #print(mode)
                statF.close()
                executeDocker(onionaddr, mode) #send to execute function

def startshare():
    #start onionshare server to host file
    os.system("~/onionshare/dev_scripts/onionshare --website image.zip > onionshare.txt")
            
if __name__ == '__main__':
    t1 = threading.Thread(target=loop)
    t1.start()
    #app.run(host='0.0.0.0',threaded=False)