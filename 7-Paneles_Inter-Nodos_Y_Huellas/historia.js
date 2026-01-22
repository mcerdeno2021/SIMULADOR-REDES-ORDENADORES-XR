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
    this.ejes = []

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

          this.crearEje(nodo.posicion);
        });

        // -------- CABLES --------
        const contenedorVentanas = document.querySelector('#ventanas-temporales');

        conexiones.forEach(c => {
          const cable = document.createElement('a-entity');
          cable.setAttribute(
            'cable',
            `origen:${mapaTopologia[c.origen]}; destino:${mapaTopologia[c.destino]}`
          );
          el.appendChild(cable);

          // REGISTRAR CONEXIÓN EN VENTANAS
          contenedorVentanas.components.ventanas.addConexion(
            c.origen,
            c.destino
          );
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
            ultimoProgreso: 0,
            origenNom: origen.getAttribute('id'),
            destinoNom: destino.getAttribute('id')
          });
        });       
      });

    setTimeout(() => {
      this.generarPaquetesPorTiempo();

      el.addEventListener('reloj-tick', e => {
        for (let i = 0; i < this.ejes.length; i++) {
          const altura = this.ejes[i].getAttribute("height")
          this.ejes[i].setAttribute("height", parseFloat(altura)+0.05)
          let pos = this.ejes[i].getAttribute("position")
          this.ejes[i].setAttribute('position', `${pos.x} ${pos.y+0.05/2} ${pos.z}`); //corregir
        }
        this.gestionarMensajes(e.detail.tiempo, e.detail.direccion);
      });
    }, 500);
  },

  // ------------------------------------------------

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

      // -------------------------------
      // FILTRADO POR CONEXIÓN ACTIVA
      // -------------------------------
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

      // -------------------------------
      // CÁLCULO DE PROGRESO
      // -------------------------------
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

      // -------------------------------
      // CREAR
      // -------------------------------
      if (progreso >= 0 && p.ultimoProgreso === 0) {
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Crear', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo});
      }

      // -------------------------------
      // MOVER
      // -------------------------------
      if (progreso >= 0) {
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Mover', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo});
      }

      // -------------------------------
      // FINAL
      // -------------------------------
      if (progreso >= 1 && p.ultimoProgreso < 1) {
        this.el.emit('mensaje', { id: p.id, x, y, z, estado: 'Acabar', conexion: `${p.origenNom}-${p.destinoNom}`, tiempo: tiempo});
        this.el.emit('mensaje-llegado', {
          id: p.id,
          destino: p.destinoNom,
          tiempo
        });
      }

      p.ultimoProgreso = progreso;
    });
  },

  crearEje : function(posicion) {
    this.eje = document.createElement('a-cylinder');
    this.eje.setAttribute('radius', 0.02);
    this.eje.setAttribute('height', 1);
    const altura = this.eje.getAttribute("height")
    this.eje.setAttribute('color', '#000000');;

    const posiciones = posicion
      .trim()                // Elimina espacios al inicio y final
      .split(/\s+/)          // Divide por uno o más espacios
      .map(num => Number(num))
    const y = altura/2 + 1
    this.eje.setAttribute('position', `${posiciones[0]} ${y} ${posiciones[2]}`);
    this.el.sceneEl.appendChild(this.eje);
    this.el.emit('eje', this.eje)
    this.ejes.push(this.eje)
  }
});
