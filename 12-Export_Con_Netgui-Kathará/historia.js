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
          const protoString = layers.frame["frame.protocols"] || "";
          let protocolo = "UNKNOWN";

          if (protoString.includes("icmp")) protocolo = "ICMP";
          else if (protoString.includes("arp")) protocolo = "ARP";
          else if (protoString.includes("tcp")) protocolo = "TCP";
          else if (protoString.includes("udp")) protocolo = "UDP";

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
            ultimoProgreso: null
          });

          // Emitir al panel Wireshark
          this.el.emit('nuevoPaquete', m);

          if (t1 > this.max) this.max = t1;
        });


        // =================================
        // RESTO DE TU LÓGICA (igual)
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
          });

          this.gestionarMensajes(e.detail.tiempo, dir);
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
          visible
        });
      }

      // MOVER
      if (progreso >= 0) {
        this.el.emit('mensaje', {
          id: p.id,
          x, y, z,
          estado: 'Mover',
          conexion: p.conexion,
          visible
        });
      }

      // FINAL
      if (progreso >= 1 && (p.ultimoProgreso === null || p.ultimoProgreso < 1)) {
        this.el.emit('mensaje', {
          id: p.id,
          x, y, z,
          estado: 'Acabar',
          conexion: p.conexion,
          visible
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
      panel.setAttribute('position', `${pos.x} 1.5 ${pos.z}`);
    });

    // Reset ejes
    this.ejes.forEach(eje => {
      eje.setAttribute('height', 1);
      const pos = eje.getAttribute('position');
      eje.setAttribute('position', `${pos.x} 1.5 ${pos.z}`);
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
  }
});
