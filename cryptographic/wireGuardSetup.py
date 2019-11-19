import os
import sys

def install():
    os.system('sudo add-apt-repository ppa:wireguard/wireguard')
    os.system('sudo apt-get update')
    os.system('sudo apt-get install wireguard')

def config(mode=2, otherPubKey='',otherIp='', first=False):
    #mode
    #0 -> host
    #1 -> client
    f = os.popen("ls /etc/wireguard").read().find('wg0.conf')
    #print(f)
    if f == -1 : 
        os.system('(umask 077 && printf "[Interface]\nPrivateKey = " | sudo tee /etc/wireguard/wg0.conf > /dev/null)')
        os.system('wg genkey | sudo tee -a /etc/wireguard/wg0.conf | wg pubkey | sudo tee /etc/wireguard/publickey')
        os.system('printf "ListenPort = 5555\nSaveConfig = false\n" | sudo tee -a /etc/wireguard/wg0.conf')
        if mode == 0:
            os.system('printf "Address = 10.0.0.1/24" | sudo tee -a /etc/wireguard/wg0.conf')
        if mode == 1:
            os.system('printf "Address = 10.0.0.2/24\n [Peer]\nPublicKey = '+otherPubKey+'\nAllowedIPs = 10.0.0.1/32\nEndpoint = '+otherIp+':5555" | sudo tee -a /etc/wireguard/wg0.conf')
    else:
        print("old config found")
        cleanClose()
        if mode == 0 and os.popen("sudo cat /etc/wireguard/wg0.conf").read().find('[Peer]') >= 0:
            print('removing client stuff')
            fileCont = os.popen('sudo head -n -5 /etc/wireguard/wg0.conf').read()
            os.system('sudo rm /etc/wireguard/wg0.conf')
            os.system('(umask 077 && printf "' + fileCont + '" | sudo tee /etc/wireguard/wg0.conf)')
            os.system('printf "Address = 10.0.0.1/24" | sudo tee -a /etc/wireguard/wg0.conf ')

        elif mode == 1 and os.popen("sudo cat /etc/wireguard/wg0.conf").read().find('[Peer]') >= 0:
            print('updating client info')
            fileCont = os.popen('sudo head -n -5 /etc/wireguard/wg0.conf').read()
            print(fileCont)
            os.system('sudo rm /etc/wireguard/wg0.conf')
            os.system('(umask 077 && printf "' + fileCont + '" | sudo tee /etc/wireguard/wg0.conf)')
            os.system('printf "Address = 10.0.0.2/24\n[Peer]\nPublicKey = '+otherPubKey+'\nAllowedIPs = 10.0.0.1/32\nEndpoint = '+otherIp+':5555" | sudo tee -a /etc/wireguard/wg0.conf')

        elif mode == 1 and os.popen("sudo cat /etc/wireguard/wg0.conf").read().find('[Peer]') == -1:
            print('adding the client info')
            fileCont = os.popen('sudo head -n -1 /etc/wireguard/wg0.conf').read()
            print(fileCont)
            os.system('sudo rm /etc/wireguard/wg0.conf')
            os.system('(umask 077 && printf "' + fileCont + '" | sudo tee /etc/wireguard/wg0.conf)')
            os.system('printf "Address = 10.0.0.2/24\n[Peer]\nPublicKey = '+otherPubKey+'\nAllowedIPs = 10.0.0.1/32\nEndpoint = '+otherIp+':5555" | sudo tee -a /etc/wireguard/wg0.conf')

def clientRun(otherPubKey='', otherIp=''):
    config(mode=1, otherPubKey=otherPubKey,otherIp=otherIp)
    os.system('sudo ufw allow 5555')
    os.system('sudo wg-quick up /etc/wireguard/wg0.conf')
    pass

def hostRun():
    config(mode=0)
    os.system('sudo ufw allow 5555')
    os.system('sudo wg-quick up /etc/wireguard/wg0.conf')
 

def cleanClose():
    os.system('sudo wg-quick down /etc/wireguard/wg0.conf')
    os.system('sudo ufw deny 5555')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('error input formatting is incorrect use:')
        print('python3 wireGuardSetup.py [command]')
        print('[command] = install, clientRun, or hostRun')
        print('if command is clientRun= clientRun [HostPubKey] [HostIp]')
        exit()
    if(sys.argv[1] == 'install'):
        install()
    if(sys.argv[1] == 'config'):
       config()
    if(sys.argv[1] == 'clientRun'):
        if len(sys.argv) != 4:
            print("not enough argumetns")
            exit()
        clientRun(sys.argv[2], sys.argv[3])
    if(sys.argv[1] == 'hostRun'):
        hostRun()
    if(sys.argv[1] == 'close'):
        cleanClose()