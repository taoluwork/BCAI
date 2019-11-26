import os

iters = 100

f = open('../../data/dockTest/data.csv', 'w')
f.write('iteration,docker start,docker end,execution start,execution end\n')
f.close()

for i in range(0, iters):
    print('the current test is: ' + str(i))
    os.system('sudo rm -rf ../../files/image/*')
    os.system('sudo cp /home/pedriv/Documents/BCAI/ML/image.zip ../../files/image/')
    os.system('python3 execute.py ' + str(i))

