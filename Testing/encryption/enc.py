import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def genKey(keyFile="", nonceFile=""):
    f = open(keyFile, 'w')
    f.close()
    f = open(nonceFile, 'w')
    f.close()
    key = os.urandom(32)
    nonce = os.urandom(2048)
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



mess = b"aaaa aaaa"
genKey("key.txt","nonce.txt")
[key, nonce] = getKey("key.txt","nonce.txt")
val = enc(key, nonce, mess)
print(dec(key, nonce, val))