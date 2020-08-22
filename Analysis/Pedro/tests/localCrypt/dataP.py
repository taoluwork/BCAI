import csv
dataFolder = '../../data/localCrypt/'
outcome    = '../../outcome/localCrypt/'

def setVali():
    file = open(dataFolder + 'data.csv' , 'r')
    reader = csv.reader(file,delimiter=',')
    
    outF = open(outcome+'validation.txt', 'w')

    cor = 0
    tot = -1

    for row in reader:
        tot += 1
        if row[4] == row[5]:
            cor += 1
    outF.write('Total Tests:   ' + str(tot) + '\n')
    outF.write('Total Correct: ' + str(cor)) 
    outF.close()
    file.close()

def setAvgEnc():
    file = open(dataFolder + 'data.csv', 'r')
    reader = csv.reader(file, delimiter=',')
    
    outF = open(outcome + 'EncTime.txt', 'w')
    
    cnt = 0
    tot = 0
    flag = True
    for row in reader:
        if flag == False:
            cnt += 1
            tot += ( float(row[2]) - float(row[1]) )
        flag = False
    print(cnt)
    print(tot)
    outF.write('average: ' + str( tot/cnt ) + ' seconds')

    outF.close()
    file.close()

def setAvgDec():
    file = open(dataFolder + 'data.csv', 'r')
    reader = csv.reader(file, delimiter=',')
    
    outF = open(outcome + 'DecTime.txt', 'w')
    
    cnt = 0
    tot = 0
    flag = True
    for row in reader:
        if flag == False:
            cnt += 1
            tot += ( float(row[3]) - float(row[2]) )
        flag = False
    print(cnt)
    print(tot)
    outF.write('average: ' + str( tot/cnt ) + ' seconds')

    outF.close()
    file.close()    

def cpuAvg():
    file = open(dataFolder + 'usage.csv', 'r')
    reader = csv.reader(file, delimiter=',')
    
    outF = open(outcome+'cpuAvg.txt' , 'w')

    tot = 0
    cnt = 0
    flag = False

    for row in reader:
        if flag:
            cnt += 1
            tot += (float(row[1]))
        flag = True
    
    outF.write('average cpu usage: ' + str(tot/cnt))

    outF.close()
    file.close()

def memAvg():
    file = open(dataFolder + 'usage.csv', 'r')
    reader = csv.reader(file, delimiter=',')
    
    outF = open(outcome+'memAvg.txt' , 'w')

    tot = 0
    cnt = 0
    flag = False

    for row in reader:
        if flag:
            cnt += 1
            tot += (float(row[2]))
        flag = True
    
    outF.write('average mem usage: ' + str(tot/cnt))

    outF.close()
    file.close()


setVali()
setAvgEnc()
setAvgDec()
cpuAvg()
memAvg()