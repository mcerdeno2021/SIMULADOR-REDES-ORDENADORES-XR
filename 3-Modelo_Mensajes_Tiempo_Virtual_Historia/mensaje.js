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

    setTimeout(() => { // si no lo envía antes de que el listener de historia esté listo
      el.emit('historico', {
        origen: data.posicionOrigen,
        destino: data.posicionDestino,
        tiempoOrigen: data.tiempoOrigen,
        tiempoDestino: data.tiempoDestino
    });
    }, 0);
    

    el.addEventListener('mensaje', e => {
      const x = e.detail.posicionesX;
      const y = e.detail.posicionesY;
      const z = e.detail.posicionesZ;

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

