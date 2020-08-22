
f    = open('../../data/dockTest/logs.txt', 'r')
line = f.readline()

new = ''

while line != '':
    if line.find('top ') >= 0 or line.find('python3') >= 0:
        new = new + line 
    line = f.readline()

f.close()
f = open('../../data/dockTest/logs.txt', 'w')
f.write(new)
f.close()