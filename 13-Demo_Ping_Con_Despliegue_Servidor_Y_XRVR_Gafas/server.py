import http.server
import socketserver
import os
import time
import json
import threading

PORT = 8000
# Carpeta donde están index.html + json de netgui
DIRECTORIO = "C:/Users/MiguelCerdeño/OneDrive - ayscom/Documentos/Uni/TFG/13-Demo_Ping_Con_Despliegue_Servidor_Y_XRVR_Gafas"
CAPTURA = "captura.json"

os.chdir(DIRECTORIO)

# ---------- SERVIDOR HTTP ----------
def lanzar_servidor():
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Servidor en http://localhost:{PORT}")
        httpd.serve_forever()

# ---------- DETECTOR DE CAMBIOS ----------
def vigilar_captura():

    ruta = os.path.join(DIRECTORIO, CAPTURA)

    ultima_fecha = 0
    ultimo_paquete = 0

    while True:

        if not os.path.exists(ruta):
            time.sleep(1)
            continue

        fecha = os.path.getmtime(ruta)

        # Si cambió el archivo
        if fecha != ultima_fecha:

            print("\nCambio detectado en captura.json")

            with open(ruta) as f:
                datos = json.load(f)

            # buscar paquetes nuevos
            nuevos = []
            for pkt in datos:
                num = int(pkt["_source"]["layers"]["frame"]["frame.number"])
                if num > ultimo_paquete:
                    nuevos.append(num)

            if nuevos:
                print("Paquetes nuevos:", nuevos)
                ultimo_paquete = max(nuevos)

            ultima_fecha = fecha

        time.sleep(1)

# ---------- LANZAR TODO ----------
threading.Thread(target=lanzar_servidor, daemon=True).start()

vigilar_captura()