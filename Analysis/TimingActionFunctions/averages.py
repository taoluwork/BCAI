print("\nAverages are being calculated\n")


startProvidingFile = open("StartProviding.txt", "r")
updateProvidingFile = open("UpdateProviding.txt", "r")
stopProvidingFile = open("StopProviding.txt", "r")

startRequestFile = open("StartRequest.txt", "r")
updateRequestFile = open("UpdateRequest.txt", "r")
stopRequestFile = open("StopRequest.txt", "r")


startVals = startProvidingFile.readlines()
updateVals = updateProvidingFile.readlines()
stopVals = stopProvidingFile.readlines()

startRequestVals = startRequestFile.readlines()
updateRequestVals = updateRequestFile.readlines()
stopRequestVals = stopRequestFile.readlines()


startSum = 0
updateSum = 0
stopSum = 0

startRequestSum = 0
updateRequestSum = 0
stopRequestSum = 0


for i in startVals:
    startSum += float(i[slice(len(i)-2)])

for i in updateVals:
    updateSum += float(i[slice(len(i)-2)])

for i in stopVals:
    stopSum += float(i[slice(len(i)-2)])


for i in startRequestVals:
    startRequestSum += float(i[slice(len(i)-2)])

for i in updateRequestVals:
    updateRequestSum += float(i[slice(len(i)-2)])

for i in stopRequestVals:
    stopRequestSum += float(i[slice(len(i)-2)])

print("\nThe average time of start providing is " + str(round(startSum/len(startVals), 2)) + "\n")
print("\nThe average time of update providing is " + str(round(updateSum/len(updateVals), 2)) + "\n")
print("\nThe average time of stop providing is " + str(round(stopSum/len(stopVals), 2)) + "\n")
print("\nThe average time of start request is " + str(round(startRequestSum/len(startRequestVals), 2)) + "\n")
print("\nThe average time of update request is " + str(round(updateRequestSum/len(updateRequestVals), 2)) + "\n")
print("\nThe average time of stop request is " + str(round(stopRequestSum/len(stopRequestVals), 2)) + "\n")