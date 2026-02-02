import json
import random
from collections import defaultdict
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
ruta = os.path.join(base_dir, "../escenario.json")

with open(ruta, "r", encoding="utf-8") as f:
    datos = f.read()

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

def generar(n, duracion):
    mensajes = []
    nodos = [nodo["id"] for nodo in topologia]

    for _ in range(n):
        origen = random.choice(nodos)
        vecinos = destinos(origen)
        if not vecinos:
            continue

        destino = random.choice(vecinos)
        t0 = random.randint(0, duracion - 1)
        t1 = random.randint(t0 + 1, duracion)

        mensajes.append({
            "origen": origen,
            "destino": destino,
            "tiempoOrigen": t0,
            "tiempoDestino": t1
        })

    return mensajes

cantidad = int(input("Cantidad de mensajes: "))
duracion = int(input("Tiempo total en segundos: "))
data["mensajes"] = generar(cantidad, duracion)

with open(ruta, "w") as f:
    json.dump(data, f, indent=2)
