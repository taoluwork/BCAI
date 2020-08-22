import os
import sys
import requests as r
import time
import json
from signal import signal, SIGINT
import threading
from datetime import datetime
import math
import subprocess
import multiprocessing
from multiprocessing import Manager, Value
from ctypes import c_char_p

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

##globals##
threads = 8
threadL = []
orderAddr = []
order   = []
startTimes = []
mainThread = None
manager = Manager()
totalAddr = manager.Value(c_char_p, '')
totalStartTime = Value('d', 0.0)
content = []
for i in range(threads):
    content.append(b'')#inits list with threads number of empty byte arrays
mode = '' #user, provider, or validator
fileName = ''

encKey     = None
encNonce   = None
#######################################################################################################################################
#######################################################encryption######################################################################
#######################################################################################################################################

def genKey():
    keyFile = "key.txt"
    nonceFile = "nonce.txt"
    f = open(keyFile, 'w')
    f.close()
    f = open(nonceFile, 'w')
    f.close()
    key = os.urandom(32)
    nonce = os.urandom(32)
    f = open(keyFile, 'wb')
    f.write(key)
    f.close()
    f = open(nonceFile, 'wb')
    f.write(nonce)
    f.close()    
def getKey(keyFile="", nonceFile=""):
    f = open(keyFile, 'rb')
    key = f.read()
    f.close()
    f = open(nonceFile, 'rb')
    nonce = f.read()
    f.close()
    return [key, nonce]

def enc(key=b"", nonce=b"", mess=b""):
    alg = algorithms.AES(key)
    cipher = Cipher(alg, modes.GCM(nonce), default_backend())
    encryptor = cipher.encryptor()
    return encryptor.update(mess)

def dec(key=b"", nonce=b"", mess=b""):
    alg = algorithms.AES(key)
    cipher = Cipher(alg, modes.GCM(nonce), default_backend())
    decryptor = cipher.decryptor()
    return decryptor.update(mess)

genKey()

def resetHost(resetMode):
    global threadL
    global orderAddr
    global order
    global startTimes
    global totalStartTime
    global mode
    global fileName
    global totalAddr
    for i in threadL:
        try: #May or may not already be deleted
            #i._delete()
            i.terminate()
        except: pass
    threadL = []
    orderAddr = []
    order   = []
    startTimes = []
    totalStartTime.value = 0.0
    if resetMode == True:
        mode = ''
    totalAddr.value = ''
    try:
        os.system('rm restart.txt totalOrderAddress.txt totalOrder.txt onionShareOrder.txt onionshare*.txt order.txt image.zip*.txt >/dev/null 2>&1')
    except:
        pass
    fileName = ''
        
    #new memory and command line reset
    os.system("reset")
    os.system("ps aux > ps.txt")
    f = open("ps.txt", 'r')
    line = f.readline()
    while line != '':
        if line.find('onionshare') != -1:
            try:
                os.system('kill -9' + line.split()[1] + ' >/dev/null 2>&1')
            except:
                pass
        line = f.readline()
    f.close()
    try:
        os.system('rm ps.txt')
    except:
        pass

def failingCheck():
    global threadL
    while True:
        time.sleep(120)
        positions = []
        try:

            session = r.session()
            session.proxies = {}
            session.proxies['http'] = 'socks5h://localhost:9050'
            session.proxies['https'] = 'socks5h://localhost:9050'

            fails = session.get(totalAddr.value + '/reqFails.txt')
            f = open('reqFails.txt', 'wb').write(fails.contetn)
            f.close()
            f = open('reqFails.txt', 'r')
            lines = f.readlines()
            f.close()
            for line in lines:
                positions.append(int(line).rstrip())
            f = open('totalOrder.txt', 'r')
            lines = f.readlines()
            for pos in positions:
                #threadL[pos]._delete()
                threadL[pos].terminate()
                #threadL[pos] = threading.Thread(target=getShare,args=[lines[pos].rstrip(),pos])
                threadL[pos] = multiprocessing.Process(target=getShare,args=(lines[pos].rstrip(),pos,))
                threadL[pos].daemon = True
                threadL[pos].start()
        except:
            pass


#######################################################################################################################################
########################################################request########################################################################
#######################################################################################################################################

def getShare(address, iter):
    global content
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file
    #content[iter] = res.content #append this slice's content to total content list


    ########################get key and nonce##################################
    [key, nonce] = getKey("key.txt","nonce.txt")
    ###########################################################################
    
    
    f = open("image.txt" + str(iter) + ".txt","wb" )
    f.write(dec(key, nonce, res.content))
    f.close()
    #print(type("-----Received content from thread " + iter))
    #for i in range(threads):
    #    print(len(content[i]))
    #This thread unneeded now, can safely kill it
    killMe(iter)

