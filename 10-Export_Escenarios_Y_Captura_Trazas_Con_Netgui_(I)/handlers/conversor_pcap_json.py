import os
import json
import pyshark

# =========================
# CONFIGURACIÓN
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PCAP_FILE = os.path.join(BASE_DIR, "cap.pcapng")
OUTPUT_FILE = os.path.join(BASE_DIR, "../escenario.json")


def obtener_clave_conversacion(packet):
    """
    Genera una clave única por conversación:
    protocolo_ip:puerto <-> ip:puerto
    """

    if 'IP' not in packet:
        return None

    src_ip = packet.ip.src
    dst_ip = packet.ip.dst

    protocolo = packet.transport_layer
    if protocolo is None:
        return None

    try:
        src_port = packet[protocolo].srcport
        dst_port = packet[protocolo].dstport
    except:
        return None

    # Normalizamos orden para que A→B y B→A sea la misma conversación
    extremos = sorted([
        f"{src_ip}:{src_port}",
        f"{dst_ip}:{dst_port}"
    ])

    return f"{protocolo} | {extremos[0]} <-> {extremos[1]}"


def convertir_pcap_a_json():
    if not os.path.exists(PCAP_FILE):
        print(f"No existe el archivo: {PCAP_FILE}")
        return

    print("Leyendo PCAP...")
    cap = pyshark.FileCapture(PCAP_FILE, keep_packets=False)

    conversaciones = {}

    for packet in cap:
        clave = obtener_clave_conversacion(packet)
        if clave is None:
            continue

        tiempo = float(packet.sniff_timestamp)
        longitud = int(packet.length)

        if clave not in conversaciones:
            conversaciones[clave] = []

        conversaciones[clave].append({
            "timestamp": tiempo,
            "length": longitud
        })

    cap.close()

    # Si no hay paquetes
    if not conversaciones:
        print("No se encontraron conversaciones válidas.")
        return

    # Normalizar tiempo base por conversación
    for clave in conversaciones:
        tiempo_base = conversaciones[clave][0]["timestamp"]
        for pkt in conversaciones[clave]:
            pkt["timestamp"] -= tiempo_base

    with open(OUTPUT_FILE, "w") as f:
        json.dump(conversaciones, f, indent=4)

    print(f"JSON generado en: {OUTPUT_FILE}")


if __name__ == "__main__":
    convertir_pcap_a_json()
