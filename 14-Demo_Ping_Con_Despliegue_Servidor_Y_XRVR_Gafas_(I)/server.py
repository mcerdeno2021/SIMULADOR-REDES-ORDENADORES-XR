import http.server
import socketserver
import os
import time
import json
import threading
import subprocess
import sys

PORT = 8000
# Carpeta donde están index.html + json de netgui
DIRECTORIO = "/home/usuario/Escritorio/UNI/5 UNI/TFG/SIMULADOR-REDES-ORDENADORES-XR/13-Demo_Ping_Con_Despliegue_Servidor_Y_XRVR_Gafas"
CAPTURA = "lab-ping/shared/merged_capture.json"

NETGUI_CMD = "netgui-kathara.sh"

os.chdir(DIRECTORIO)


# ---------- SERVIDOR HTTP ----------
def lanzar_servidor():
    if len(sys.argv) > 1:
        argumento = sys.argv[1]
        PORT = int(argumento)
        Handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Servidor en http://localhost:{PORT}")
            httpd.serve_forever()
    else:
        print("No se pasaron argumentos.")


# ---------- LANZAR NETGUI ----------
def lanzar_netgui():

    print("Lanzando NetGUI...")

    try:
        subprocess.Popen([NETGUI_CMD])
    except Exception as e:
        print("Error lanzando NetGUI:", e)


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

            print("\nCambio detectado en merged_capture.json")

            try:
                with open(ruta) as f:
                    datos = json.load(f)
            except:
                print("Archivo aún escribiéndose...")
                time.sleep(1)
                continue

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
threading.Thread(target=lanzar_netgui, daemon=True).start()

vigilar_captura()