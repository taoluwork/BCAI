import os
import sys

print(sys.argv)
# 0-> provider
# 1-> validator
mode = sys.argv[1]


#unzip file (!!!!assume that image.zip is created by cli!!!!)
os.system("unzip image.zip")
#this will load the image back into docker
os.system("sudo docker load -i image.tgz")
#this will start the container in a bash
os.system("sudo docker run -dit execute:latest bash")
#this will execute the code
os.system("sudo docker exec $(sudo docker container ls -q) python3 execute.py " + str(mode) )
#this will delete the old image file
os.system("sudo rm -rf image.tgz")
#this will update the container
os.system("sudo docker commit $(sudo docker container ls -q) execute:latest")
#this will remove the image to be transmitted to the next step
os.system("sudo docker save execute -o image.tgz")
#zip the image
os.system('sudo zip -0 image.zip image.tgz')
#this will stop the docker image
os.system("sudo docker stop $(sudo docker container ls -q)")
