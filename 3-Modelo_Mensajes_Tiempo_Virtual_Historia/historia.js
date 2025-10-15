AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      
      this.historia = {};

      this.posicionesX = {};
      this.posicionesY = {};
      this.posicionesZ = {};
      this.keysUsadas = [];

      this.pausa = false;
      this.direccion = "forward"

      el.addEventListener('historico', e => {
        this.historia = {
          posicionOrigen: e.detail.origen,
          posicionDestino: e.detail.destino,
          tiempoOrigen: e.detail.tiempoOrigen,
          tiempoDestino: e.detail.tiempoDestino
        };

        const movimientos = this.historia.tiempoDestino - this.historia.tiempoOrigen; // cuantos moviemiento? tiene sentido el numero por tiempo

        for (let i = 0; i <= movimientos; i++) {
          let ciclo = this.historia.tiempoOrigen+i;
          const x = this.historia.posicionOrigen.x + ((this.historia.posicionDestino.x - this.historia.posicionOrigen.x) / movimientos) * i;
          const y = this.historia.posicionOrigen.y + ((this.historia.posicionDestino.y - this.historia.posicionOrigen.y) / movimientos) * i;
          const z = this.historia.posicionOrigen.z + ((this.historia.posicionDestino.z - this.historia.posicionOrigen.z) / movimientos) * i;
          this.posicionesX[ciclo] = x;
          this.posicionesY[ciclo] = y;
          this.posicionesZ[ciclo] = z
        }
      })
      
      el.addEventListener('reloj-tick', e => {
        if (this.pausa) return; //Detiene

        const time = e.detail.time;
        const delta = e.detail.delta;
        
        for (const key in this.posicionesX) { //con hacerlo en X vale para las tres
          const keyNum = Number(key);
          
          if (!(keyNum in this.keysUsadas) && ((keyNum - time) <= delta/1000)) { //dividido porque hablamos de milisegundos  
            el.emit('mensaje', {
              posicionesX: this.posicionesX[keyNum],
              posicionesY: this.posicionesY[keyNum],
              posicionesZ: this.posicionesZ[keyNum]
            });

            this.keysUsadas.push(keyNum);
          }
        }
      })
    }
})