import os
import sys
import time
import threading

def shareOrder():
    os.system("script -c \"~/onionshare/dev_scripts/onionshare --website hello.txt" + "\" -f helloLog.txt")

#create thread
thread=threading.Thread(target=shareOrder) 
#start thread
thread.start()
#wait 60 seconds
time.sleep(60)

#try _delete
try:
    thread._delete()
    print("_delete pass")
except:
    print("_delete failure")
#try .kill
try:
    thread.kill()
    print("kill pass")
except:
    print("kill failure")
#try _stop
try:
    thread._stop()
    print("_stop pass")
except:
    print("_stop failure")