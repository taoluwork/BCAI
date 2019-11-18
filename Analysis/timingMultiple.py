import subprocess

for i in range(0, 2):
    process = subprocess.Popen("node TimingAnalysis.js", stdout = subprocess.PIPE)
    process.wait()

    for line in process.stdout:
        print(line)