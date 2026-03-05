AFRAME.registerComponent('historia', {
  schema: {
    intervaloPrecision: { type: 'number', default: 0.1 }
  },

  init: function () {
    const el = this.el;

    this.comienzos = {};
    this.finales = {};
    this.activosPorTiempo = {};
    this.historias = [];
    this.paneles = [];
    this.ejes = [];

    this.interfacesVisuales = [];
    this.dominiosVisuales = [];

    this.coloresProtocolos = {};
    this.protocolosDetectados = new Set();

    fetch('handlers/escenario.json')
      .then(r => r.json())
      .then(datos => {

        const { nodes, links } = datos;

        const mapaTopologia = {};
        const mapaNodos = {};

        // =========================================
        // -------- NODOS (ANTES topologia) --------
        // =========================================
        nodes.forEach(nodo => {

          // Convertimos coords → string posición A-Frame
          const posicion = `${parseFloat(nodo.coords.x)/50} 0 ${parseFloat(nodo.coords.z)/50}`;

          mapaTopologia[nodo.id] = posicion;
          mapaNodos[nodo.id] = nodo; // Guardamos nodo completo

          const e = document.createElement('a-entity');

          // Tipo real ahora viene en JSON
          if (nodo.type === 'host') e.setAttribute('ordenador', '');
          else if (nodo.type === 'router') e.setAttribute('router', '');
          else if (nodo.type === 'switch') e.setAttribute('switch', '');
          else if (nodo.type === 'hub') e.setAttribute('hub', '');

          e.setAttribute('position', posicion);
          e.setAttribute('id', nodo.id);

          // 🆕 Guardamos datos útiles como dataset
          e.dataset.type = nodo.type;

          if (nodo.interfaces)
            e.dataset.interfaces = JSON.stringify(nodo.interfaces);

          if (nodo.routing_table)
            e.dataset.routing = JSON.stringify(nodo.routing_table);

          el.appendChild(e);

          this.crearEje(posicion, nodo.id);
        });


        // =========================================
        // -------- CABLES (ANTES conexiones) ------
        // =========================================
        links.forEach(link => {

          const origen = link.source;
          const destino = link.target;

          if (!mapaTopologia[origen] || !mapaTopologia[destino]) return;

          // 🔌 Cable visual
          const cable = document.createElement('a-entity');
          cable.setAttribute(
            'cable',
            `origen:${mapaTopologia[origen]}; destino:${mapaTopologia[destino]}`
          );
          cable.setAttribute('id', `${origen}_${destino}`);
          el.appendChild(cable);

          // 🆕 Guardamos info del link
          cable.dataset.domain = link.col_domain;
          cable.dataset.src_iface = link.src_iface || '';
          cable.dataset.dst_iface = link.dst_iface || '';

          // 🟣 Panel interactivo
          const panel = document.createElement('a-plane');

          panel.setAttribute(
            "panel",
            `
            origenPos:${mapaTopologia[origen]};
            origen:${origen};
            destinoPos:${mapaTopologia[destino]};
            destino:${destino}
            `
          );

          panel.setAttribute('id', `${origen} -> ${destino}`);
          panel.dataset.domain = link.col_domain;

          el.appendChild(panel);
          this.paneles.push(panel);

          // ⬇️ IMPORTANTE
          setTimeout(() => {
            this.crearCartelesInterfaces(links);
            this.crearDominiosColision(links);
          }, 0);
        });
    });
    
    fetch('handlers/captura.json')
      .then(r => r.json())
      .then(datos => {
        // -------- MENSAJES DESDE CAPTURA WIRESHARK --------

        const intervalo = this.data.intervaloPrecision;
        this.max = 0;

        datos.forEach((pktRaw) => {

          const layers = pktRaw._source?.layers;
          if (!layers) return;

          // ============================
          // 1️⃣ EXTRAER LINK (origen/destino nodo)
          // ============================
          let linkInfo = null;

          try {
            const comment = layers.pkt_comment?.["frame.comment"];
            if (comment) {
              linkInfo = JSON.parse(comment);
            }
          } catch (e) {
            console.warn("Error parseando frame.comment", e);
            return;
          }

          if (!linkInfo?.link) return;

          const origenNom = linkInfo.link.src.node;
          const destinoNom = linkInfo.link.dst.node;

          const origen = document.querySelector(`#${origenNom}`);
          const destino = document.querySelector(`#${destinoNom}`);

          if (!origen || !destino) return;

          // ============================
          // 2️⃣ TIEMPO
          // ============================
          const timestamp = parseFloat(layers.frame["frame.time_relative"]);
          const t0 = Math.round(timestamp / intervalo) * intervalo;
          const t1 = t0 + 5;

          // ============================
          // 3️⃣ PROTOCOLO
          // ============================
          let protocolo = layers.frame["frame.coloring_rule.name"];

          if (!protocolo) {
            protocolo = "UNKNOWN";
          }

          // ============================
          // 4️⃣ INFO EXTRA
          // ============================
          let info = "";

          if (layers.ip) {
            info += `${layers.ip["ip.src"]} → ${layers.ip["ip.dst"]} `;
            info += `TTL=${layers.ip["ip.ttl"]}`;
          }

          if (layers.arp) {
            info += `ARP ${layers.arp["arp.src.proto_ipv4"]} → ${layers.arp["arp.dst.proto_ipv4"]}`;
          }

          if (layers.icmp) {
            info += ` ICMP type=${layers.icmp["icmp.type"]}`;
          }

          // ============================
          // 5️⃣ OBJETO MENSAJE COMPATIBLE
          // ============================
          const m = {
            id: parseInt(layers.frame["frame.number"]),
            timestamp: timestamp,
            origen: origenNom,
            destino: destinoNom,
            protocol: protocolo,
            length: parseInt(layers.frame["frame.len"]),
            info: info,
            ethernet: layers.eth ? {
              src_mac: layers.eth["eth.src"],
              dst_mac: layers.eth["eth.dst"]
            } : null,
            ip: layers.ip ? {
              src: layers.ip["ip.src"],
              dst: layers.ip["ip.dst"],
              ttl: layers.ip["ip.ttl"]
            } : null,
            icmp: layers.icmp ? {
              type: layers.icmp["icmp.type"],
              code: layers.icmp["icmp.code"]
            } : null
          };

          // ============================
          // 6️⃣ GUARDAR EN HISTORIA
          // ============================
          this.historias.push({
            id: m.id,
            tiempoOrigen: t0,
            tiempoDestino: t1,
            origenPos: origen.getAttribute('position'),
            destinoPos: destino.getAttribute('position'),
            origenNom,
            destinoNom,
            conexion: `${origenNom} -> ${destinoNom}`,
            protocolo: protocolo,
            ultimoProgreso: null
          });

          // Emitir al panel Wireshark
          this.el.emit('nuevoPaquete', m);

          if (t1 > this.max) this.max = t1;
        });
        
        // =================================
        // RESTO DE LÓGICA (igual)
        // =================================

        this.el.emit('max', this.max);

        this.el.sceneEl.addEventListener('salto-temporal', e => {
          this.forzarEstadoPorSaltoTemporal(e.detail.tiempo);
        });

        this.generarPaquetesPorTiempo();
        this.el.emit('paneles', this.paneles);

        this.el.addEventListener('reloj-tick', e => {
          const dir = e.detail.direccion;

          this.alturas(dir);

          this.ejes.forEach(eje => {
            const altura = parseFloat(eje.getAttribute("height"));
            eje.setAttribute("height", altura + 0.03 * dir);

            const pos = eje.getAttribute("position");
            eje.setAttribute('position', `${pos.x} ${pos.y + 0.03/2 * dir} ${pos.z}`);
            
            // AHORA MOVEMOS EL BANDERÍN
            if (eje.bandera) {
              eje.bandera.setAttribute(
                'position',
                `0 ${altura/2-0.25/2} 0` // 0.25 es la aletura del banderín
              );
            }
          });
          this.gestionarMensajes(e.detail.tiempo, dir);
        });
      });

      document.querySelector('#btn-interfaces').addEventListener('click', () => {

        const visibles = this.interfacesVisuales[0]?.getAttribute("visible");

        this.interfacesVisuales.forEach(cartel => {

          if (visibles) {
            // OCULTAR
            cartel.setAttribute("visible", false);
            cartel.classList.remove("iface");
            cartel.removeAttribute("raycastable");
          } else {
            // MOSTRAR
            cartel.setAttribute("visible", true);
            cartel.classList.add("iface");
            cartel.setAttribute("raycastable", "");
          }

        });

      });

      this.el.sceneEl.addEventListener("click", (evt) => {

        const target = evt.target;

        if (target.classList.contains("iface")) {

          const nodoId = target.dataset.nodo;
          const iface = target.dataset.iface;

          const nodo = document.getElementById(nodoId);
          const interfaces = JSON.parse(nodo.dataset.interfaces);

          this.mostrarPanelInterfaz(nodoId, iface, interfaces[iface]);
          return;
        }

        if (target.classList.contains("dominio")) {

          const dominio = target.dataset.domain;
          const nodos = JSON.parse(target.dataset.nodos);

          this.mostrarPanelDominio(dominio, nodos);
          return;
        }

        if (target.classList.contains("nodo")) {

          const nodo = evt.target.closest('[id]');
          if (!nodo || !nodo.dataset.routing) return;

          this.mostrarRouting(target.id, JSON.parse(nodo.dataset.routing));
        }

      });

      document.querySelector('#btn-dominios').addEventListener('click', () => {

        const visibles = this.dominiosVisuales[0]?.getAttribute("visible");

        this.dominiosVisuales.forEach(dom => {

          if (visibles) {
            dom.setAttribute("visible", false);
            dom.classList.remove("dominio");
            dom.removeAttribute("raycastable");
          } else {
            dom.setAttribute("visible", true);
            dom.classList.add("dominio");
            dom.setAttribute("raycastable", "");
          }

        });

      });
  },

  generarPaquetesPorTiempo: function () {
    const intervalo = this.data.intervaloPrecision;
    this.paquetesPorTiempo = {};

    this.historias.forEach(p => {
      for (let t = p.tiempoOrigen; t <= p.tiempoDestino; t += intervalo) {
        t = parseFloat(t.toFixed(1));
        if (!this.paquetesPorTiempo[t]) {
          this.paquetesPorTiempo[t] = [];
        }
        this.paquetesPorTiempo[t].push(p);
      }
    });
  },

  gestionarMensajes: function (tiempo, direccion) {
    tiempo = parseFloat(tiempo.toFixed(1));

    const paquetes = this.paquetesPorTiempo[tiempo];
    if (!paquetes) return;

    const Y_SUELO = 0.1;
    const ALTURA_POR_TICK = 0.4;

    paquetes.forEach(p => {

      // FILTRADO POR CONEXIÓN ACTIVA (solo visibilidad)
      const modo = this.el.sceneEl.components['modo-escena'];

      let visible = true;

      if (modo && modo.modo === 'conexion') {
        visible =
          (p.origenNom === modo.conexionActiva.origen &&
          p.destinoNom === modo.conexionActiva.destino) ||
          (p.origenNom === modo.conexionActiva.destino &&
          p.destinoNom === modo.conexionActiva.origen);
      }

      // CÁLCULO DE PROGRESO
      const progreso = (tiempo - p.tiempoOrigen) / (p.tiempoDestino - p.tiempoOrigen);

      let x, y, z;

      if (progreso < 1) {
        x = p.origenPos.x + (p.destinoPos.x - p.origenPos.x) * progreso;
        z = p.origenPos.z + (p.destinoPos.z - p.origenPos.z) * progreso;
        y = Y_SUELO;
      } else {
        x = p.destinoPos.x;
        z = p.destinoPos.z;
        const antiguedad = tiempo - p.tiempoDestino;
        y = Y_SUELO + antiguedad * ALTURA_POR_TICK;
      }

      // CREAR
      if (progreso >= 0 && p.ultimoProgreso === null) {
        this.el.emit('mensaje', {
          id: p.id,
          x, y, z,
          estado: 'Crear',
          conexion: p.conexion,
          visible,
          protocolo : p.protocolo
        });
      }

      // MOVER
      if (progreso >= 0) {
        this.el.emit('mensaje', {
          id: p.id,
          x, y, z,
          estado: 'Mover',
          conexion: p.conexion,
          visible,
          protocolo : p.protocolo
        });
      }

      // FINAL
      if (progreso >= 1 && (p.ultimoProgreso === null || p.ultimoProgreso < 1)) {
        this.el.emit('mensaje', {
          id: p.id,
          x, y, z,
          estado: 'Acabar',
          conexion: p.conexion,
          visible,
          protocolo : p.protocolo
        });

        this.el.emit('mensaje-llegado', {
          id: p.id,
          destino: p.destinoNom,
          tiempo
        });
      }

      p.ultimoProgreso = progreso;
    });
  },

  alturas: function(direccion = 1) {
    const incremento = 0.03 * direccion; // + para avanzar, - para retroceder

    this.paneles.forEach(panel => {
      const alturaActual = parseFloat(panel.getAttribute("height"));
      const nuevaAltura = Math.max(0.1, alturaActual + incremento); // evitar altura negativa
      panel.setAttribute("height", nuevaAltura);

      const pos = panel.getAttribute("position");
      // mover la posición vertical según la mitad del incremento
      panel.setAttribute('position', `${pos.x} ${pos.y + incremento / 2} ${pos.z}`);
    });
  },

  crearEje : function(posicion, nodoId) {
    this.eje = document.createElement('a-cylinder');
    this.eje.setAttribute('radius', 0.02);
    this.eje.setAttribute('height', 1);
    const altura = this.eje.getAttribute("height")
    this.eje.setAttribute('color', '#000000');
    this.eje.classList.add('eje')

    this.eje.dataset.nodo = nodoId;

    const posiciones = posicion
      .trim() // Elimina espacios al inicio y final
      .split(/\s+/) // Divide por uno o más espacios
      .map(num => Number(num))
    const y = altura/2
    this.eje.setAttribute('position', `${posiciones[0]} ${y} ${posiciones[2]}`);
    this.el.sceneEl.appendChild(this.eje);
    this.el.emit('eje', this.eje)
    this.ejes.push(this.eje)

    // =============================
    // BANDERÍN
    // =============================
    const bandera = document.createElement('a-entity');

    // Fondo
    const fondo = document.createElement('a-plane');
    fondo.setAttribute('width', 0.6);
    fondo.setAttribute('height', 0.25);
    fondo.setAttribute('color', '#ff0000');
    fondo.setAttribute('position', '0.3 0 0');
    bandera.appendChild(fondo);

    // Texto
    const texto = document.createElement('a-text');
    texto.setAttribute('value', nodoId);
    texto.setAttribute('align', 'center');
    texto.setAttribute('color', '#FFF');
    texto.setAttribute('width', 2);
    texto.setAttribute('position', '0.3 0 0.01');
    bandera.appendChild(texto);

    // Posición inicial arriba del eje
    bandera.setAttribute('position', `0 2 0`);
    bandera.classList.add('banderin');
    bandera.setAttribute('look-at', '[camera]');
    
    this.eje.bandera = bandera
    this.eje.appendChild(bandera);
  },

  forzarEstadoPorSaltoTemporal: function(tiempoObjetivo) {
    const intervalo = this.data.intervaloPrecision;

    // 🔹 1. Reset visual completo
    Object.values(this.el.sceneEl.components.mensaje?.entidades || {}).forEach(ent => {
      ent.setAttribute('visible', false);
    });

    // Reset trazas
    Object.values(this.el.sceneEl.components.mensaje?.trazas || {}).forEach(t => {
      t.cilindro.setAttribute('height', 0.001);
    });

    // Reset paneles a altura base
    this.paneles.forEach(panel => {
      panel.setAttribute('height', 1);
      const pos = panel.getAttribute('position');
      panel.setAttribute('position', `${pos.x} 0.5 ${pos.z}`);
    });

    // Reset ejes
    this.ejes.forEach(eje => {
      eje.setAttribute('height', 1);
      const pos = eje.getAttribute('position');
      eje.setAttribute('position', `${pos.x} 0.5 ${pos.z}`);
    });

    // 🔹 2. Simular ticks hasta el tiempo objetivo
    for (let t = 0; t <= tiempoObjetivo; t += intervalo) {
      t = parseFloat(t.toFixed(2));

      // Subir paneles
      this.alturas(1);

      // Subir ejes
      this.ejes.forEach(eje => {
        const h = parseFloat(eje.getAttribute("height"));
        eje.setAttribute("height", h + 0.03);
        const pos = eje.getAttribute("position");
        eje.setAttribute("position", `${pos.x} ${pos.y + 0.015} ${pos.z}`);
      });

      // Gestionar mensajes como si el reloj hubiese emitido ticks
      this.gestionarMensajes(t, 1);
    }
  },

  crearCartelesInterfaces: function(links) {

    links.forEach(link => {

      if (!link.src_iface) return;

      const nodoOrigen = document.getElementById(link.source);
      const nodoDestino = document.getElementById(link.target);

      if (!nodoOrigen || !nodoDestino) return;

      const posOrigen = nodoOrigen.getAttribute("position");
      const posDestino = nodoDestino.getAttribute("position");

      const dx = posDestino.x - posOrigen.x;
      const dy = posDestino.y - posOrigen.y;
      const dz = posDestino.z - posOrigen.z;

      const longitud = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (longitud === 0) return;

      const nx = dx / longitud;
      const ny = dy / longitud;
      const nz = dz / longitud;

      const offset = 0.35;

      const x = posOrigen.x + nx * offset;
      const y = posOrigen.y + ny * offset + 0.15;
      const z = posOrigen.z + nz * offset;

      const cartel = document.createElement("a-plane");

      cartel.setAttribute("width", 0.35);
      cartel.setAttribute("height", 0.18);
      cartel.setAttribute("color", "#222");
      cartel.setAttribute("position", `${x} ${y} ${z}`);
      cartel.setAttribute("class", "iface-label");
      cartel.setAttribute("visible", "false");

      cartel.dataset.nodo = link.source;
      cartel.dataset.iface = link.src_iface;

      const anguloY = Math.atan2(dx, dz) * (180 / Math.PI);
      cartel.setAttribute("rotation", `0 ${anguloY} 0`);

      const texto = document.createElement("a-text");
      texto.setAttribute("value", link.src_iface);
      texto.setAttribute("align", "center");
      texto.setAttribute("color", "#FFF");
      texto.setAttribute("width", 2);
      texto.setAttribute("position", "0 0 0.01");

      cartel.appendChild(texto);
      
      cartel.setAttribute("visible", false);
      cartel.classList.remove("iface");
      cartel.removeAttribute("raycastable");

      this.el.sceneEl.appendChild(cartel);

      this.interfacesVisuales.push(cartel);

    });
  },

  crearDominiosColision: function(links) {

    const dominios = {};

    links.forEach(link => {
      if (!link.col_domain) return;

      if (!dominios[link.col_domain])
        dominios[link.col_domain] = new Set();

      dominios[link.col_domain].add(link.source);
      dominios[link.col_domain].add(link.target);
    });

    Object.keys(dominios).forEach(dom => {

      const nodos = Array.from(dominios[dom]);
      const posiciones = [];

      nodos.forEach(id => {
        const nodo = document.getElementById(id);
        if (!nodo) return;
        posiciones.push(nodo.getAttribute("position"));
      });

      if (!posiciones.length) return;

      let cx = 0, cz = 0;

      posiciones.forEach(p => {
        cx += p.x;
        cz += p.z;
      });

      cx /= posiciones.length;
      cz /= posiciones.length;

      let radio = 0;

      posiciones.forEach(p => {
        const dx = p.x - cx;
        const dz = p.z - cz;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > radio) radio = dist;
      });

      radio += 0.8;

      const circulo = document.createElement("a-circle");

      circulo.setAttribute("radius", radio);
      circulo.setAttribute("color", "#00FFFF");
      circulo.setAttribute("rotation", "-90 0 0");
      circulo.setAttribute("position", `${cx} 0.05 ${cz}`);
      circulo.setAttribute("opacity", "0.05");
      circulo.setAttribute("transparent", "true");
      circulo.setAttribute("visible", "false");

      circulo.classList.add("dominio");
      circulo.dataset.domain = dom;
      circulo.dataset.nodos = JSON.stringify(nodos);

      circulo.setAttribute("visible", false);
      circulo.classList.remove("dominio");
      circulo.removeAttribute("raycastable");

      this.el.sceneEl.appendChild(circulo);

      this.dominiosVisuales.push(circulo);
    });
  },

  mostrarPanelInterfaz: function(nodoId, iface, datos) {

    // ==============================
    // Eliminar panel anterior
    // ==============================
    const viejo = document.getElementById("panel-interfaz");
    if (viejo) viejo.remove();

    // ==============================
    // Crear panel
    // ==============================
    const panel = document.createElement("a-plane");

    panel.setAttribute("id", "panel-interfaz");
    panel.setAttribute("width", 2.8);
    panel.setAttribute("height", 1.6);
    panel.setAttribute("color", "#111");
    panel.setAttribute("position", "0 1.6 -2");
    panel.setAttribute("look-at", "[camera]");
    panel.setAttribute("material", "opacity:0.95; transparent:true");

    // ==============================
    // Construir texto
    // ==============================
    let contenido = `Interfaz ${iface} - ${nodoId}\n\n`;

    if (!datos) {
      contenido += "Sin datos disponibles";
    } else {

      contenido += `MAC: ${datos.hwaddr || "-"}\n`;
      contenido += `IP: ${datos.ipaddr || "-"}\n`;
      contenido += `Mask: ${datos.mask || "-"}\n`;

      if (datos.broadcast)
        contenido += `Broadcast: ${datos.broadcast}\n`;
    }

    // ==============================
    // Texto
    // ==============================
    const texto = document.createElement("a-text");

    texto.setAttribute("value", contenido);
    texto.setAttribute("align", "left");
    texto.setAttribute("color", "#00FFFF");
    texto.setAttribute("width", 4);
    texto.setAttribute("position", "-1.3 0.6 0.01");

    panel.appendChild(texto);

    this.el.sceneEl.appendChild(panel);
  },

  mostrarPanelDominio: function(dominio, nodos) {

    // Eliminar panel anterior si existe
    const viejo = document.getElementById("panel-dominio");
    if (viejo) viejo.remove();

    const panel = document.createElement("a-plane");
    panel.setAttribute("id", "panel-dominio");
    panel.setAttribute("width", 2);
    panel.setAttribute("height", 1);
    panel.setAttribute("color", "#111");
    panel.setAttribute("position", "0 1.5 -2");
    panel.setAttribute("look-at", "[camera]");

    const texto = document.createElement("a-text");

    let contenido = `Dominio ${dominio}\n\n`;

    nodos.forEach(n => {
      contenido += `• ${n}\n`;
    });

    texto.setAttribute("value", contenido);
    texto.setAttribute("align", "center");
    texto.setAttribute("color", "#00FFFF");
    texto.setAttribute("width", 4);
    texto.setAttribute("position", "0 0 0.01");

    panel.appendChild(texto);

    this.el.sceneEl.appendChild(panel);
  },

  mostrarRouting: function(nodoId, routing) {

    // ==============================
    // Eliminar panel anterior
    // ==============================
    const viejo = document.getElementById("panel-routing");
    if (viejo) viejo.remove();

    // ==============================
    // Crear panel
    // ==============================
    const panel = document.createElement("a-plane");

    panel.setAttribute("id", "panel-routing");
    panel.setAttribute("width", 3);
    panel.setAttribute("height", 1.8);
    panel.setAttribute("color", "#111");
    panel.setAttribute("position", "0 1.6 -2");
    panel.setAttribute("look-at", "[camera]");
    panel.setAttribute("material", "opacity:0.95; transparent:true");

    // ==============================
    // Construir texto
    // ==============================
    let contenido = `Routing Table - ${nodoId}\n\n`;

    if (!routing || routing.length === 0) {
      contenido += "No hay rutas configuradas.";
    } else {

      contenido += "Destino        Gateway        Mask        Iface\n";
      contenido += "------------------------------------------------\n";

      routing.forEach(r => {

        const destino = r.destination || r.dest || "-";
        const gateway = r.gateway || r.gw || "-";
        const mask = r.mask || "-";
        const iface = r.interface || r.iface || "-";

        contenido += `${destino}   ${gateway}   ${mask}   ${iface}\n`;
      });
    }

    // ==============================
    // Texto
    // ==============================
    const texto = document.createElement("a-text");

    texto.setAttribute("value", contenido);
    texto.setAttribute("align", "left");
    texto.setAttribute("color", "#00FF00");
    texto.setAttribute("width", 5);
    texto.setAttribute("position", "-1.4 0.7 0.01");

    panel.appendChild(texto);

    this.el.sceneEl.appendChild(panel);
  },

});
