import subprocess

#Clear file contents before we start recording new data
open('getProviderPool.txt', 'w').close()
open('getPendingPool.txt', 'w').close()
open('getProvidingPool.txt', 'w').close()
open('getValidatingPool.txt', 'w').close()

for i in range(0, 300):
    print("Iteration " + str(i) + " is running...\n")
    process = subprocess.Popen("node TimingRequestFunctions.js", stdout = subprocess.PIPE, shell=True)
    process.wait()