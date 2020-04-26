import csv
dataFolder = '../../data/dockTest/'
outcome    = '../../outcome/dockTest/'


def getVali():
    file = open(dataFolder + 'data.csv' , 'r')
    reader = csv.reader(file,delimiter=',')
    
    outD = open(outcome+'dockVali.txt', 'w')
    outE = open(outcome+'dockExe.txt', 'w')

    tot      = 0
    dockPass = 0
    exePass = 0
    flag     = False

    for row in reader:
        if flag:
            tot +=1
            if float(row[2]) - float(row[1]) >= 1:
                dockPass += 1
            if float(row[4]) - float(row[3]) >= 1:
                exePass += 1
        flag = True

    outD.write('total tests  : ' + str(tot) + '\n')
    outE.write('total tests  : ' + str(tot) + '\n')
    outD.write('tests passed : ' + str(dockPass) + '\n')
    outE.write('tests passed : ' + str(exePass)  + '\n')
    
    outD.close()
    outE.close()
    file.close()


def getAvg():
    file = open(dataFolder + 'data.csv' , 'r')
    reader = csv.reader(file,delimiter=',')
    
    outD = open(outcome+'dockTimeAvg.txt', 'w')
    outE = open(outcome+'exeTimeAvg.txt', 'w')

    tot      = 0
    dockTot  = 0
    exeTot   = 0
    flag     = False

    for row in reader:
        if flag:
            tot += 1
            dockTot += ( float(row[2]) - float(row[1]) )
            exeTot  += ( float(row[4]) - float(row[3]) )
        flag = True 
    
    outD.write('average time : ' + str(dockTot/tot) + '\n')
    outE.write('average time : ' + str(exeTot/tot)  + '\n')

    outD.close()
    outE.close()
    file.close()

def getCpuMem():
    fileD = open(dataFolder + 'data.csv' , 'r')
    readerD = csv.reader(fileD,delimiter=',')
    fileU = open(dataFolder + 'usage.csv' , 'r')
    readerU = csv.reader(fileU,delimiter=',')
    
    outD = open(outcome+'dockUsageAvg.txt', 'w')
    outE = open(outcome+'exeUsageAvg.txt', 'w')

    flagD = False

    totDockC = 0
    cntDock = 0
    totDockM = 0

    totExeC = 0
    cntExe = 0
    totExeM = 0

    for rowD in readerD:
        if flagD:
            flagU = False
            for rowU in readerU:
                if flagU:
                    #docker fit
                    if float(rowD[1]) <= float(rowU[0]) and float(rowD[2]) >= float(rowU[0]):
                        cntDock  += 1
                        totDockC += float(rowU[1])
                        totDockM += float(rowU[2])
                    #exe fit
                    if float(rowD[3]) <= float(rowU[0]) and float(rowD[4]) >= float(rowU[0]):
                        cntExe  += 1
                        totExeC += float(rowU[1])
                        totExeM += float(rowU[2])
                flagU = True
        flagD = True

    print(totDockC)
    print(totDockM)
    print(totExeC)
    print(totExeM)

    outD.write('average CPU usage:' + str(totDockC/cntDock) + '\n')
    outD.write('average MEM usage:' + str(totDockM/cntDock) + '\n')
    outE.write('average CPU usage:' + str(totExeC/cntExe)  + '\n')
    outE.write('average MEM usage:' + str(totExeM/cntExe)  + '\n')

    fileD.close()
    fileU.close()
    outD.close()
    outE.close()

getVali()
getAvg()
getCpuMem()