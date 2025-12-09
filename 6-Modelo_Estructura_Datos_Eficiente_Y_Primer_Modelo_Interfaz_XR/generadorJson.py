import json
import random
from collections import defaultdict, deque

ruta = "escenario.json"

with open(ruta, "r") as f:
    data = json.load(f)

topologia = data["topologia"]
conexiones = data["conexiones"]

grafo = defaultdict(list)
for c in conexiones:
    grafo[c["origen"]].append(c["destino"])
    grafo[c["destino"]].append(c["origen"])

def destinos(origen):
    visitados = set()
    cola = deque([origen])
    while cola:
        n = cola.popleft()
        if n not in visitados:
            visitados.add(n)
            for v in grafo[n]:
                if v not in visitados:
                    cola.append(v)
    visitados.discard(origen)
    return list(visitados)

def generar(n):
    mensajes = []
    nodos = [nodo["id"] for nodo in topologia]
    for _ in range(n):
        origen = random.choice(nodos)
        dpos = destinos(origen)
        if not dpos:
            continue
        destino = random.choice(dpos)
        t0 = random.randint(0, 20)
        t1 = random.randint(t0 + 1, t0 + 10)
        mensajes.append({
            "origen": origen,
            "destino": destino,
            "tiempoOrigen": t0,
            "tiempoDestino": t1
        })
    return mensajes

cantidad = int(input())
data["mensajes"] = generar(cantidad)

with open(ruta, "w") as f:
    json.dump(data, f, indent=2)
