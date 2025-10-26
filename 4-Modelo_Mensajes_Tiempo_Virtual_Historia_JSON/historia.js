AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      
      this.historia = [];

      this.posicionesX = {};
      this.posicionesY = {};
      this.posicionesZ = {};
      this.keysUsadas = [];
      this.time = 0;
      this.times = [];
      this.actual = null;
      this.actual2 = null;
      this.lastTimeB = null;
      this.lastTimeP = null;

      this.pausa = false;
      this.direccion = "forward";

      fetch('mensajes.json')
      .then(response => response.json())
      .then(datos => {
        datos.forEach((dato, i) => {
          origen = document.querySelector(`#${dato.posicionOrigen}`)
          destino = document.querySelector(`#${dato.posicionDestino}`)
          posicionOrigen = origen.getAttribute("position")
          posicionDestino = destino.getAttribute("position")

          const movimientos = dato.tiempoDestino - dato.tiempoOrigen; // cuantos moviemiento? un movimiento en cada tick de reloj?

          for (let j = 0; j <= movimientos; j++) {
            let ciclo = dato.tiempoOrigen+j;
            const x = posicionOrigen.x + ((posicionDestino.x - posicionOrigen.x) / movimientos) * j;
            const y = posicionOrigen.y + ((posicionDestino.y - posicionOrigen.y) / movimientos) * j;
            const z = posicionOrigen.z + ((posicionDestino.z - posicionOrigen.z) / movimientos) * j;
            this.posicionesX[ciclo] = x;
            this.posicionesY[ciclo] = y;
            this.posicionesZ[ciclo] = z
          }

          this.historia.push({
            id: i,
            posicionesX: this.posicionesX,
            posicionesY: this.posicionesY,
            posicionesZ: this.posicionesZ,
            posicionOrigen: posicionOrigen,
            posicionDestino: posicionDestino,
            tiempoOrigen: dato.tiempoOrigen,
            tiempoDestino: dato.tiempoDestino,
            keysUsadas: this.keysUsadas
          })
        });
        
        el.addEventListener('control-historia', e => {
          if (e.detail.accion === "pausar" ) {
            this.pausa = true;
            this.lastTimeP = this.times[this.times.length - 1];
          } else if (e.detail.accion === "reanudar") {
            this.pausa = false;
          } else if (e.detail.accion === "retroceder") {
            this.pausa = false;
            this.direccion = "backward";
            console.log(this.time, this.keysUsadas)
          } else if (e.detail.accion === "avanzar") {
            this.pausa = false;
            this.direccion = "forward";
          }
        });

        el.addEventListener('reloj-tick', e => {
          if (this.pausa) return; //Detiene

          this.time = e.detail.time;
          const delta = e.detail.delta;

          if (this.lastTimeP !== null) {
            const timeDiff = this.time - this.lastTimeP;
            if (this.times.length > 1 && timeDiff > 2*delta / 1000) { // time diff es casi igual que delta/1000, por eso por 2
              if (this.actual === null) {
                this.actual = this.time
              }
              this.time = this.time - (this.actual - this.lastTimeP);
            }
          }
          
          if (this.direccion === "backward") {
            if (this.actual2 === null) {
              this.actual2 = this.time
            }
            tiempoActual = this.actual2 - (this.time - this.lastTimeB);
          }

          this.historia.forEach(historia => {
            const { posicionesX, posicionesY, posicionesZ, keysUsadas } = historia;

            for (const key in posicionesX) { //con hacerlo en X vale para las tres
              const keyNum = Number(key);
              
              if (this.direccion === "forward") {
                this.times.push(this.time);
                
                if (!keysUsadas.includes(keyNum) && ((keyNum - this.time) <= delta/1000)) { //dividido porque hablamos de milisegundos  
                  el.emit('mensaje', {
                    posicionesX: posicionesX[keyNum],
                    posicionesY: posicionesY[keyNum],
                    posicionesZ: posicionesZ[keyNum]
                  });

                  keysUsadas.push(keyNum);
                }
              }  
              else if (this.direccion === "backward") {
                if (keysUsadas.includes(keyNum) && ((tiempoActual - keyNum) <= delta/1000)) { //dividido porque hablamos de milisegundos
                  
                  el.emit('mensaje', {
                      posicionesX: posicionesX[keyNum],
                      posicionesY: posicionesY[keyNum],
                      posicionesZ: posicionesZ[keyNum]
                  });

                  keysUsadas.pop();
                  el.emit('borrar-huella',
                    {x: posicionesX[keyNum], 
                    y: posicionesY[keyNum], 
                    z: posicionesZ[keyNum]}
                  );
                }
              }
            }
          });
        });

      });
    }
})