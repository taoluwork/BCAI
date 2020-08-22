import pystun
import socket

print(pystun.get_ip_info())

#stun_test: sock, host, port, source_ip, source_port, send_data
#?, 130.39.223.54, 54320, 130.39.222.192, 54320, random data
pystun.stun_test(socket, "130.39.223.54", 54320, "130.39.222.192", 54320, "hi")