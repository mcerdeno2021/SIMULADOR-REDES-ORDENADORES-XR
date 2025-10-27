AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;
    
    this.historias = [];

    fetch('mensajes.json')
      .then(response => response.json())
      .then(datos => {
        datos.forEach((dato, i) => {
          const posicionesX = {};
          const posicionesY = {};
          const posicionesZ = {};

          const origen = document.querySelector(`#${dato.posicionOrigen}`);
          const destino = document.querySelector(`#${dato.posicionDestino}`);
          const posicionOrigen = origen.getAttribute("position");
          const posicionDestino = destino.getAttribute("position");

          const movimientos = dato.tiempoDestino - dato.tiempoOrigen;

          for (let j = 0; j <= movimientos; j++) {
            const ciclo = dato.tiempoOrigen + j;
            posicionesX[ciclo] = posicionOrigen.x + ((posicionDestino.x - posicionOrigen.x) / movimientos) * j;
            posicionesY[ciclo] = posicionOrigen.y + ((posicionDestino.y - posicionOrigen.y) / movimientos) * j;
            posicionesZ[ciclo] = posicionOrigen.z + ((posicionDestino.z - posicionOrigen.z) / movimientos) * j;
          }

          const keysUsadas = [];

          // 🔸 Crear una entidad <a-entity mensaje> separada
          const entidadMensaje = document.createElement('a-entity');
          entidadMensaje.setAttribute('mensaje', '');
          entidadMensaje.setAttribute('id', `mensaje-${i}`);
          el.appendChild(entidadMensaje);

          this.historias.push({
            id: i,
            posicionesX,
            posicionesY,
            posicionesZ,
            keysUsadas,
            entidadMensaje
          });
        });
      });

      el.addEventListener('reloj-tick', e => {
        let time = e.detail.time;
        let delta = e.detail.delta;

        this.historias.forEach(historia => {
          const { id, posicionesX, posicionesY, posicionesZ, keysUsadas, entidadMensaje } = historia;

          for (const key in posicionesX) {
            const keyNum = Number(key);
              
            if (!keysUsadas.includes(keyNum) && ((keyNum - time) <= delta / 1000)) {
              // 🎯 Emitir el evento solo al mensaje correspondiente
              entidadMensaje.emit('mensaje', {
                id,
                x: posicionesX[keyNum],
                y: posicionesY[keyNum],
                z: posicionesZ[keyNum]
              });
              keysUsadas.push(keyNum);
            }

            if (keysUsadas.includes(keyNum) && ((keyNum - time) <= delta / 1000)) {
              entidadMensaje.emit('borrar-huella', {
                id,
                x: posicionesX[keyNum],
                y: posicionesY[keyNum],
                z: posicionesZ[keyNum]
              });
              keysUsadas.pop();
            }
          }
        });
      });
  }
});
