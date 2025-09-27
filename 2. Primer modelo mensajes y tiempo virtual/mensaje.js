AFRAME.registerComponent('mensaje', {
  schema: {
    posicionOrigen: { type: 'vec3'},
    posicionDestino: { type: 'vec3'},
    tiempoOrigen: { type: 'number'}, 
    tiempoDestino: { type: 'number'}
  },

  init: function () {
    const el = this.el;
    const data = this.data;
    this.id = 0;

    el.setAttribute('material', 'opacity: 0'); // como hacer que aparezca en el momento el componente (mejores formas)

    const movimientos = data.tiempoDestino - data.tiempoOrigen;
    const posicionesX = [];
    const posicionesY = [];
    const posicionesZ = [];

    // Precalcular las posiciones intermedias
    for (let i = 0; i <= movimientos; i++) {
      const x = data.posicionOrigen.x + ((data.posicionDestino.x - data.posicionOrigen.x) / movimientos) * i;
      const y = data.posicionOrigen.y + ((data.posicionDestino.y - data.posicionOrigen.y) / movimientos) * i;
      const z = data.posicionOrigen.z + ((data.posicionDestino.z - data.posicionOrigen.z) / movimientos) * i;
      posicionesX.push(x);
      posicionesY.push(y);
      posicionesZ.push(z);
    }

    el.addEventListener('reloj-tick', e => {
      const indice = e.detail;

      if (indice >= data.tiempoOrigen && indice <= data.tiempoDestino) {
        const posicion = indice - data.tiempoOrigen;

        // Posición actual del mensaje
        const x = posicionesX[posicion];
        const y = posicionesY[posicion];
        const z = posicionesZ[posicion];

        el.setAttribute('position', `${x} ${y} ${z}`);
        el.setAttribute('material', 'opacity: 100');

        if (indice != data.tiempoDestino) {
        // Dejar huella (cilindro rojo) en la posición actual
        const camino = document.createElement('a-entity');
        camino.setAttribute('position', `${x} ${y} ${z}`);
        camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
        camino.setAttribute('material', 'color: red');
        
        camino.setAttribute('class', 'clickeable');
        camino.addEventListener('click', evt => {
          const pos = evt.target.getAttribute('position');
          console.log("Click en la huella:", pos);
        });
        
        el.sceneEl.appendChild(camino); // lo ponemos en la escena para que no dependa del mensaje
        
        el.emit('historia', {
            id: this.id,
            indice: indice,
            origen: data.posicionOrigen,
            destino: data.posicionDestino,
            huella: camino  
        });
        }
      }
    });

    this.id++;
  },
});

