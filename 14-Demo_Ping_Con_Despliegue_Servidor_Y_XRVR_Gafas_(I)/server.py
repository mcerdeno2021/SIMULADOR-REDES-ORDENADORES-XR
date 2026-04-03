import http.server
import socketserver
import threading
import os
import time
import json

PORT = 8001

WEB_DIR = "/home/usuario/Escritorio/UNI/5º UNI/TFG/SIMULADOR-REDES-ORDENADORES-XR/14-Demo_Ping_Con_Despliegue_Servidor_Y_XRVR_Gafas_(I)/"
LABS_DIR = "/usr/local/share/netgui-kathara/labs/"

estado = {
    "paquetes": [],
    "nombre_escenario": None
}

lock = threading.Lock()

hilo_captura = None
stop_event = threading.Event()


# ---------- VIGILAR CAPTURA ----------
def vigilar_captura(ruta, stop_event):

    ultima_fecha = 0
    ultimo_paquete = 0

    print(f"[CAPTURA] Escuchando: {ruta}")

    while not stop_event.is_set():

        if not os.path.exists(ruta):
            time.sleep(1)
            continue

        try:
            fecha = os.path.getmtime(ruta)
            size = os.path.getsize(ruta)
        except:
            time.sleep(1)
            continue

        # 🔥 Detecta cambios por fecha O tamaño
        if fecha != ultima_fecha:

            try:
                with open(ruta) as f:
                    datos = json.load(f)
            except:
                time.sleep(1)
                continue

            nuevos = []

            for pkt in datos:
                try:
                    num = int(pkt["_source"]["layers"]["frame"]["frame.number"])
                    print(num)
                except:
                    continue

                if num > ultimo_paquete:
                    nuevos.append(num)

            if nuevos:
                with lock:
                    estado["paquetes"].extend(nuevos)

                print("Paquetes nuevos:", nuevos)
                ultimo_paquete = max(nuevos)

            ultima_fecha = fecha

        time.sleep(1)


# ---------- HANDLER ----------
class MiHandler(http.server.SimpleHTTPRequestHandler):
    ruta_captura = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):

        if self.path == "/escenarios":
            self.listar_escenarios()

        elif self.path.startswith("/usr/"):
            self.servir_lab()

        elif self.path.startswith("/seleccionar"):
            self.seleccionar_escenario()

        elif self.path == "/estado":
            self.enviar_estado()

        else:
            super().do_GET()

    # 🔹 listar escenarios
    def listar_escenarios(self):
        carpetas = [
            d for d in os.listdir(LABS_DIR)
            if os.path.isdir(os.path.join(LABS_DIR, d))
        ]

        self.responder_json(carpetas)

    # 🔹 seleccionar escenario
    def seleccionar_escenario(self):
        global hilo_captura, stop_event

        nombre = self.path.split("=")[-1]

        ruta_base = f"{LABS_DIR}{nombre}/lab-{nombre}/lab-{nombre}/shared/merged_capture.json"

        print(f"[SERVER] Nuevo escenario: {nombre}")

        # 🔥 reset estado
        with lock:
            estado["paquetes"] = []
            estado["nombre_escenario"] = nombre

        # 🔥 parar hilo anterior
        if hilo_captura and hilo_captura.is_alive():
            print("[SERVER] Parando captura anterior...")
            stop_event.set()
            hilo_captura.join()

        # 🔥 nuevo evento
        stop_event = threading.Event()

        # 🔥 lanzar nuevo hilo
        hilo_captura = threading.Thread(
            target=vigilar_captura,
            args=(ruta_base, stop_event),
            daemon=True
        )
        hilo_captura.start()

        self.responder_json({"ok": True})

    # 🔹 estado
    def enviar_estado(self):
        with lock:
            data = json.dumps(estado)

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(data.encode())

    def responder_json(self, data):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def servir_lab(self):
        ruta = self.path.replace("/usr/", "")
        archivo = os.path.join(LABS_DIR, ruta)

        if not os.path.exists(archivo):
            self.send_error(404)
            return

        self.send_response(200)

        if archivo.endswith(".json"):
            self.send_header("Content-type", "application/json")

        self.end_headers()

        with open(archivo, "rb") as f:
            self.wfile.write(f.read())


# 🔥 servidor multihilo (IMPORTANTE)
with socketserver.ThreadingTCPServer(("", PORT), MiHandler) as httpd:
    print(f"Servidor en http://localhost:{PORT}")
    httpd.serve_forever()