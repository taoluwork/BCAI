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

def shareOrder():
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website order.txt" + "\" -f onionshareOrder.txt")
def startshare(file, iter):
    #start onionshare server to host file
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website " + file + str(iter) + ".txt" + "\" -f onionshare" + iter + ".txt")

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

def shareRunner():
    t1 = threading.Thread(target=shareOrder)
    t1.start()
    f = open("order.txt" , 'r')
    order = f.readlines()
    f.close()
    for i in order:
        os.system("rm " + i.strip('\n'))
k

splitFile("hello.txt")
shareRunner()
#cleanFiles()