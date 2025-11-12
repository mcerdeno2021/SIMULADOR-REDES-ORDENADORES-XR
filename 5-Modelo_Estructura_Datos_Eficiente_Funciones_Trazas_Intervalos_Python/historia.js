AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;

    this.comienzos = {};
    this.finales = {};
    this.activosPorTiempo = {};
    this.historias = [];

    fetch('escenario.json')
      .then(response => response.json())
      .then(datos => {
        const { topologia, conexiones, mensajes } = datos;
        const mapaTopologia = {};

        // Crear entidades de la topología
        topologia.forEach(nodo => {
          mapaTopologia[nodo.id] = nodo.posicion;

          const entidadTopologia = document.createElement('a-entity');
          if (nodo.id.includes('PC')) {
            entidadTopologia.setAttribute('ordenador', '');
          } else if (nodo.id.includes('Router')) {
            entidadTopologia.setAttribute('router', '');
          } else if (nodo.id.includes('Switch')) {
            entidadTopologia.setAttribute('switch', '');
          }

          entidadTopologia.setAttribute('position', nodo.posicion);
          entidadTopologia.setAttribute('id', nodo.id);
          entidadTopologia.setAttribute('identificador', { id: nodo.id, posicion: nodo.posicion });
          el.appendChild(entidadTopologia);
        });

        // Crear cables
        conexiones.forEach(conexion => {
          const origenPos = mapaTopologia[conexion.origen];
          const destinoPos = mapaTopologia[conexion.destino];

          const cable = document.createElement('a-entity');
          cable.setAttribute('cable', `origen: ${origenPos}; destino: ${destinoPos}`);
          el.appendChild(cable);
        });

        // Registrar mensajes (historias)
        mensajes.forEach((dato, i) => {
          const origen = document.querySelector(`#${dato.origen}`);
          const destino = document.querySelector(`#${dato.destino}`);
          const origenPos = origen.getAttribute("position");
          const destinoPos = destino.getAttribute("position");

          this.historias.push({
            id: i + 1,
            tiempoOrigen: dato.tiempoOrigen,
            tiempoDestino: dato.tiempoDestino,
            origenPos,
            destinoPos,
            origenNom: dato.origen,
            destinoNom: dato.destino,
            ultimoProgreso: 0
          });
        });
      });

    // Esperar un poco a que carguen los datos
    setTimeout(() => {
      this.generarDiccionarios();

      // Evento del reloj
      el.addEventListener('reloj-tick', e => {
        let tiempo = e.detail.tiempo;
        let direccion = e.detail.direccion;
        this.gestionarMensajes(tiempo, direccion);
      });

      // Evento de selección
      el.sceneEl.addEventListener('seleccionar-paquete', e => {
        const idSeleccionado = e.detail.id;
        this.historias.forEach(historia => {
          if (historia.id === idSeleccionado) {
            this.el.setAttribute('material', 'color', '#c63f00ff');
            setTimeout(() => this.el.setAttribute('material', 'color', '#FFF'), 1000);
          }
        });
      });
    }, 500);
  },

  generarDiccionarios: function () {
    this.activosPorTiempo = {};
    this.comienzos = {};
    this.finales = {};

    this.historias.forEach(h => {
      // Registrar comienzos
      if (!this.comienzos[h.tiempoOrigen]) this.comienzos[h.tiempoOrigen] = [];
      this.comienzos[h.tiempoOrigen].push(h.id);

      // Registrar finales
      if (!this.finales[h.tiempoDestino]) this.finales[h.tiempoDestino] = [];
      this.finales[h.tiempoDestino].push(h.id);

      // Registrar activos
      for (let t = h.tiempoOrigen; t <= h.tiempoDestino; t++) {
        if (!this.activosPorTiempo[t]) this.activosPorTiempo[t] = [];
        this.activosPorTiempo[t].push(h.id);
      }
    });
  },

  gestionarMensajes: function (tiempo, direccion) {
    const activos = this.activosPorTiempo[tiempo] || [];
    const comienzos = this.comienzos[tiempo] || [];
    const finales = this.finales[tiempo] || [];
    const resumen = document.querySelector('#control');

    this.historias.forEach(historia => {
      const { id, tiempoOrigen, tiempoDestino, origenPos, destinoPos, ultimoProgreso } = historia;
      resumen.emit('resumen', { historia });

      const progreso = (tiempo - tiempoOrigen) / (tiempoDestino - tiempoOrigen);
      const x = origenPos.x + (destinoPos.x - origenPos.x) * progreso;
      const y = origenPos.y + (destinoPos.y - origenPos.y) * progreso;
      const z = origenPos.z + (destinoPos.z - origenPos.z) * progreso;

      if (comienzos.includes(id)) {
        this.estado = "Crear";
        this.el.emit('mensaje', { id, x, y, z, estado: this.estado });
      }

      if (activos.includes(id) && progreso >= 0 && progreso <= 1) {
        this.estado = "";
        this.el.emit('mensaje', { id, x, y, z, estado: this.estado });

        if (direccion === -1 && progreso < ultimoProgreso) {
          this.el.emit('borrar-huella', { id, ultimoProgreso });
        }
      }

      if (finales.includes(id)) {
        this.estado = "Acabar";
        this.el.emit('mensaje', { id, x, y, z, estado: this.estado });
      }

      historia.ultimoProgreso = progreso;
    });
  }
});
