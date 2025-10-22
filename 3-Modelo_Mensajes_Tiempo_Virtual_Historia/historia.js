AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      
      this.historia = {};

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
          this.lastTimeP = this.times[this.times.length - 1];
        } else if (e.detail.accion === "reanudar") {
          this.pausa = false;
        } else if (e.detail.accion === "retroceder") {
          this.pausa = false;
          this.direccion = "backward";
          this.lastTimeB = this.keysUsadas[this.keysUsadas.length - 1];
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
            this.time = this.time - (this.actual - lastTime);
          }
        }
        
        // el fallo de los tiempos de que se haga todo de una vez tiene que ver con la actualizacion de keysUsadas
        if (this.direccion === "backward") {
          if (this.actual2 === null) {
            this.actual2 = this.time
          }
          tiempoActual = this.actual2 - (this.time - this.lastTimeB);
        }

        for (const key in this.posicionesX) { //con hacerlo en X vale para las tres
          const keyNum = Number(key);
          
          if (this.direccion === "forward") {
            this.times.push(this.time);
            
            if (!this.keysUsadas.includes(keyNum) && ((keyNum - this.time) <= delta/1000)) { //dividido porque hablamos de milisegundos  
              el.emit('mensaje', {
                posicionesX: this.posicionesX[keyNum],
                posicionesY: this.posicionesY[keyNum],
                posicionesZ: this.posicionesZ[keyNum]
              });

              this.keysUsadas.push(keyNum);
              console.log(this.keysUsadas);

            }
          }  
          else if (this.direccion === "backward") {
            if (this.keysUsadas.includes(keyNum) && ((tiempoActual - keyNum) <= delta/1000)) { //dividido porque hablamos de milisegundos
              console.log(tiempoActual, this.time);
              
              el.emit('mensaje', {
                  posicionesX: this.posicionesX[keyNum],
                  posicionesY: this.posicionesY[keyNum],
                  posicionesZ: this.posicionesZ[keyNum]
              });

              this.keysUsadas.pop();
            }
          }
        }
      });
    }
})