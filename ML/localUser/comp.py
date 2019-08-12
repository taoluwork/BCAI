f = open("result.txt")
test = f.readline()
f.close
f = open("eval.txt")
evaluate = f.readline()
f.close()

ret = str(test == evaluate) + '\n' + test + '\n' + evaluate 

f = open("fin.txt", 'w')
f.write(ret)
f.close