AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      let historia = {};

      el.addEventListener('historico', e => {
        historia = {
          posicionOrigen: e.detail.origen,
          posicionDestino: e.detail.destino,
          tiempoOrigen: e.detail.tiempoOrigen,
          tiempoDestino: e.detail.tiempoDestino
        };

        const movimientos = historia.tiempoDestino - historia.tiempoOrigen;
        const posicionesX = [];
        const posicionesY = [];
        const posicionesZ = [];

        for (let i = 0; i <= movimientos; i++) {
          const x = historia.posicionOrigen.x + ((historia.posicionDestino.x - historia.posicionOrigen.x) / movimientos) * i;
          const y = historia.posicionOrigen.y + ((historia.posicionDestino.y - historia.posicionOrigen.y) / movimientos) * i;
          const z = historia.posicionOrigen.z + ((historia.posicionDestino.z - historia.posicionOrigen.z) / movimientos) * i;
          posicionesX.push(x);
          posicionesY.push(y);
          posicionesZ.push(z);
        }
      })
      
      el.addEventListener('reloj-tick', e => {
        if (e.detail >= historia.tiempoOrigen && e.detail <= historia.tiempoDestino) {
          el.emit('mensaje', {
            posicionesX: this.posicionesX,
            posicionesY: this.posicionesY,
            posicionesZ: this.posicionesZ
          }); 
        }
      })
    }
})