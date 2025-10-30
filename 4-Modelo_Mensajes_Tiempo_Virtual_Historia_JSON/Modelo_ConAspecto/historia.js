AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;

    this.historias = [];

    fetch('escenario.json') // Para pedir el JSON, te devuelve un Response
      .then(response => response.json()) // Lee el JSON y lo convierte a JS
      .then(datos => {
        const topologia = datos.topologia;
        const conexiones = datos.conexiones;
        const mensajes = datos.mensajes;

        const mapaTopologia = {};

        topologia.forEach(nodo => {
          mapaTopologia[nodo.id] = nodo.posicion;

          const entidadTopologia = document.createElement('a-entity');

          if (nodo.id.includes('PC')) {
            entidadTopologia.setAttribute('ordenador', '')
          } else if (nodo.id.includes('Router')) {
            entidadTopologia.setAttribute('router', '')
          } else if (nodo.id.includes('Switch')) {
            entidadTopologia.setAttribute('switch', '')
          }
          entidadTopologia.setAttribute('position', nodo.posicion);
          entidadTopologia.setAttribute('id', nodo.id)
          el.appendChild(entidadTopologia);
        }),

        conexiones.forEach(conexion => {
          const origenPos = mapaTopologia[conexion.origen];
          const destinoPos = mapaTopologia[conexion.destino];

          const cable = document.createElement('a-entity');
          cable.setAttribute('cable', `origen: ${origenPos}; destino: ${destinoPos}`);
          el.appendChild(cable)
        })

        mensajes.forEach((dato, i) => {
          const origen = document.querySelector(`#${dato.origen}`);
          const destino = document.querySelector(`#${dato.destino}`);
          const origenPos = origen.getAttribute("position");
          const destinoPos = destino.getAttribute("position");

          const entidadMensaje = document.createElement('a-entity');
          entidadMensaje.setAttribute('mensaje', '');
          el.appendChild(entidadMensaje);

          this.historias.push({
            id: i+1, // Para empezar en 1
            tiempoOrigen: dato.tiempoOrigen,
            tiempoDestino: dato.tiempoDestino,
            origenPos,
            destinoPos,
            entidadMensaje,
            ultimoProgreso: 0 // Para seguimiento al retroceder
          });
        });
      });

      el.addEventListener('reloj-tick', e => {
        let tiempo = e.detail.tiempo;

        this.historias.forEach(historia => {
          let {id, tiempoOrigen, tiempoDestino, origenPos, destinoPos, entidadMensaje, ultimoProgreso} = historia;

          if (tiempo < tiempoOrigen || tiempo > tiempoDestino) return; // Si no está en el intervalo no hace nada

          const progreso = (tiempo - tiempoOrigen) / (tiempoDestino - tiempoOrigen); // // Interpolación lineal continua
          const x = origenPos.x + (destinoPos.x - origenPos.x) * progreso;
          const y = origenPos.y + (destinoPos.y - origenPos.y) * progreso;
          const z = origenPos.z + (destinoPos.z - origenPos.z) * progreso;

          entidadMensaje.emit('mensaje', {id, x, y, z, progreso});

          if (e.detail.direccion === -1 && progreso < ultimoProgreso) { // Para borrar huellas posteriores al retroceder
            entidadMensaje.emit('borrar-huella', {id, ultimoProgreso});
          }

          historia.ultimoProgreso = progreso; // Guardar último estado
        });
      });
  }
});
