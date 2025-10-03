AFRAME.registerComponent('mensaje', {
  schema: {
    posicionOrigen: {type: 'vec3'},
    posicionDestino: {type: 'vec3'},
    tiempoOrigen: {type: 'number'}, 
    tiempoDestino: {type: 'number'}
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    el.emit('historia', {
        origen: data.posicionOrigen,
        destino: data.posicionDestino,
        tiempoOrigen: data.tiempoOrigen,
        tiempoDestino: data.tiempoDestino
    });

    el.addEventListener('mensaje', e => {
      const x = e.detail[0];
      const y = e.detail[1];
      const z = e.detail[2];

      el.setAttribute('position', `${x} ${y} ${z}`);
      el.setAttribute('material', 'opacity: 100');
      
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
    });
  },
});

