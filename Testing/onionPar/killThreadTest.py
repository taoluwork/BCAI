import os
import sys
import time
import threading
from signal import signal, SIGINT
import subprocess
import multiprocessing

threads = 10
proc = []
threadL=[]
def shareOrder(iter):
    global proc
    procT = subprocess.Popen(["script -c \"~/onionshare/dev_scripts/onionshare --website hello.txt\" -f helloLog" + str(iter) + ".txt"], shell=True)
    proc.append(procT)
#create thread
for i in range(0,threads):
    thread = multiprocessing.Process(target=shareOrder,args=(i,))
    #start thread
    thread.start()
    threadL.append(thread)

time.sleep(120)

f = open("output.txt", 'w')
#for i in range(0,threads):
#    try:
#        proc[i].terminate()
#        f.write("proc terminate pass:" + str(i) + "\n")
#    except:
#        f.write("proc terminate failure:" + str(i) + "\n")

for i in range(0,threads):
    try:
        threadL[i].terminate()
        f.write("thread terminate pass:" + str(i) + "\n")
    except:
        f.write("thread terminate failure:" + str(i) + "\n")

print("I am still working")
f.close()
