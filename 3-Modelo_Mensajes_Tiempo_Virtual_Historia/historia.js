AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      
      this.historia = {};

      this.posicionesX = {};
      this.posicionesY = {};
      this.posicionesZ = {};
      this.keysUsadas = [];
      this.keysEventos = [];

      this.pausa = false;
      this.direccion = "forward";
      this.arranque = false;

      el.addEventListener('historico', e => {
        this.historia = {
          posicionOrigen: e.detail.origen,
          posicionDestino: e.detail.destino,
          tiempoOrigen: e.detail.tiempoOrigen,
          tiempoDestino: e.detail.tiempoDestino,
        };

        const movimientos = this.historia.tiempoDestino - this.historia.tiempoOrigen; // cuantos moviemiento? un movimiento en cada tick de reloj?

        for (let i = 0; i <= movimientos; i++) {
          let ciclo = this.historia.tiempoOrigen+i;
          const x = this.historia.posicionOrigen.x + ((this.historia.posicionDestino.x - this.historia.posicionOrigen.x) / movimientos) * i;
          const y = this.historia.posicionOrigen.y + ((this.historia.posicionDestino.y - this.historia.posicionOrigen.y) / movimientos) * i;
          const z = this.historia.posicionOrigen.z + ((this.historia.posicionDestino.z - this.historia.posicionOrigen.z) / movimientos) * i;
          this.posicionesX[ciclo] = x;
          this.posicionesY[ciclo] = y;
          this.posicionesZ[ciclo] = z
        }

        this.currentKey = this.historia.tiempoOrigen;
      })
      
      el.addEventListener('control-historia', e => {
        if (e.detail.accion === "pausar" ) {
          this.pausa = true;
          this.arranque = true;
        } else if (e.detail.accion === "reanudar") {
          this.pausa = false;
          this.arranque = true;
        } else if (e.detail.accion === "retroceder") {
          this.pausa = false;
          this.direccion = "backward";
          this.arranque = true;
        } else if (e.detail.accion === "avanzar") {
          this.pausa = false;
          this.direccion = "forward";
          this.arranque = true;
        }
      });

      el.addEventListener('reloj-tick', e => {
        if (this.pausa) return; //Detiene

        const time = e.detail.time;
        const delta = e.detail.delta;
        
        // const keys = Object.keys(this.posicionesX).map(Number).sort((a, b) => a - b);
        if (this.direccion === "forward") {
          for (const key in this.posicionesX) { //con hacerlo en X vale para las tres
              const keyNum = Number(key);

              if (!(keyNum in this.keysUsadas) && ((keyNum - time) <= delta/1000)) { //dividido porque hablamos de milisegundos  
                el.emit('mensaje', {
                  posicionesX: this.posicionesX[keyNum],
                  posicionesY: this.posicionesY[keyNum],
                  posicionesZ: this.posicionesZ[keyNum]
                });

                this.keysUsadas.push(keyNum);
              }// hacer lista con tiempos de cuando se pausa, retrocede, etc
              else if (this.direccion === "backward") {
                if (this.arranque) {
                  this.keysEventos.push(keyNum);
                  this.arranque = false;
                }
                tiempoActual = this.keysEventos[this.keysEventos.length - 1] - (time - this.keysEventos[this.keysEventos.length - 1]);

                if (!(keyNum in this.keysUsadas) && ((keyNum - tiempoActual) <= delta/1000)) { //dividido porque hablamos de milisegundos

                  el.emit('mensaje', {
                      posicionesX: this.posicionesX[keyNum],
                      posicionesY: this.posicionesY[keyNum],
                      posicionesZ: this.posicionesZ[keyNum]
                  });

                  this.keysUsadas.pop();
                }
              }
         }
        }
      });
    }
})