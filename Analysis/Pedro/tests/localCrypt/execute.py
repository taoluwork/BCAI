#import cryptography
import getpass
import sys
import cryptography.hazmat.backends as backends
import cryptography.hazmat.primitives.asymmetric.rsa as rsa
import cryptography.hazmat.primitives.serialization as serial
import cryptography.hazmat.primitives.hashes as hashes
import cryptography.hazmat.primitives as primitives
import cryptography.hazmat.primitives.asymmetric.padding as padding
import time
class crypto:
    def generate(self, passW):
        keyPair = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend= backends.default_backend()
        )

        privatePem = keyPair.private_bytes(
        encoding=serial.Encoding.PEM,
        format=serial.PrivateFormat.PKCS8,
        encryption_algorithm=serial.BestAvailableEncryption(passW.encode())
        )
        publicPem = keyPair.public_key().public_bytes(
            serial.Encoding.PEM,
            serial.PublicFormat.SubjectPublicKeyInfo

        )

        privateFile = open("privKey.txt", "w")
        publicFile  = open("pubKey.txt", "w")
        privateFile.write(privatePem.decode())
        publicFile.write(publicPem.decode())

    def encrypt(self, message="",mode=0):
        #mode 0 = string
        #mode 1 = file
        publicFile = None
        pubKey     = None
        outMess    = None
        publicFile = open("pubKey.txt", 'rb')
        pubKey = serial.load_pem_public_key(
            publicFile.read(),
            backend=backends.default_backend()
        )
        if mode == '0':
            return pubKey.encrypt(
                message.encode(),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm= hashes.SHA256(),
                    label=None 
                )
            )
        if mode == 1:
            enc = pubKey.encrypt(
                open(message, 'rb').read(),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm= hashes.SHA256(),
                    label=None 
                )
            )
            open(message, "wb").write(enc)
            return(message)
    def decrypt(self, message="",mode=0, passW=""):
        #mode 0 = string
        #mode 1 = file
        privateFile = None
        privKey     = None

        privateFile = open("privKey.txt", 'rb')
        privKey = serial.load_pem_private_key(
            privateFile.read(),
            password=passW.encode(),
            backend=backends.default_backend()
        )

        if mode == '0':
            return privKey.decrypt(
                message,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm= hashes.SHA256(),
                    label=None 
                )
            )
        if mode == 1:
            dec = privKey.decrypt(
                open(message, 'rb').read(),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm= hashes.SHA256(),
                    label=None 
                )
            )
            open(message, "wb").write(dec)
            return message 

password = sys.argv[1]

start = time.time()
cry = crypto()
cry.generate(password)
encrypted = cry.encrypt(sys.argv[2],sys.argv[3])
decrypted = cry.decrypt(encrypted, sys.argv[3] , password)
end = time.time()

f = open('../../data/localCrypt/data.csv', 'ab')
f.write(sys.argv[4].encode() + b',' + str(start).encode() + b',' + str(end).encode() + b',' + sys.argv[2].encode() + b',' + decrypted + b'\n')
f.close()


#sys.argv[]
#1 = pasword
#2 = message input
#3 = mode (0 = text and 1 = file)
#4 = iteration