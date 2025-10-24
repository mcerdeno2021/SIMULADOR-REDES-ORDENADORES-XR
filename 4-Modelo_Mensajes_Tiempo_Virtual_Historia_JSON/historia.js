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

      fetch('mensajes.json')
      .then(response => response.json())
      .then(datos => {
        const mensajes = datos.mensajes;
        origen = document.querySelector(`#${mensajes[0].posicionOrigen}`)
        posicionOrigen = origen.getAttribute("position")
        destino = document.querySelector(`#${mensajes[0].posicionDestino}`)
        posicionDestino = destino.getAttribute("position")
        this.historia = {
          posicionOrigen: posicionOrigen,
          posicionDestino: posicionDestino,
          tiempoOrigen: mensajes[0].tiempoOrigen,
          tiempoDestino: mensajes[0].tiempoDestino,
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
        
        el.addEventListener('control-historia', e => {
          if (e.detail.accion === "pausar" ) {
            this.pausa = true;
            this.lastTimeP = this.times[this.times.length - 1];
            console.log(this.time, this.keysUsadas)
          } else if (e.detail.accion === "reanudar") {
            this.pausa = false;
            console.log(this.time, this.keysUsadas)
          } else if (e.detail.accion === "retroceder") {
            this.pausa = false;
            this.direccion = "backward";
            this.lastTimeB = this.keysUsadas[this.keysUsadas.length - 1];
            console.log(this.time, this.keysUsadas)
          } else if (e.detail.accion === "avanzar") {
            this.pausa = false;
            this.direccion = "forward";
            console.log(this.time, this.keysUsadas)
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
              }
            }  
            else if (this.direccion === "backward") {
              if (this.keysUsadas.includes(keyNum) && ((tiempoActual - keyNum) <= delta/1000)) { //dividido porque hablamos de milisegundos
                
                el.emit('mensaje', {
                    posicionesX: this.posicionesX[keyNum],
                    posicionesY: this.posicionesY[keyNum],
                    posicionesZ: this.posicionesZ[keyNum]
                });

                this.keysUsadas.pop();
                el.emit('borrar-huella',
                  posiciones = {x: this.posicionesX[keyNum], 
                  y: this.posicionesY[keyNum], 
                  z: this.posicionesZ[keyNum]}
                );
              }
            }
          }
        });

      });
    }
})