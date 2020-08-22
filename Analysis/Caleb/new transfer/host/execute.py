import os
import sys
import requests as r
import time
import json
from signal import signal, SIGINT
import threading
from datetime import datetime
import math
import multiprocessing
from multiprocessing import Manager, Value
import subprocess
from ctypes import c_char_p

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

##globals##
threads    = 8
threadL    = []
orderAddr  = []
order      = []
startTimes = []
mainThread = None
manager = Manager()
totalAddr = manager.Value(c_char_p, '')
totalStartTime = Value('d', 0.0)
content = []
for i in range(threads):
    content.append(b'')#inits list with threads number of empty byte arrays
mode       = '' #user, provider, or validator
lockModeAt = "user" #varialbe that locks the mode as whatever the variable is set at
mode       = lockModeAt
fileName   = ''
encKey     = None
encNonce   = None
#######################################################################################################################################
#######################################################encryption######################################################################
#######################################################################################################################################

def genKey():
    keyFile= "key.txt"
    nonceFile="nonce.txt"
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



#######################################################################################################################################
###########################################################host########################################################################
#######################################################################################################################################
def shareOrder():
    global totalStartTime
    while os.path.isfile('totalOrder.txt') != True:
        time.sleep(5)
    totalStartTime.value = time.time()
    
    ######zip the total order, key, and nonce to share#########
    os.system('zip totalOrder.zip totalOrder.txt key.txt nonce.txt  >/dev/null 2>&1')
    time.sleep(5)    

    ###########################################################

    subprocess.Popen(["script -c \"../../../../../onionshare/dev_scripts/onionshare --website totalOrder.zip" + "\" -f onionshareOrder.txt"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,shell=True)
def startShare(file, iter):
    #print(file + ":" + str(iter))
    #start onionshare server to host file
    subprocess.Popen(["script -c \"../../../../../onionshare/dev_scripts/onionshare --website " + file + "\" -f onionshare" + str(iter) + ".txt"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,shell=True)

def splitFile(file):
    fileName = file
    f       = open(file,'rb')
    hello = f.read()
    lineLen = len(hello)
    pos     = 0

    #print(lines)
    for i in range(0, threads):
        fw = open(file+str(i)+'.txt' ,'wb')
        lo = int((i)*(lineLen/threads))
        hi = int((i+1)*(lineLen/threads))
        fw.write(hello[lo:hi])
        fw.close()
        order.append(file+str(i)+'.txt\n')
        keyFile = open("key.txt", 'rb')
        key = keyFile.read()
        keyFile.close()
        nonceFile = open("nonce.txt", "rb")
        nonce = nonceFile.read()
        nonceFile.close()
        fenc = open(file+str(i)+'.txt', "rb")
        hold = enc(key, nonce, fenc.read())
        fenc.close()
        fenc = open(file + str(i) + ".txt", "w")
        fenc.close
        fenc = open(file+str(i)+".txt", "wb")
        fenc.write(hold)
        fenc.close()
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
        #t=threading.Thread(target=startShare,args=[i.strip('\n'),j]) 
        t=multiprocessing.Process(target=startShare,args=(i.strip('\n'),j,)) 
        threadL.append(t)
        j += 1

def runThreads():
    for i in threadL:
        i.daemon = True
        i.start()
        startTimes.append(time.time())
        #print(startTimes)

def getAddrs():
    #for i in range(0,threads):
        #orderAddr.append(0)
    t = 0
    while t < threads:
        global orderAddr
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
        #print(orderAddr)
        time.sleep(5)
    #print(orderAddr)
    f = open('totalOrder.txt', 'w')
    for i in orderAddr:
        f.write(i + '\n')
    f.close()


def getTotalAddr():
    global totalAddr
    flag = True
    while(flag):
        if os.path.isfile('onionshareOrder.txt'):
            f = open('onionshareOrder.txt', 'r')
            lines = f.readlines()
            f.close()
            for j in lines:
                if (j.find("http://onionshare") >= 0): #found address
                    totalAddr.value = j.strip('\n') + "/totalOrder.zip"
                    flag = False 
        time.sleep(5)
    #Write address to file
    getTime("Finished hosting")
    f = open('totalOrderAddress.txt', 'w')
    f.write(totalAddr.value)
    f.close()

    print("Finished hosting. Once you choose a provider, we will start sending them the file.\r")
    f2 = open('webpagestatus.txt', 'w') #clear
    f2.close()
    f2 = open('webpagestatus.txt', 'w')
    f2.write("Finished hosting file. Please choose a provider, then we will start sending the file.")
    f2.close()

def threadRestarter():
    #for i in range(0,threads):
        #orderAddr.append(0)
    global orderAddr

    print("Hosting file.\r")
    f2 = open('webpagestatus.txt', 'w') #clear
    f2.close()
    f2 = open('webpagestatus.txt', 'w')
    f2.write("Waiting for file to finish hosting.")
    f2.close()

    while(True):
        #global orderAddr
        #print("addrs:"+ str(orderAddr))
        try:
            for i in range(0,len(startTimes)):
                global orderAddr
                if time.time() > (startTimes[i] + 60) and orderAddr[i] == 0:
                    os.system('rm onionshare' + str(i) + '.txt')
                    #threadL[i]._delete()
                    threadL[i].terminate()
                    f = open("order.txt" , 'r')
                    lines = f.readlines()
                    f.close()
                    #t=threading.Thread(target=startShare,args=[lines[i].strip('\n'),i])
                    t=multiprocessing.Process(target=startShare,args=(lines[i].strip('\n'),i,))
                    t.daemon = True
                    threadL[i] = t
                    threadL[i].start()
                    holdVal = startTimes[i]
                    startTimes[i] = time.time()
                    f = open('restart.txt', 'a')
                    f.write("thread:" + str(i) + ' has been restarted at:' + str(time.time()) + ' due to time issue. It started at:'+str(holdVal)+' and should end at:'+str(holdVal+120)+' and addr:'+ str(orderAddr[i])+'\n')
                    f.close()
            for i in range(0,threads):
                if os.path.isfile('onionshare' + str(i) + '.txt' ):
                    f = open('onionshare' + str(i) + '.txt' )
                    lines = f.readlines()
                    for line in lines:
                        if line.find('in use') >= 0:
                            os.system('rm onionshare' + str(i) + '.txt')
                            #threadL[i]._delete()
                            threadL[i].terminate()
                            f = open("order.txt" , 'r')
                            lines = f.readlines()
                            f.close()
                            #t=threading.Thread(target=startShare,args=[lines[i].strip('\n'),i])
                            t=multiprocessing.Process(target=startShare,args=(lines[i].strip('\n'),i,))
                            t.daemon = True
                            threadL[i] = t
                            threadL[i].start()
                            startTimes[i] = time.time()
                            f = open('restart.txt', 'a')
                            f.write("thread:" + str(i) + ' has been restarted at:' + str(time.time()) + ' due to address error\n')
                            f.close()
            t = 0
            for i in orderAddr:
                if i != 0:
                    t +=1
            for i in range(0,threads):
                if os.path.isfile('onionshare'+str(i)+'.txt') and orderAddr[i] == 0:
                    f = open('onionshare'+str(i)+'.txt', 'r')
                    lines = f.readlines()
                    f.close()
                    for j in lines:
                        if (j.find("http://onionshare") >= 0): #found address
                            orderAddr[i] = j.strip('\n') + "/" + order[i].strip('\n')
            if t == threads:
                f = open('totalOrder.txt', 'w')
                for i in orderAddr:
                    f.write(i + '\n')
                f.close()

        except:
            pass

        #Print a string with each file's percentage
        toprint = "" 
        for i in range(threads):
            try: #Will fail if index not found, then just ignore
                f = open('onionshare'+str(i)+'.txt', 'r')
                #Get string of percentage for file slice
                wholetext = f.read()
                f.close()
                percentindex = wholetext.rindex("%") #Finds the position of the last percent
                spaceindex = wholetext.rindex(" ", 0, percentindex) #Finds the position of the last space before the percent
                percentage = wholetext[spaceindex+1:percentindex+1] #Skips the space but includes the percent
                toprint += str(i) + ": " + percentage + ("" if i == threads-1 else ", ") #Formats string
            except: pass
        print(toprint + "\r", end="") #recurrent character so it rewrites last line instead of making new lines

        #only overwrite 2nd line
        lines = open('webpagestatus.txt', 'r').readlines()
        if(len(lines) == 1): #First time lines[1] does not exist so must append
            lines.append('\n' + toprint)
        else: #length 2
            lines[1] = toprint
        f2 = open('webpagestatus.txt', 'w') #clear
        f2.close()
        f2 = open('webpagestatus.txt', 'w')
        f2.writelines(lines)
        f2.close()

        time.sleep(5)


def hostReqFail():
    subprocess.Popen(["script -c \"~/onionshare/dev_scripts/onionshare --website reqFails.txt" + "\" -f reqFailLog.txt"],stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True)
def reqFail():
    #failThread = threading.Thread(target=hostReqFail)
    failThread = multiprocessing.Process(target=hostReqFail)
    threadOn = False
    global threads
    reqMade = [0]*threads
    callSum = 0
    while True:
        time.sleep(120)
        for i in range(0,threads):
            if os.path.isfile('onionshare' + str(i) + '.txt'):
                f = open('onionshare' + str(i) + '.txt')
                lines = f.readlines()
                f.close()
                for line in lines:
                    if reqMade[i] == 0 and line.find('get') >= 0:
                        reqMade[i] = 1
                        callSum += 1
        if callSum >= (threads/2) and callSum != threads:
            f = open('reqFails.txt', 'w')
            for i in range(0,threads):
                if reqMade[i] == 0:
                    f.write(str(i)+'\n')
            if threadOn:
                #failThread._delete()
                failThread.terminate()
                #failThread = threading.Thread(target=hostReqFail)
                failThread = multiprocessing.Process(target=hostReqFail)
                failThread.daemon = True
                failThread.start()
                threadOn = True
            else:
                failThread.start()
                threadOn = True
        if callSum == threads:
            #failThread._delete()
            failThread.terminate()
            threadOn = False

#################################################################################################################
#################################################################################################################
#################################################################################################################
def totalThreadRestarter():
    global totalStartTime
    global totalAddr
    global mainThread
    mainThread = multiprocessing.Process(target=shareOrder)
    mainThread.daemon = True
    mainThread.start()
    while (True):
        if (totalStartTime.value != 0.0) and time.time() > (totalStartTime.value + 60) and totalAddr.value == '':
            os.system('rm onionshareOrder.txt  >/dev/null 2>&1')
            #restart thread
            #mainThread._delete()
            mainThread.terminate()
            #t = threading.Thread(target=shareOrder)
            t = multiprocessing.Process(target=shareOrder)
            t.daemon = True
            mainThread = t
            mainThread.start()
            f = open('restart.txt', 'a')
            f.write("thread: for totalOrder has been restarted at:" + str(time.time()) + ' due to time issue\n')
            f.close()

        time.sleep(5)

def resetHost(resetStat):
    global threadL
    global orderAddr
    global order
    global startTimes
    global totalStartTime
    global mode
    global lockModeAt
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
    mode = lockModeAt
    totalAddr.value = ''
    try:
        os.system('rm restart.txt totalOrderAddress.txt totalOrder.txt onionShareOrder.txt onionshare*.txt order.txt *.txt*.txt >/dev/null 2>&1')
    except:
        pass
    fileName = ''
      
    #only reset stat on startup
    if(resetStat):
        f = open('webpagestatus.txt', 'w') #clear
        f.close()

    f = open('log.txt', 'w') #clear
    f.close()

    #new memory and command line reset
    os.system("reset")
    os.system("ps aux > ps.txt")
    f = open("ps.txt", 'r')
    line = f.readline()
    while line != '':
        if line.find('onionshare') != -1:
            try:
                os.system('kill -9 ' + line.split()[1] + ' >/dev/null 2>&1')
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

def hostController(file):
    global totalAddr
    totalAddr.value = '' #Reset totalAddr for total thread restarter
    getTime("Starting host")
    genKey()
    for i in range(0,threads):
        orderAddr.append(0)
    splitFile(file)
    createThreadsHost()
    runThreads()
    errCorr = multiprocessing.Process(target=threadRestarter)
    #errCorr.daemon = True #demonic processes can't have children
    errCorr.start()
    #getAddrs()
    #failThread = threading.Thread(target=reqFail)
    failThread = multiprocessing.Process(target=reqFail)
    failThread.daemon = True
    failThread.start()
    global mainThread
    #Restarter for total share
    #errCorrMain = threading.Thread(target=totalThreadRestarter)
    errCorrMain = multiprocessing.Process(target=totalThreadRestarter)
    #errCorrMain.daemon = True #demonic processes can't have children
    errCorrMain.start()
    getTotalAddr()
    flag = True
    while flag:
        if os.path.isfile('onionshareOrder.txt'):
            f = open('onionshareOrder.txt', 'r')
            line = f.readline()
            while line != '':
                if "/finish" in line :
                    print("Provider finished downloading file.")
                    f2 = open('webpagestatus.txt', 'w') #clear
                    f2.close()
                    f2 = open('webpagestatus.txt', 'w')
                    f2.write("Provider downloaded file. Once they execute it, you must choose a validator.")
                    f2.close()

                    flag = False
                    try: #May or may not already be deleted
                        errCorr.terminate()
                    except: pass
                    try: #May or may not already be deleted
                        errCorrMain.terminate()
                    except: pass
                    try: #May or may not already be deleted
                        mainThread.terminate()
                    except: pass      
                line = f.readline()
            f.close()
    try: #May or may not already be deleted
        #failThread._delete()
        failThread.terminate()
    except: pass
    resetHost(False)

if __name__ == '__main__':
    resetHost(True)
    hostController('1GB.txt')