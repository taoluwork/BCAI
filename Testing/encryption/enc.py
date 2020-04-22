import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import time

def genKey(keyFile="", nonceFile="", keyLen=0):
    f = open(keyFile, 'w')
    f.close()
    f = open(nonceFile, 'w')
    f.close()
    key = os.urandom(keyLen)
    nonce = os.urandom(keyLen)
    f = open(keyFile, 'wb')
    f.write(key)
    f.close()
    f = open(nonceFile, 'wb')
    f.write(nonce)
    f.close()    
def getKey(keyFile="", nonceFile=""):
    f = open(keyFile, 'rb')
    key = f.read()
    f.close()
    f = open(nonceFile, 'rb')
    nonce = f.read()
    f.close()
    return [key, nonce]

def enc(key=b"", nonce=b"", mess=b""):
    alg = algorithms.AES(key)
    cipher = Cipher(alg, modes.GCM(nonce), default_backend())
    encryptor = cipher.encryptor()
    return encryptor.update(mess)

def dec(key=b"", nonce=b"", mess=b""):
    alg = algorithms.AES(key)
    cipher = Cipher(alg, modes.GCM(nonce), default_backend())
    decryptor = cipher.decryptor()
    return decryptor.update(mess)


mess = b"aaaa"*(10**8)
def Test(len=0):
    global mess
    startVal = time.time()
    genKey("key.txt","nonce.txt", len)
    [key, nonce] = getKey("key.txt","nonce.txt")
    val = enc(key, nonce, mess)
    print (mess == dec(key, nonce, val))
    return (time.time() - startVal)

outcomeLow  = []
outcomeHigh = []
numTests    = 50

for i in range(0, numTests):
    out = Test(16)
    outcomeLow.append(out)


for i in range(0, numTests):
    out = Test(32)
    outcomeHigh.append(out)


averageLow = sum(outcomeLow)/len(outcomeLow)
averageHigh = sum(outcomeHigh)/len(outcomeHigh)
print("128 bits value: " + str(averageLow))
print("256 bits value: " + str(averageHigh))