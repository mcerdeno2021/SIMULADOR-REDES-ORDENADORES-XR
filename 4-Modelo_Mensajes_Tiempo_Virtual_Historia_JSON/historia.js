AFRAME.registerComponent('historia', {
  init: function () {
    const el = this.el;
    
    this.historias = [];
    this.time = 0;
    this.times = [];
    this.pausa = false;
    this.direccion = "forward";
    this.lastTimeP = null;
    this.actual = null;
    this.actual2 = null;
    this.lastTimeB = null;

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

        // Control de reproducción
        el.addEventListener('control-historia', e => {
          if (e.detail.accion === "pausar") {
            this.pausa = true;
            this.lastTimeP = this.times[this.times.length - 1];
          } else if (e.detail.accion === "reanudar") {
            this.pausa = false;
          } else if (e.detail.accion === "retroceder") {
            this.pausa = false;
            this.direccion = "backward";
          } else if (e.detail.accion === "avanzar") {
            this.pausa = false;
            this.direccion = "forward";
          }
        });

        // Ticks de reloj
        el.addEventListener('reloj-tick', e => {
          if (this.pausa) return;

          this.time = e.detail.time;
          const delta = e.detail.delta;
          this.times.push(this.time);

          this.historias.forEach(historia => {
            const { id, posicionesX, posicionesY, posicionesZ, keysUsadas, entidadMensaje } = historia;

            for (const key in posicionesX) {
              const keyNum = Number(key);

              if (this.direccion === "forward") {
                if (!keysUsadas.includes(keyNum) && ((keyNum - this.time) <= delta / 1000)) {
                  // 🎯 Emitir el evento solo al mensaje correspondiente
                  entidadMensaje.emit('mensaje', {
                    id,
                    x: posicionesX[keyNum],
                    y: posicionesY[keyNum],
                    z: posicionesZ[keyNum]
                  });
                  keysUsadas.push(keyNum);
                }
              } else if (this.direccion === "backward") {
                if (keysUsadas.includes(keyNum) && ((this.time - keyNum) <= delta / 1000)) {
                  entidadMensaje.emit('borrar-huella', {
                    id,
                    x: posicionesX[keyNum],
                    y: posicionesY[keyNum],
                    z: posicionesZ[keyNum]
                  });
                  keysUsadas.pop();
                }
              }
            }
          });
        });
      });
  }
});
