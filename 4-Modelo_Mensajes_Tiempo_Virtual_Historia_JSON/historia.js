AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;
    
    this.historias = [];

    fetch('mensajes.json')
      .then(response => response.json())
      .then(datos => {
        datos.forEach((dato, i) => {
          const origen = document.querySelector(`#${dato.posicionOrigen}`);
          const destino = document.querySelector(`#${dato.posicionDestino}`);
          const posicionOrigen = origen.getAttribute("position");
          const posicionDestino = destino.getAttribute("position");

          // 🔸 Crear una entidad <a-entity mensaje> separada
          const entidadMensaje = document.createElement('a-entity');
          entidadMensaje.setAttribute('mensaje', '');
          entidadMensaje.setAttribute('id', `mensaje-${i}`);
          el.appendChild(entidadMensaje);

          this.historias.push({
            id: i,
            tiempoOrigen: dato.tiempoOrigen,
            tiempoDestino: dato.tiempoDestino,
            posicionOrigen,
            posicionDestino,
            entidadMensaje,
            ultimoProgreso: 0 // para seguimiento al retroceder
          });
        });
      });

      el.addEventListener('reloj-tick', e => {
        let time = e.detail.time;

        this.historias.forEach(historia => {
          let { id, tiempoOrigen, tiempoDestino, posicionOrigen, posicionDestino, entidadMensaje, ultimoProgreso } = historia;

          if (time < tiempoOrigen || time > tiempoDestino) return; // si no está en el intervalo, no hacer nada

          // Interpolación lineal continua
          const progreso = (time - tiempoOrigen) / (tiempoDestino - tiempoOrigen);

          const x = posicionOrigen.x + (posicionDestino.x - posicionOrigen.x) * progreso;
          const y = posicionOrigen.y + (posicionDestino.y - posicionOrigen.y) * progreso;
          const z = posicionOrigen.z + (posicionDestino.z - posicionOrigen.z) * progreso;

          entidadMensaje.emit('mensaje', { id, x, y, z, progreso });

          if (e.detail.direccion === -1 && progreso < ultimoProgreso) {
            // Retrocede → borrar huellas posteriores
            entidadMensaje.emit('borrar-huella', { id, progresoActual: progreso });
          }

          historia.ultimoProgreso = progreso; // guardar último estado
        });
      });
  }
});
