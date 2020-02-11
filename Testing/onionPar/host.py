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
def shareOrder():
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website totalOrder.txt" + "\" -f onionshareOrder.txt")
def startShare(file, iter):
    print(file + ":" + str(iter))
    #start onionshare server to host file
    #os.system("script -c \"~/onionshare/dev_scripts/onionshare --website " + file + "\" -f onionshare" + iter + ".txt")

def splitFile(file):
    f       = open(file,'r')
    lines   = f.readlines()
    lineLen = len(lines)
    pos     = 0
    order   = []
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
    f = open("order.txt" , 'r')
    order = f.readlines()
    f.close()
    for i in order:
        os.system("rm " + i.strip('\n'))
    os.system('rm order.txt')

def createThreads():
    #t1 = threading.Thread(target=shareOrder)
    #t1.start()
    f = open("order.txt" , 'r')
    order = f.readlines()
    f.close()
    j = 0
    for i in order:
        t=threading.Thread(target=startShare,args=[i.strip('\n'),j]) 
        threadL.append(t)
        j += 1
def runThreads():
    for i in threadL:
        i.start()

def getAddrs():
    f = open("order.txt" , 'r')
    order = f.readlines()
    f.close()
    while len(orderAddr) != threads:
        for i in order:
            f = open(i.strip('\n'), 'r')
            lines = f.readlines()
            f.close()
            for j in lines:
                if (j[0:17] == "http://onionshare"): #found address
                    orderAddr.append(j.strip('/n'))
    f = open('totalOrder.txt', 'w')
    for i in orderAddr:
        f.write(i + '\n')
    f.close()


splitFile("hello.txt")
createThreads()
runThreads()