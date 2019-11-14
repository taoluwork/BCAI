import time
import gc

gc.enable()
filenames = ["1MB.txt", "10MB.txt", "100MB.txt", "1GB.txt"]
for j in range(0, 4):
    times = []
    for i in range(0, 99): #1000 iterations
        #print(i)
        start = int(round(time.time() * 1000))
        file = open(filenames[j], "r")
        f = file.read()
        file.close()
        timetaken = int(round(time.time() * 1000)) - start
        times.append(timetaken)
        gc.collect()
    sum = 0
    for i in range(0, 99): #make sum so we can find average
        sum += times[i]
    print("Avg time taken for " + filenames[j] + ": " + str(sum / 100) + " milliseconds")