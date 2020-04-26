#this is a file to create the test image
#it is too large to be put on github

import os
import sys


#sudo docker build Dockerfile -t execute:latest
#sudo docker save execute:latest -o image.tgz
#zip -0 image.zip image.tgz
os.system("sudo docker build Dockerfile -t execute:latest")
os.system("sudo docker save execute:latest -o image.tgz")
os.system("sudo zip -0 image.zip image.tgz")