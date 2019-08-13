import tensorflow as tf
import json
import sys

dockTagType = ''
localEdit = ''
buffer = ''
fin = '.save("result.h5")\n'
fileCont = []
mod = ''
ver = ''
acc = ''
loss= ''
count = 0

################################################################################
###			testing and adjust for multi gpu	 	     ###
################################################################################

dev = tf.contrib.eager.list_devices()
for i in dev:
  if i.find('CPU') > 0 :
    dev[dev.index(i)] = ''
  elif i.find('GPU') >0 :
    dev[dev.index(i)] = ''
devA = []
for i in dev:
  if i != '':
    devA.append(i)
dev=devA

#dev=['a', 'b']

if len(dev) >1:
  dockTagType = '-gpu'
  ##this is specific for keras tf I belieive
  a = 'strat = tf.distribute.MirroredStrategy(devices = ' + str(dev)  + '  )\n'
  localEdit   = [a, 'with strat.scope():\n']
  buffer = '  '

elif len(dev) == 1:
  dockTagType = ''
  localEdit   = ''

else:
  dockTagType = ''
  localEdit   = ''

################################################################################
###                           parese the file if needed                      ###
################################################################################
path = sys.argv[1]

for line in open(path, 'r'):
  if line.find('###tfVersion = ') >=0:
    ver = line.replace('###tfVersion = ', '')
    ver = ver.replace('\n', '')
  elif line.find('###model = ')>=0:
    mod = line.replace('###model = ',"")
    mod = mod.replace('\n','')
  elif len(buffer) >=2 and line.find("compile")>=0:
    fileCont.append( mod + " = keras.utils.multi_gpu_model("+mod+", gpus="+str(len(dev))+", cpu_merge-True)")
  elif line.find('###accuracy = ')>=0:
    acc = line.replace('###accuracy = ', '')
    acc = acc.replace('\n', '')
  elif line.find('###loss = ')>=0:
    loss = line.replace('###loss = ', '')
    loss = loss.replace('\n', '')
  else:
    fileCont.append(line)

fileCont.append(mod+fin)


################################################################################
###				save the accuracy			     ###
################################################################################
val = '{"acc":\'+str(' + acc + ')+\', "loss":\'+str(' + loss + ')+\'}'
fileCont.append('f = open("result.txt" , "w")\nf.write(\''+ val +'\')\nf.close()');



################################################################################
###                             generate version file                        ###
################################################################################

f = open('version.json', 'w')
f.write('{"ver":"'+ ver +'"}') #############this is very very very bad!!!! can lead to arbitrary code execution!!!!
f.close()

################################################################################
###				recombine the file			     ###
################################################################################

f = open('execute.py', 'w')
for i in fileCont:
  f.write(i)
f.close()

################################################################################
###			   	      post			             ###
################################################################################

fileCont = []
for line in open(path, 'r'):
  if line.find('.fit')>=0:
    fileCont.append("#"+line)
  elif line.find('###model = ')>=0 :
    model = line.replace('###model = ',"")
    model = model.replace('\n','')
  elif line.find('###local')>=0:
    fileCont.append(model+ ' = keras.models.load_model("result.h5")\n')
  elif line.find('###accuracy = ')>=0:
    acc = line.replace('###accuracy = ', '')
    acc = acc.replace('\n', '')
  elif line.find('###loss = ')>=0:
    loss = line.replace('###loss = ', '')
    loss = loss.replace('\n', '')
  else:
    fileCont.append(line)

val = '{"acc":\'+str(' + acc + ')+\', "loss":\'+str(' + loss + ')+\'}'
fileCont.append('f = open("eval.txt" , "w")\nf.write(\''+ val +'\')\nf.close()');

f = open('eval.py', 'w')
for i in fileCont:
  f.write(i)
f.close()
