import subprocess

for i in range(0, 1000):
    process = subprocess.Popen("node TimingAnalysis.js", stdout = subprocess.PIPE)
    process.wait()

    for line in process.stdout:
        print(line)