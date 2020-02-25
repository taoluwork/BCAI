import os
import sys
from flask import Flask
import requests as r
import time
import json
from signal import signal, SIGINT
import threading
from datetime import datetime
import numpy as np


##globals##
threads = 16
threadL = []
orderAddr = []
order   = []
startTimes = []
content = [0] * threads #inits list with threads number of 0s
mode = 'user' #user, provider, or validator
fileName = ''

#######################################################################################################################################
###########################################################host########################################################################
#######################################################################################################################################
def shareOrder():
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website totalOrder.txt" + "\" -f onionshareOrder.txt")
def startShare(file, iter):
    #print(file + ":" + str(iter))
    #start onionshare server to host file
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website " + file + "\" -f onionshare" + str(iter) + ".txt")

def splitFile(file):
    fileName = file
    f       = open(file,'rb')
    lines   = f.readlines()
    lineLen = len(lines)
    pos     = 0

    #print(lines)
    print(lineLen)
    for i in range(0, threads):
        fw = open(file+str(i)+'.txt' ,'wb')
        lo = int((i)*(lineLen/threads))
        hi = int((i+1)*(lineLen/threads))
        print("lo:" + str(lo) + " hi:" + str(hi))
        fw.writelines(lines[lo:hi])
        fw.close()
        order.append(file+str(i)+'.txt\n') 
    f.close()
    f = open('order.txt', 'w')
    f.writelines(order)
    f.close()

def createThreadsHost():
    f = open("order.txt" , 'r')
    orderFile = f.readlines()
    f.close()
    j = 0
    for i in orderFile:
        t=threading.Thread(target=startShare,args=[i.strip('\n'),j]) 
        threadL.append(t)
        j += 1

def runThreads():
    for i in threadL:
        i.start()
        startTimes.append(time.time())

def getAddrs():
    for i in range(0,threads):
        orderAddr.append(0)
    t = 0
    while t < threads:
        t = 0
        for i in orderAddr:
            if i != 0:
                t +=1
        for i in range(0,threads):
            if os.path.isfile('onionshare'+str(i)+'.txt'):
                f = open('onionshare'+str(i)+'.txt', 'r')
                lines = f.readlines()
                f.close()
                for j in lines:
                    if (j.find("http://onionshare") >= 0): #found address
                        orderAddr[i] = j.strip('\n') + "/" + order[i].strip('\n')
        print(orderAddr)    
        time.sleep(5)
    print(orderAddr)
    f = open('totalOrder.txt', 'w')
    for i in orderAddr:
        f.write(i + '\n')
    f.close()

def threadRestarter():
    while(True):
        for i in range(0,threads):
            if time.time() > startTimes[i] + 120 and orderAddr[i] == 0:
                os.system('rm onionshare' + str(i) + '.txt')
                threadL[i]._delete()
                f = open("order.txt" , 'r')
                lines = f.readlines()
                f.close()
                t=threading.Thread(target=startShare,args=[lines[i].strip('\n'),i]) 
                threadL[i] = t
                threadL[i].start()
                startTimes[i] = time.time()
                f = open('restart.txt', 'a')
                f.write("thread:" + str(i) + ' has been restarted at:' + str(time.time()) + ' due to time issue\n')
                f.close()
        for i in range(0,threads):
            if os.path.isfile('onionshare' + str(i) + '.txt' ):
                f = open('onionshare' + str(i) + '.txt' )
                lines = f.readlines()
                for line in lines:
                    if line.find('in use') >= 0:
                        os.system('rm onionshare' + str(i) + '.txt')
                        threadL[i]._delete()
                        f = open("order.txt" , 'r')
                        lines = f.readlines()
                        f.close()
                        t=threading.Thread(target=startShare,args=[lines[i].strip('\n'),i]) 
                        threadL[i] = t
                        threadL[i].start()
                        startTimes[i] = time.time()
                        f = open('restart.txt', 'a')
                        f.write("thread:" + str(i) + ' has been restarted at:' + str(time.time()) + ' due to address error\n')
                        f.close()

        time.sleep(5)

def resetHost():
    global threadL
    global orderAddr
    global order
    global startTimes
    global mode
    global fileName
    for i in threadL:
        i._delete()
    threadL = []
    orderAddr = []
    order   = []
    startTimes = []
    mode = ''
    fileName = ''
    os.remove("totalOrder.txt")
    os.remove('onionShareOrder.txt')
    os.remove('onionshare*.txt')
    os.remove('order.txt')
    os.remove(fileName + '*.txt')


