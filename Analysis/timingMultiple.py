import subprocess

for i in range(0, 5):
    print("Iteration " + str(i) + " is running...\n")
    process = subprocess.Popen("node TimingAnalysis.js", stdout = subprocess.PIPE, shell=True)
    process.wait()

    # for line in process.stdout:
    #     print(line)