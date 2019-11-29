import os
import threading
import time
import psutil


class logClass:
    def start(self):
        self.stat = True
    def end(self):
        self.stat = False
    def log(self):
        l=open('../../data/dockTest/usage.csv', 'w')
        l.write('time,cpu,mem\n')
        while self.stat:
            l.write(str(time.time()) + ',' + str(psutil.cpu_percent()) +','+ str(psutil.virtual_memory().percent) + '\n')
            time.sleep(1)

def run():
    iters = 100

    logy = logClass()
    logy.start()
    t1 = threading.Thread(target=logy.log)
    t1.start()

    f = open('../../data/dockTest/data.csv', 'w')
    f.write('iteration,docker start,docker end,execution start,execution end\n')
    f.close()

    for i in range(0, iters):
        print('the current test is: ' + str(i))
        os.system('sudo rm -rf ../../files/image/*')
        os.system('sudo cp ../../../../ML/image.zip ../../files/image/')
        os.system('python3 execute.py ' + str(i))

    logy.end()
    t1.join()


if __name__ == '__main__':
    run()
    print('finished')