import os

links = ['wlp8s0']

os.system("sudo docker build Dockerfile -t execute:latest")

for link in links:
    os.system('sudo ip link set ' + link + ' down')
os.system('python3 exe.py off')
for link in links:
    os.system('sudo ip link set ' + link + ' up')
os.system('python3 exe.py on')
