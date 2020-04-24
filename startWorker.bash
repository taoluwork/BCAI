cd ML/localWorker
gnome-terminal --title="BCAI Worker Console" --tab -x node workerCLI.js 
gnome-terminal --title="BCAI Worker File Hosting/Transfer" --tab -x sudo python3 execute.py