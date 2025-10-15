AFRAME.registerComponent('mensaje', {
  schema: {
    posicionOrigen: { // usar solo id para todos?
      parse: function (value) {
        // Caso 1: ¿es una cadena con 3 números separados por espacios?
        const vec3Pattern = /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?$/;
        if (vec3Pattern.test(value.trim())) {
          // Convertirlo a objeto vec3
          const [x, y, z] = value.trim().split(/\s+/).map(Number);
          return { x, y, z };
        }

        // Caso 2: si no es vec3 válido, dejarlo como string
        return value;
      }
    },
    posicionDestino: {
      parse: function (value) {
        // Caso 1: ¿es una cadena con 3 números separados por espacios?
        const vec3Pattern = /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?$/;
        if (vec3Pattern.test(value.trim())) {
          // Convertirlo a objeto vec3
          const [x, y, z] = value.trim().split(/\s+/).map(Number);
          return { x, y, z };
        }

        // Caso 2: si no es vec3 válido, dejarlo como string
        return value;
      }
    },
    tiempoOrigen: {type: 'number'}, 
    tiempoDestino: {type: 'number'}
  },


  init: function () {
    const el = this.el;
    const data = this.data;

    el.setAttribute('reloj', '')
    el.setAttribute('historia', '')
    
    el.setAttribute('position', data.posicionOrigen)

    if (typeof data.posicionDestino == "string") {
      entidad = document.querySelector(`#${data.posicionDestino}`)
      posicionID = entidad.getAttribute("position")
      data.posicionDestino = posicionID
    }

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
      
      const camino = document.createElement('a-entity');
      camino.setAttribute('position', `${x} ${y} ${z}`);
      camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
      camino.setAttribute('material', `color: ${el.getAttribute('color')}`);
      
      camino.setAttribute('class', 'clickeable');
      camino.addEventListener('click', evt => {
        const pos = evt.target.getAttribute('position');
        console.log("Click en la huella:", pos);
      });
      
      el.sceneEl.appendChild(camino);
    });
  },
});

