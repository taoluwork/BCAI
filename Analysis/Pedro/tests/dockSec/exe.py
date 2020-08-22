import os
import sys


os.system("sudo docker run -dit execute:latest bash")
os.system("sudo docker exec $(sudo docker container ls -q) python3 web.py" )
os.system('sudo docker cp $(sudo docker container ls -q):netTest.csv .')
os.system('sudo mv netTest.csv netTest' + sys.argv[1] + '.csv')
os.system("sudo docker stop $(sudo docker container ls -q)")