import os
import sys
import time

commonPath  = '../../files/'
imagePath   = commonPath + 'image/'
executePath = commonPath + 'exe/'
dataPath    = '../../data/dockTest/data.csv'
iter        = sys.argv[1]

startDock = time.time()
os.system("unzip " + imagePath + 'image.zip -d '+ imagePath)
os.system("sudo docker load -i " + imagePath + 'image.tgz')
os.system("sudo docker run -dit execute:latest bash")
os.system("sudo docker exec $(sudo docker container ls -q) python3 execute.py 0" )
os.system("sudo rm -rf " + imagePath + 'image.zip')
os.system("sudo rm -rf " + imagePath + 'image.tgz')
os.system("sudo docker commit $(sudo docker container ls -q) execute:latest")
os.system("sudo docker save execute -o " + imagePath + 'image.tgz')
os.system('sudo zip -0 ' + imagePath + 'image.zip ' + imagePath + 'image.tgz')
os.system("sudo docker stop $(sudo docker container ls -q)")
endDock = time.time()

startExe = time.time()
os.system("python3 " + executePath + "execute.py 0")
endExe = time.time()

f = open(dataPath, 'a')
f.write(str(iter) + ',' + str(startDock) + ',' + str(endDock) + ',' + str(startExe) + ',' + str(endExe) + '\n' )
f.close()
