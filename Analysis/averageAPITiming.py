print("\nAverage is being calculated\n")


APITimingFile = open("APITiming.txt", "r")

APITimingVals = APITimingFile.readlines()

sum = 0


for i in APITimingVals:
    sum += float(i[slice(len(i)-2)])


print("\nThe average time of start providing is " + str(round(sum/len(APITimingVals), 4)) + "\n")
