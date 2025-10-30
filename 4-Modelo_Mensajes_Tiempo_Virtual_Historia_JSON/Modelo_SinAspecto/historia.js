AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;

    this.historias = [];

    fetch('escenario.json') // Para pedir el JSON, te devuelve un Response
      .then(response => response.json()) // Lee el JSON y lo convierte a JS
      .then(datos => {
        const topologia = datos.topologia;
        const mensajes = datos.mensajes;

        topologia.forEach(nodo => {
          const entidadTopologia = document.createElement('a-entity');
          const router = nodo.id.includes('Router'); // Si incluye la palabra en el campo id
          const Switch = nodo.id.includes('Switch');

          if (router) {
            entidadTopologia.setAttribute('geometry', 'primitive: cylinder; radius: 1; height: 1');
            entidadTopologia.setAttribute('material', 'color: #a9e1f9');
          } else if (Switch) {
            entidadTopologia.setAttribute('geometry', 'primitive: box; width: 2; height: 1; depth: 2');
            entidadTopologia.setAttribute('material', 'color: #b1acac');
          }
          entidadTopologia.setAttribute('position', nodo.posicionOrigen);
          entidadTopologia.setAttribute('id', nodo.id)
          el.appendChild(entidadTopologia);
        }),

        mensajes.forEach((dato, i) => {
          const origen = document.querySelector(`#${dato.posicionOrigen}`);
          const destino = document.querySelector(`#${dato.posicionDestino}`);
          const posicionOrigen = origen.getAttribute("position");
          const posicionDestino = destino.getAttribute("position");

          const entidadMensaje = document.createElement('a-entity');
          entidadMensaje.setAttribute('mensaje', '');
          el.appendChild(entidadMensaje);

          this.historias.push({
            id: i+1, // Para empezar en 1
            tiempoOrigen: dato.tiempoOrigen,
            tiempoDestino: dato.tiempoDestino,
            posicionOrigen,
            posicionDestino,
            entidadMensaje,
            ultimoProgreso: 0 // Para seguimiento al retroceder
          });
        });
      });

      el.addEventListener('reloj-tick', e => {
        let tiempo = e.detail.tiempo;

        this.historias.forEach(historia => {
          let {id, tiempoOrigen, tiempoDestino, posicionOrigen, posicionDestino, entidadMensaje, ultimoProgreso} = historia;

          if (tiempo < tiempoOrigen || tiempo > tiempoDestino) return; // Si no está en el intervalo no hace nada

          const progreso = (tiempo - tiempoOrigen) / (tiempoDestino - tiempoOrigen); // // Interpolación lineal continua
          const x = posicionOrigen.x + (posicionDestino.x - posicionOrigen.x) * progreso;
          const y = posicionOrigen.y + (posicionDestino.y - posicionOrigen.y) * progreso;
          const z = posicionOrigen.z + (posicionDestino.z - posicionOrigen.z) * progreso;

          entidadMensaje.emit('mensaje', {id, x, y, z, progreso});

          if (e.detail.direccion === -1 && progreso < ultimoProgreso) { // Para borrar huellas posteriores al retroceder
            entidadMensaje.emit('borrar-huella', {id, ultimoProgreso});
          }

          historia.ultimoProgreso = progreso; // Guardar último estado
        });
      });
  }
});
