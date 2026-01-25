import json
import random
from collections import defaultdict

ruta = "escenario.json"

with open(ruta, "r") as f:
    data = json.load(f)

topologia = data["topologia"]
conexiones = data["conexiones"]

grafo = defaultdict(list)
for c in conexiones:
    grafo[c["origen"]].append(c["destino"])
    grafo[c["destino"]].append(c["origen"])

# SOLO vecinos directos
def destinos(origen):
    return grafo[origen]

def generar(n):
    mensajes = []
    nodos = [nodo["id"] for nodo in topologia]

    for _ in range(n):
        origen = random.choice(nodos)
        vecinos = destinos(origen)
        if not vecinos:
            continue

        destino = random.choice(vecinos)
        t0 = random.randint(0, 20)
        t1 = random.randint(t0 + 1, t0 + 10)

        mensajes.append({
            "origen": origen,
            "destino": destino,
            "tiempoOrigen": t0,
            "tiempoDestino": t1
        })

    return mensajes

cantidad = int(input("Cantidad de mensajes: "))
data["mensajes"] = generar(cantidad)

with open(ruta, "w") as f:
    json.dump(data, f, indent=2)
