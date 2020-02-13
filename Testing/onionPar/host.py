import os
import sys
from flask import Flask
import requests as r
import time
import json
from signal import signal, SIGINT
import threading
from datetime import datetime

threads = 4
threadL = []
orderAddr = []
order   = []
startTimes = []
def shareOrder():
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website totalOrder.txt" + "\" -f onionshareOrder.txt")
def startShare(file, iter):
    #print(file + ":" + str(iter))
    #start onionshare server to host file
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website " + file + "\" -f onionshare" + str(iter) + ".txt")

def splitFile(file):
    f       = open(file,'r')
    lines   = f.readlines()
    lineLen = len(lines)
    pos     = 0

    print(lines)
    print(lineLen)
    for i in range(0, threads):
        fw = open(file+str(i)+'.txt' ,'w')
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

def cleanFiles():
    os.system('rm onionshare*.txt')
    os.system('rm hello.txt*.txt')
    os.system('rm order.txt')

def createThreads():
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
                f.write("thread:" + str(i) + ' has been restarted at:' + str(time.time()) + '\n')
                f.close()
        time.sleep(5)


cleanFiles()
splitFile("hello.txt")
createThreads()
runThreads()
watch = threading.Thread(target=threadRestarter)
watch.start()
getAddrs()
bigThread = threading.Thread(target=shareOrder)
bigThread.start()
