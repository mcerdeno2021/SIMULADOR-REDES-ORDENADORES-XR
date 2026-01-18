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
            ultimoProgreso: 0
          });
        });       
      });

    setTimeout(() => {
      this.generarDiccionarios();

      el.addEventListener('reloj-tick', e => {
        this.gestionarMensajes(e.detail.tiempo, e.detail.direccion);
      });
    }, 500);
  },

  // ------------------------------------------------

  generarDiccionarios: function () {
    const intervalo = this.data.intervaloPrecision;
    this.comienzos = {};
    this.finales = {};
    this.activosPorTiempo = {};

    this.historias.forEach(h => {
      const ini = h.tiempoOrigen;
      const fin = h.tiempoDestino;

      if (!this.comienzos[ini]) this.comienzos[ini] = [];
      if (!this.finales[fin]) this.finales[fin] = [];

      this.comienzos[ini].push(h.id);
      this.finales[fin].push(h.id);

      for (let t = ini; t <= fin; t += intervalo) {
        t = parseFloat(t.toFixed(1));
        if (!this.activosPorTiempo[t]) this.activosPorTiempo[t] = [];
        this.activosPorTiempo[t].push(h.id);
      }
    });
  },

  // ------------------------------------------------

  gestionarMensajes: function (tiempo, direccion) {
    tiempo = parseFloat(tiempo.toFixed(1));

    const activos = this.activosPorTiempo[tiempo] || [];
    const comienzos = this.comienzos[tiempo] || [];
    const finales = this.finales[tiempo] || [];

    const Y_SUELO = 1;
    const ALTURA_POR_TICK = 0.4;

    this.historias.forEach(h => {
      const { id, tiempoOrigen, tiempoDestino, origenPos, destinoPos, ultimoProgreso } = h;

      const progreso = (tiempo - tiempoOrigen) / (tiempoDestino - tiempoOrigen);

      let x, y, z;

      if (progreso < 1) {
        // ---- VIAJE POR EL CABLE ----
        x = origenPos.x + (destinoPos.x - origenPos.x) * progreso;
        z = origenPos.z + (destinoPos.z - origenPos.z) * progreso;
        y = Y_SUELO;
      } else {
        // ---- COLUMNA VERTICAL DEL DESTINO ----
        x = destinoPos.x;
        z = destinoPos.z;

        const antiguedad = tiempo - tiempoDestino;
        y = Y_SUELO + antiguedad * ALTURA_POR_TICK;
      }

      if (comienzos.includes(id)) {
        this.el.emit('mensaje', { id, x, y, z, estado: 'Crear' });
      }

      if (activos.includes(id) && progreso >= 0) {
        this.el.emit('mensaje', { id, x, y, z, estado: 'Mover' });

        if (direccion === -1 && progreso < ultimoProgreso) {
          this.el.emit('borrar-huella', { id, ultimoProgreso });
        }
      }

      if (finales.includes(id)) {
        this.el.emit('mensaje', { id, x, y, z, estado: 'Acabar' });

        this.el.emit('mensaje-llegado', {
        id,
        destino: h.destinoNom,
        tiempo
      });
      }

      h.ultimoProgreso = progreso;
    });
  }
});