#######################################################################################################################################
########################################################request########################################################################
#######################################################################################################################################

def getShare(address, iter):
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file
    content[iter] = res.content #append this slice's content to total content list
    #This thread unneeded now, can safely kill it
    killMe(iter)

def getShareWithoutIter(address):
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file
    open("totalOrder.txt", 'wb').write(res.content)
    
def createThreadsReq():
    flag = True
    flagTwo = True
    flagThree = True
    while flag:
        time.sleep(5)
        #Addresses written to file (Step 2)
        if os.path.isfile("totalOrder.txt") and flagTwo:
            flagTwo = False
            #Need to make a thread for each address
            f = open("totalOrder.txt", 'r')
            lines = f.readlines()
            f.close()
            j = 0
            for line in lines:
                t = threading.Thread(target=getShare,args=[line.strip('\n'), j])
                threadL.append(t) 
                t.start()
                j += 1
        #Every slot in content has been written to (Step 3)
        elif not (0 in content):
            #print(content)
            #Tell session it has finished
            statF = open("stat.txt", 'r')
            onionaddr = statF.readline().rstrip()
            statF.close()

            session = r.session()
            session.proxies = {}
            session.proxies['http'] = 'socks5h://localhost:9050'
            session.proxies['https'] = 'socks5h://localhost:9050'

            session.get(onionaddr + '/finish') #tell server finished downloading

            #Write total content to image.zip
            #content is a list of lists of bytes, but saved value must be a simple list of bytes
            #This is what I came up with to convert it to a list of bytes
            content2 = []
            for i in range (0, threads):
                for j in range(0, len(content[i])):
                    content2.append(content[i][j])
            #And now it can be saved with a join
            open("image.zip", "wb").write(b''.join(content2))
            resetReq()
            flag = False
        #totalOrder.txt not yet received (Step 1)
        else: 
            statF = open("stat.txt", 'r')
            onionaddr = statF.readline().rstrip()
            statF.close()
            #if file ready to be received from worker. onionaddr will hold the .onion address
            if onionaddr != '' and onionaddr != 'Executing' and onionaddr != 'Ready' and flagThree:
                flagThree = False
                getShareWithoutIter(onionaddr) #download totalOrder.txt

def resetReq():
    global content
    global threadL
    global mode
    content = [0] * threads
    #kill all threads before resetting
    for i in threadL:
        i._delete()
    threadL = []
    os.remove("totalOrder.txt")
    mode = ''
    os.remove('onionShareOrder.txt')


#kill specified thread
def killMe(iter):
    threadL[iter]._delete()


#######################################################################################################################################
#####################################################controller########################################################################
#######################################################################################################################################
def getTime(mess):
    now = datetime.now()
    end = open('log.txt', 'r').readline().rstrip()[24:]
    #print(now.strftime("%a %b %d %Y %H:%M:%S" + end))
    time = now.strftime("%a %b %d %Y %H:%M:%S" + end)
    f = open('log.txt', 'a')
    f.write(time + " "+ mess)
    f.close()

def hostController(file):
    splitFile(file)
    createThreadsHost()
    runThreads()
    errCorr = threading.Thread(target=threadRestarter)
    errCorr.start()
    getAddrs()
    mainThread = threading.Thread(target=shareOrder)
    mainThread.start()
    flag = True
    while flag:
        if os.path.isfile('onionshareOrder.txt'):
            f = open('onionshareOrder.txt', 'r')
            line = f.readline()
            while line != '':
                if "/finish" in line :
                    flag = False
                    errCorr._delete()
                    mainThread._delete()
                line = f.readline()
            f.close()
    resetHost()

def reqController():
    createThreadsReq()

def dockerExe():
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

def getMode():
    global mode
    flag = True
    while flag:
        time.sleep(5)
        if os.path.isfile('mode.txt'): 
            f = open("mode.txt", "r")
            curLine = f.readline().rstrip()
            f.close() 
            if(curLine == "provider" or curLine == 'validator' or curLine == "user"):  
                mode = curLine
                flag = False
                f = open('mode.txt', 'w')
                f.close()



if __name__ == '__main__':
    while True:
        getMode()    
        if mode == 'user':
            hostController('image.zip')
            reqController()
        else:
            reqController()
            dockerExe()
            hostController('image.zip')
        

    