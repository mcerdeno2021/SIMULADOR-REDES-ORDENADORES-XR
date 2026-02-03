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

    fetch('escenario.json')
      .then(r => r.json())
      .then(datos => {
        const { topologia, conexiones, mensajes } = datos;
        const mapaTopologia = {};

        // -------- TOPOLOGÍA --------
        topologia.forEach(nodo => {
          mapaTopologia[nodo.id] = nodo.posicion;

          const e = document.createElement('a-entity');
          if (nodo.id.includes('PC')) e.setAttribute('ordenador', '');
          else if (nodo.id.includes('Router')) e.setAttribute('router', '');
          else if (nodo.id.includes('Switch')) e.setAttribute('switch', '');

          e.setAttribute('position', nodo.posicion);
          e.setAttribute('id', nodo.id);
          el.appendChild(e);

          this.crearEje(nodo.posicion, nodo.id);
        });

        // -------- CABLES --------
        conexiones.forEach(c => {
          const cable = document.createElement('a-entity');
          cable.setAttribute(
            'cable',
            `origen:${mapaTopologia[c.origen]}; destino:${mapaTopologia[c.destino]}`
          );
          el.appendChild(cable);

          const panel = document.createElement('a-plane');
          panel.setAttribute("panel", `origenPos:${mapaTopologia[c.origen]}; origen:${c.origen}; destinoPos:${mapaTopologia[c.destino]}; destino:${c.destino}`);
          el.appendChild(panel)
          this.paneles.push(panel)
        });

        // -------- MENSAJES --------
        const intervalo = this.data.intervaloPrecision;

        mensajes.forEach((m, i) => {
          const t0 = Math.round(m.tiempoOrigen / intervalo) * intervalo;
          const t1 = Math.round(m.tiempoDestino / intervalo) * intervalo;

          const origen = document.querySelector(`#${m.origen}`);
          const destino = document.querySelector(`#${m.destino}`);

          this.historias.push({
            id: i + 1,
            tiempoOrigen: t0,
            tiempoDestino: t1,
            origenPos: origen.getAttribute('position'),
            destinoPos: destino.getAttribute('position'),
            destinoNom: m.destino,
            ultimoProgreso: null,
            origenNom: origen.getAttribute('id'),
            destinoNom: destino.getAttribute('id'),
            conexion: `${origen.getAttribute('id')} -> ${destino.getAttribute('id')}`
          });
        });  
        
        this.generarPaquetesPorTiempo();
        el.emit('paneles', this.paneles)

        el.addEventListener('reloj-tick', e => {
          const dir = e.detail.direccion;
          this.alturas(dir)
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

    const Y_SUELO = 1;
    const ALTURA_POR_TICK = 0.4;

    paquetes.forEach(p => {

      // FILTRADO POR CONEXIÓN ACTIVA
      const modo = this.el.sceneEl.components['modo-escena'];
      if (
        modo &&
        modo.modo === 'conexion' &&
        !(
          p.origenNom === modo.conexionActiva.origen &&
          p.destinoNom === modo.conexionActiva.destino
        )
      ) {
        return;
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
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Crear', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo, conexion: p.conexion});
      }
      // MOVER
      if (progreso >= 0) {
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Mover', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo, conexion: p.conexion});
      }
      // FINAL
      if (progreso >= 1 && (p.ultimoProgreso === null || p.ultimoProgreso < 1)) {
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Acabar', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo, conexion: p.conexion});
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
    const y = altura/2 + 1
    this.eje.setAttribute('position', `${posiciones[0]} ${y} ${posiciones[2]}`);
    this.el.sceneEl.appendChild(this.eje);
    this.el.emit('eje', this.eje)
    this.ejes.push(this.eje)
  }
});
