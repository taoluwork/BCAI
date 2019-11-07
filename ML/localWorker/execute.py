import os
import sys
from flask import Flask
import requests as r
import time
import json
from signal import signal, SIGINT
import threading

# 0-> provider
# 1-> validator
print(sys.argv)
#myIp = sys.argv[1]

#mode = sys.argv[1] 
#ip   = sys.argv[2] 
#file = sys.argv[3]
#myIp = sys.argv[4] 
#print('FILE PROCESS BEGINNING')

app = Flask(__name__)
#f = open(file , 'rb')

@app.route('/')
def hello():
    return "Hello World!"

@app.route('/files')
def fileRead():
    if os.path.isfile("image.zip"):
        #open("stat.txt", "w").writelines("Sending File")
        file = open("image.zip", "rb")
        f = file.read()
        file.close()
        return f
    else:
        return "Not Ready"


#@app.route('/execute')
def executeDocker(ip, mode):
    ipfile = open("stat.txt", "w")
    ipfile.close() #empties file
    ipfile = open("stat.txt", "w")
    ipfile.writelines("Executing") #write executing so .js knows status
    ipfile.close()

    #print('requesting files from: ' + ip)
    res = r.get('http://' + ip + '/files')
    ##removes file
    os.system("sudo rm -rf image.*")
    open('image.zip', 'wb').write(res.content)
    res = r.put('http://' + ip + '/exit')
    #unzip file (!!!!assume that image.zip is created by cli!!!!)
    os.system("unzip image.zip")
    #this will load the image back into docker
    os.system("sudo docker load -i image.tgz")
    #this will start the container in a bash
    os.system("sudo docker run -dit execute:latest bash")
    #this will execute the code
    os.system("sudo docker exec $(sudo docker container ls -q) python3 execute.py " + str(mode) )
    #this will delete the old image file
    os.system("sudo rm -rf image.tgz")
    #this will update the container
    os.system("sudo docker commit $(sudo docker container ls -q) execute:latest")
    #this will remove the image to be transmitted to the next step
    os.system("sudo docker save execute -o image.tgz")
    #zip the image
    os.system('sudo zip -0 image.zip image.tgz')
    #this will stop the docker image
    os.system("sudo docker stop $(sudo docker container ls -q)")

    ipfile = open("stat.txt", "w")
    ipfile.close() #empties file
    ipfile = open("stat.txt", "w")
    ipfile.writelines("Ready") #write read so .js knows status
    ipfile.close()

def loop():
    while True:
        time.sleep(5)
        #print("hello")
        if os.stat("stat.txt").st_size > 0: #if file is not empty
            ipfile = open("stat.txt", "r")
            ip = ipfile.readline().rstrip() #first line: ip
            if(ip != "Ready" and ip != "Executing"): #make sure it's not reading ready or executing 
                #print(ip)
                mode = ipfile.readline().rstrip() #second line: mode
                #print(mode)
                ipfile.close()
                executeDocker(ip, mode) #send to execute function
            

if __name__ == '__main__':
    t1 = threading.Thread(target=loop)
    t1.start()
    app.run(host='0.0.0.0',threaded=False)