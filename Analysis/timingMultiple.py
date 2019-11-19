import subprocess

#Clear file contents before we start recording new data
open('StartProviding.txt', 'w').close()
open('UpdateProviding.txt', 'w').close()
open('StopProviding.txt', 'w').close()
open('StartRequest.txt', 'w').close()
open('UpdateRequest.txt', 'w').close()
open('StopRequest.txt', 'w').close()

for i in range(0, 300):
    print("Iteration " + str(i) + " is running...\n")
    process = subprocess.Popen("node TimingAnalysis.js", stdout = subprocess.PIPE, shell=True)
    process.wait()