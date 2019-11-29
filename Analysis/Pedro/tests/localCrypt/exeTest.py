import psutil
import os
import random
import string
import threading
import time

#sys.argv[]
#1 = pasword
#2 = message input
#3 = mode (0 = text and 1 = file)
#4 = iteration



class logClass:
    def start(self):
        self.stat = True
    def end(self):
        self.stat = False
    def log(self):
        l=open('../../data/localCrypt/usage.csv', 'w')
        l.write('time,cpu,mem\n')
        while self.stat:
            l.write(str(time.time()) + ',' + str(psutil.cpu_percent()) +','+ str(psutil.virtual_memory().percent) + '\n')
            time.sleep(0.01)

def run():
    logy = logClass()
    logy.start()
    t1 = threading.Thread(target=logy.log)
    t1.start()

    iters = 1000

    chars = string.ascii_letters

    f = open('../../data/localCrypt/data.csv', 'w')
    f.write('iteration,start,mid,end,input,output\n')
    f.close()

    for i in range(0, iters):
        print('the current test is: ' + str(i))
        os.system('sudo rm -rf *.txt')
        lenVal = random.randint(1,100)
        rand = ''.join(random.choice(chars) for i in range(lenVal))
        os.system('python3 execute.py testPasswordStrong ' + rand + ' 0 ' +  str(i))
    

    logy.end()
    t1.join()

if __name__ == '__main__':
    run()
    print('finished')

