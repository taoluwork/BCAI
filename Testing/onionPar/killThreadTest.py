import os
import sys
import time
import threading
from signal import signal, SIGINT
import subprocess

threads = 10
proc = []
def shareOrder(iter):
    global proc
    proc.append(0)
    proc[iter] = subprocess.Popen(["script -c \"~/onionshare/dev_scripts/onionshare --website hello.txt\" -f helloLog" + str(iter) + ".txt"], shell=True)

#create thread
for i in range(0,threads):
    thread = threading.Thread(target=shareOrder,args=[i])
    #start thread
    thread.start()

time.sleep(120)

for i in range(0,threads):
    try:
        proc[i].terminate()
        print("pass:" + str(i) + "\n")
    except:
        print("failure:" + str(i) + "\n")


print("I am still working")
