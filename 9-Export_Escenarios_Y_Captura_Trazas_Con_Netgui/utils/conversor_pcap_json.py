import json
import subprocess
from collections import defaultdict

PCAP_FILE = "cap.pcap"
OUTPUT_JSON = "escenario.json"

# Ejecutar tshark y sacar campos clave
cmd = [
    "tshark",
    "-r", PCAP_FILE,
    "-T", "fields",
    "-e", "frame.time_epoch",
    "-e", "ip.src",
    "-e", "ip.dst"
]
result = subprocess.run(cmd, capture_output=True, text=True)
lines = result.stdout.strip().split("\n")

paquetes = []
nodos = set()

for line in lines:
    partes = line.split(",")
    if len(partes) < 5:
        continue

    tiempo, ip_src, ip_dst, eth_src, eth_dst = partes

    src = ip_src if ip_src else eth_src
    dst = ip_dst if ip_dst else eth_dst

    if not src or not dst:
        continue

    tiempo = float(tiempo)
    paquetes.append((tiempo, src, dst))
    nodos.add(src)
    nodos.add(dst)

# ⚠️ Comprobar antes de usar
if not paquetes:
    print("❌ No se encontraron paquetes válidos")
    exit(1)

# Normalizar tiempo para empezar en 0
tiempo_base = paquetes[0][0]
paquetes = [(t - tiempo_base, s, d) for t, s, d in paquetes]

# Crear nodos en posiciones automáticas
ips = sorted(list(ips))
topologia = []
for i, ip in enumerate(ips):
    topologia.append({
        "id": ip,
        "posicion": f"{i * 3} 1 0"
    })

# Crear conexiones únicas
conexiones_set = set()
for _, s, d in paquetes:
    conexiones_set.add(tuple(sorted([s, d])))

conexiones = [{"origen": a, "destino": b} for a, b in conexiones_set]

# Crear mensajes (duración fija visual)
mensajes = []
for i, (t, s, d) in enumerate(paquetes):
    mensajes.append({
        "origen": s,
        "destino": d,
        "tiempoOrigen": round(t, 3),
        "tiempoDestino": round(t + 0.4, 3)
    })

escenario = {
    "topologia": topologia,
    "conexiones": conexiones,
    "mensajes": mensajes
}

with open(OUTPUT_JSON, "a") as f:
    json.dump(escenario, f, indent=2)

print(f"✅ Escenario generado en {OUTPUT_JSON}")