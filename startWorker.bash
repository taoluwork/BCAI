cd ML/localWorker
#TODO: If doesn't exist, create stat.txt
#If not empty, make it empty
nohup sudo python3 execute.py &>/dev/null &
node workerCLI.js #start CLI, can start web page from here