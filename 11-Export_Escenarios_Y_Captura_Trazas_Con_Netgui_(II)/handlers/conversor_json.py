import json
import os
import pyshark

MAPA_IP_NODO = {
    "172.16.253.5": "pc1",
    "172.16.253.20": "pc2",
    "172.16.253.1": "r1",
    "172.16.253.2": "r2",
    "172.16.253.3": "r3"
}

def convertir_nkp(NKP_FILE):
    with open(NKP_FILE, "r") as file:
        netgui_nkp = file.read()

    nodes = []
    connections = []

    lineas = netgui_nkp.split('\n')
    linea_anterior = None

    for line in lineas:
        if not line.strip():
            continue

        parts = line.split(';')

        if 'position' in parts[0]:
            position_parts = parts[0].split('(')[1].split(')')[0].split(',')
            x, z = (float(position_parts[0]) / 20) - 25, (float(position_parts[1]) / 20) - 25
            node_name = parts[1].strip().split('"')[1]

            nodes.append({
                "id": node_name,
                "posicion": f"{x} 1 {z}"
            })

        elif 'To' in parts[0]:
            source = parts[0].split('"')[1]
            target = linea_anterior.split('"')[1]

            connections.append({
                "origen": source,
                "destino": target
            })

        linea_anterior = line

    return nodes, connections


def convertir_pcap(PCAP_FILE, mapa_ip_nodo):

    cap = pyshark.FileCapture(PCAP_FILE, keep_packets=False)

    mensajes = []
    id_mensaje = 1
    tiempo_base = None

    for packet in cap:

        if 'IP' not in packet:
            continue

        if tiempo_base is None:
            tiempo_base = float(packet.sniff_timestamp)

        timestamp = float(packet.sniff_timestamp) - tiempo_base

        src_ip = packet.ip.src
        dst_ip = packet.ip.dst

        mensaje = {
            "id": id_mensaje,
            "timestamp": timestamp,
            "origen": mapa_ip_nodo.get(src_ip, "desconocido"),
            "destino": mapa_ip_nodo.get(dst_ip, "desconocido"),

            "ethernet": {},
            "ip": {},
        }

        # Ethernet
        if 'ETH' in packet:
            mensaje["ethernet"] = {
                "src_mac": packet.eth.src,
                "dst_mac": packet.eth.dst
            }

        # IP
        mensaje["ip"] = {
            "src": src_ip,
            "dst": dst_ip,
            "ttl": packet.ip.ttl
        }

        # TCP
        if 'TCP' in packet:
            mensaje["tcp"] = {
                "src_port": packet.tcp.srcport,
                "dst_port": packet.tcp.dstport,
                "flags": packet.tcp.flags
            }

        # UDP
        if 'UDP' in packet:
            mensaje["udp"] = {
                "src_port": packet.udp.srcport,
                "dst_port": packet.udp.dstport
            }

        mensajes.append(mensaje)
        id_mensaje += 1

    cap.close()
    return mensajes


if __name__ == "__main__":

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    NKP_FILE = os.path.join(BASE_DIR, "netgui.nkp")
    PCAP_FILE = os.path.join(BASE_DIR, "cap.pcapng")
    OUTPUT_FILE = os.path.join(BASE_DIR, "../escenario.json")

    topologia, conexiones = convertir_nkp(NKP_FILE)
    mensajes = convertir_pcap(PCAP_FILE)

    escenario = {
        "topologia": topologia,
        "conexiones": conexiones,
        "mensajes": mensajes
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(escenario, f, indent=2)

    print("JSON generado correctamente")
