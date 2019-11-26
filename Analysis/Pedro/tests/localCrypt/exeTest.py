import os
import random
import string
#sys.argv[]
#1 = pasword
#2 = message input
#3 = mode (0 = text and 1 = file)
#4 = iteration

iters = 1000

chars = string.ascii_letters

f = open('../../data/localCrypt/data.csv', 'w')
f.write('iteration,start,end,input,output\n')
f.close()

for i in range(0, iters):
    print('the current test is: ' + str(i))
    os.system('sudo rm -rf *.txt')
    lenVal = random.randint(1,100)
    rand = ''.join(random.choice(chars) for i in range(lenVal))
    os.system('python3 execute.py testPasswordStrong ' + rand + ' 0 ' +  str(i))

