import http.server
import socketserver
import threading
import os
import time
import json

PORT = 8001
WEB_DIR = "/home/usuario/Escritorio/UNI/5UNI/TFG/SIMULADOR-REDES-ORDENADORES-XR/14-Demo_Ping_Con_Despliegue_Servidor_Y_XRVR_Gafas_(I)/"
LABS_DIR = "/home/usuario/Escritorio/UNI/5UNI/TFG/SIMULADOR-REDES-ORDENADORES-XR/14-Demo_Ping_Con_Despliegue_Servidor_Y_XRVR_Gafas_(I)/labs/"

estado = {
    "paquetes": [],
    "nombre_escenario": None
}

lock = threading.Lock()

hilo_captura = None


# ---------- VIGILAR CAPTURA ----------
def vigilar_captura(ruta):

    ultima_fecha = 0
    ultimo_paquete = 0

    print(f"[CAPTURA] Escuchando: {ruta}")

    while True:

        if not os.path.exists(ruta):
            time.sleep(1)
            continue

        fecha = os.path.getmtime(ruta)

        if fecha != ultima_fecha:

            try:
                with open(ruta) as f:
                    datos = json.load(f)
            except:
                time.sleep(1)
                continue

            nuevos = []

            for pkt in datos:
                num = int(pkt["_source"]["layers"]["frame"]["frame.number"])

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

        elif self.path.startswith("/labs/"):
            self.servir_lab()

        elif self.path.startswith("/seleccionar"):
            self.seleccionar_escenario()

        elif self.path == "/estado":
            self.enviar_estado()

        else:
            super().do_GET()

        # Llamar a vigilar_captura con ruta_captura como argumento
        if MiHandler.ruta_captura:
            hilo_captura = threading.Thread(target=vigilar_captura, args=(MiHandler.ruta_captura,))
            hilo_captura.start()

    # 🔹 listar carpetas 
    def listar_escenarios(self): 
        carpetas = [ 
            d for d in os.listdir(LABS_DIR) 
            if os.path.isdir(os.path.join(LABS_DIR, d)) 
        ] 
        
        self.responder_json(carpetas)

    # 🔹 seleccionar escenario
    def seleccionar_escenario(self):
        nombre = self.path.split("=")[-1]

        ruta_base = f"{LABS_DIR}{nombre}/lab-{nombre}/lab-{nombre}/shared/merged_capture.json"

        escenario = os.path.join(ruta_base, "escenario.json")

        print(f"Escuchando escenario: {nombre}")

        # Establecer ruta_captura con la ruta obtenida
        MiHandler.ruta_captura = ruta_base

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
        ruta = self.path.replace("/labs/", "") 
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


with socketserver.TCPServer(("", PORT), MiHandler) as httpd:
    print(f"Servidor en http://localhost:{PORT}")
    httpd.serve_forever()