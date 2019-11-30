import os
import time

iter = 100
f = open('netTest.csv', 'w')
f.write('iteration,data\n')

ans = 'ping: www.google.com: Name or service not known'
ansLen = len(ans)

for i in range(0,iter):
	info = os.popen('ping -c 1 www.google.com').read()
	val = (ansLen <= len(info))
	f.write(str(i) + ',' + str(val)  + '\n')
	print(val)

f.close()
