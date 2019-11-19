import time
import gc

gc.enable()
filenames = ["1MB.txt", "10MB.txt", "100MB.txt", "1GB.txt"]
for j in range(0, 4): #run once for each file size in above list
    times = []
    for i in range(0, 100): #1000 iterations
        #print(i)
        start = int(round(time.time() * 1000)) #start time in ms
        file = open(filenames[j], "r")
        f = file.read() #reading in file
        file.close()
        timetaken = int(round(time.time() * 1000)) - start #diff between current and start time
        times.append(timetaken) #add to list
        gc.collect() #collect garbage
    sum = 0
    for i in range(0, 100): #make sum so we can find average
        sum += times[i]
    print("Avg time taken for " + filenames[j] + ": " + str(sum / 100) + " milliseconds")