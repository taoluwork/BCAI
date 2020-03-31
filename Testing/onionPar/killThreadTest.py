import os
import sys
import time
import threading
from signal import signal, SIGINT
import subprocess
import multiprocessing

threads = 10
threadL=[]
def shareOrder(iter):
    proc = subprocess.Popen(["script -c \"~/onionshare/dev_scripts/onionshare --website hello.txt\" -f output" + str(iter) + ".txt"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True)
def create():
    for i in range(0,threads):
        thread = multiprocessing.Process(target=shareOrder,args=(i,))
        thread.start()
        threadL.append(thread)

def ex():
    time.sleep(30)
    f = open("output.txt", 'w')
    for i in range(0,threads):
        try:
            threadL[i].terminate()
            f.write("thread terminate pass:" + str(i) + "\n")
        except:
            f.write("thread terminate failure:" + str(i) + "\n")
    for i in range(0,threads):
        try:
            thread = multiprocessing.Process(target=shareOrder,args=(i,))
            thread.start()
            threadL[i] = thread
            f.write("thread restart pass:" + str(i) + "\n")
        except:
            f.write("thread restart failure:" + str(i) + "\n")
    for i in range(0,threads):
        try:
            threadL[i].terminate()
            f.write("thread terminate 2 pass:" + str(i) + "\n")
        except:
            f.write("thread terminate 2 failure:" + str(i) + "\n")
    print("I am still working")
    f.close()
def loop():
    while True:
        print("hello")
        time.sleep(5)
def ps():
    os.system("reset")
    os.system("ps aux > ps.txt")
    f = open("ps.txt", 'r')
    line = f.readline()
    while line != '':
        if line.find('onionshare') != -1:
            os.system( 'kill ' + line.split()[1])
        line = f.readline()
    f.close()

def runner():
    print("creating threads")
    create()
    print("starting looper")
    l = multiprocessing.Process(target=loop)
    l.start()
    print("ex")
    ex()
    print("stopping loop")
    try:
        l.terminate()
        print("loop ender passes")
    except:
        print("loop ender failure")
    time.sleep(10)
    print("ps")
    ps()



runner()