def getShareWithoutIter(address):
    session = r.session()
    session.proxies = {}
    session.proxies['http'] = 'socks5h://localhost:9050'
    session.proxies['https'] = 'socks5h://localhost:9050'

    res = session.get(address) #download file

    #########save the zip and unzip it#########
    open("totalOrder.zip", 'wb').write(res.content)
    time.sleep(5)
    os.system("unzip -o totalOrder.zip")
    ###########################################
    
def createThreadsReq():
    global totalAddr
    global content
    global mode
    flag = True
    flagTwo = True
    flagThree = True
    while flag:
        time.sleep(5)
        #Addresses written to file (Step 2)
        if os.path.isfile("totalOrder.txt") and flagTwo:
            print("Downloading file from host. This may take a while...")
            flagTwo = False
            #Need to make a thread for each address
            f = open("totalOrder.txt", 'r')
            lines = f.readlines()
            f.close()
            j = 0
            for line in lines:
                #t = threading.Thread(target=getShare,args=[line.strip('\n'), j])
                t = multiprocessing.Process(target=getShare,args=(line.strip('\n'), j,))
                t.daemon = True
                threadL.append(t) 
                t.start()
                j += 1
        #Every slot in content has been written to (Step 3)
        allVal = True
        for i in range(0,threads):
            if os.path.isfile("image.txt" + str(i) + ".txt"):
                content[i] = True
            else:
                allVal = False
                break
        if allVal:
            getTime("Finished")
            session = r.session()
            session.proxies = {}
            session.proxies['http'] = 'socks5h://localhost:9050'
            session.proxies['https'] = 'socks5h://localhost:9050'
            session.get(totalAddr.value + '/finish') #tell server finished downloading
            totalFile = open('image.txt', 'wb')
            for i in range(0, threads):
                iterFile = open('image.txt' + str(i) + '.txt', 'rb')
                totalFile.write(iterFile.read())
                iterFile.close()
            totalFile.close()
            flag = False
            resetReq()

        #totalOrder.txt not yet received (Step 1)
        elif flagThree: 
            statF = open("stat.txt", 'r')
            totalAddr.value = statF.readline().rstrip()
            statF.close()
            #if file ready to be received from worker. totalAddr will hold the .onion address
            if totalAddr.value != '' and totalAddr.value != 'Executing' and totalAddr.value != 'Ready':
                flagThree = False
                getTime("Starting")
                getShareWithoutIter(totalAddr.value) #download totalOrder.txt

def resetReq():
    global content
    global threadL
    global mode
    global mainThread
    global totalAddr
    content = []
    for i in range(threads):
        content.append(False)
        #content.append(b'')#inits list with threads number of empty byte arrays
    #kill all threads before resetting
    for i in threadL:
        try: #May or may not already be deleted
            #i._delete()
            i.terminate()
        except: pass
    threadL = []
    mainThread = None
    totalAddr.value = ''
    mode = ''
    try:
        os.system('rm totalOrder.txt onionShareOrder.txt image.zip*.txt')
    except:
      pass
    #new memory and command line reset
    os.system("reset")
    os.system("ps aux > ps.txt")
    f = open("ps.txt", 'r')
    line = f.readline()
    while line != '':
        if line.find('onionshare') != -1:
            try:
                os.system('kill ' + line.split()[1])
            except:
                pass
        line = f.readline()
    f.close()
    f = open('stat.txt', 'w')
    f.close()
    try:
        os.system('rm ps.txt')
    except:
        pass

#kill specified thread
def killMe(iter):
    #threadL[iter]._delete()
    try:
        threadL[iter].terminate()
    except:
        pass

#######################################################################################################################################
#####################################################controller########################################################################
#######################################################################################################################################
def getTime(mess):
    now = datetime.now()
    end = open('log.txt', 'r').readline().rstrip()[24:]
    #print(now.strftime("%a %b %d %Y %H:%M:%S" + end))
    time = now.strftime("%a %b %d %Y %H:%M:%S" + end)
    f = open('log.txt', 'a')
    f.write('\n' + time + " "+ mess)
    f.close()

def reqController():
    #failThread = threading.Thread(target=failingCheck)
    failThread = multiprocessing.Process(target=failingCheck)
    failThread.daemon = True
    failThread.start()
    createThreadsReq()
    try: #May or may not already be deleted
        #failThread._delete()
        failThread.terminate()
    except: pass


if __name__ == '__main__':
    resetHost(False)
    reqController()
