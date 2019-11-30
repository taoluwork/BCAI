import csv

fileOff = open('netTestoff.csv','r')
fileOn  = open('netTeston.csv','r')

readerOff = csv.reader(fileOff,delimiter=',')
readerOn  = csv.reader(fileOn, delimiter=',')

cntOff  = 0
cntOn   = 0
offPass = 0
onPass  = 0
flagOn  = False 
flagOff = False

for row in readerOff:
    if flagOff:
        cntOff += 1 
        if row[1] == 'False':
            offPass += 1
    flagOff = True


for row in readerOn:
    if flagOn:
        cntOn += 1 
        if row[1] == 'True':
            onPass += 1
    flagOn = True

fout = open('outcome.txt', 'w')
fout.write('Tests while internet is off : ' + str(cntOff)  + '\n')
fout.write('Number of failed connections: ' + str(offPass) + '\n')
fout.write('Tests while internet is on  : ' + str(cntOn)  + '\n')
fout.write('Number of good connections  : ' + str(onPass) + '\n')
fout.close()