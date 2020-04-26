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

content = [0] * threads #inits list with threads number of 0s
threadL = []

#Get a file from an onionshare address to add to list
def getShare(address, iter):
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file
    content[iter] = res.content #append this slice's content to total content list
    #This thread unneeded now, can safely kill it
    killMe(iter)

#Get a file from an onionshare address, for totalOrder.txt
def getShareWithoutIter(address):
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file
    open("totalOrder.txt", 'wb').write(res.content)
    

def createThreads():
    while True:
        time.sleep(5)
        #Addresses written to file (Step 2)
        if os.path.isfile("totalOrder.txt"):
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
            print(content)
            #Tell session it has finished
            statF = open("stat.txt", 'r')
            onionaddr = statF.readline().rstrip()
            statF.close()

            session = r.session()
            session.proxies = {}
            session.proxies['http'] = 'socks5h://localhost:9050'
            session.proxies['https'] = 'socks5h://localhost:9050'

            session.get(onionaddr + 'finish') #tell server finished downloading
            #Write total content to image.zip
            open("image.zip", "wb").write(content)
            reset()
        #totalOrder.txt not yet received (Step 1)
        else: 
            statF = open("stat.txt", 'r')
            onionaddr = statF.readline().rstrip()
            statF.close()
            #if file ready to be received from worker. onionaddr will hold the .onion address
            if onionaddr != '' and onionaddr != 'Executing' and onionaddr != 'Ready':
                getShareWithoutIter(onionaddr) #download totalOrder.txt

def reset():
    global content
    global threadL
    content = [0] * threads
    #kill all threads before resetting
    for i in threadL:
        i._delete()
    threadL = []
    os.remove("totalOrder.txt")

#kill specified thread
def killMe(iter):
    threadL[iter]._delete()

createThreads()