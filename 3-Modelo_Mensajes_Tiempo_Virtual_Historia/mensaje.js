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
    this.huella = null;

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
      this.huella = false;

      const x = e.detail.posicionesX;
      const y = e.detail.posicionesY;
      const z = e.detail.posicionesZ;

      el.setAttribute('position', `${x} ${y} ${z}`);
      
      document.querySelectorAll('.huella').forEach(huella => {
        if (huella.getAttribute('position').x === x &&
            huella.getAttribute('position').y === y &&
            huella.getAttribute('position').z === z) {
          this.huella = true;
          console.log(huella);
        }
      });

      if (!this.huella) {
        const camino = document.createElement('a-entity');
        camino.setAttribute('position', `${x} ${y} ${z}`);
        camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
        camino.setAttribute('material', `color: ${el.getAttribute('color')}`); 
        // Hay que borrar la huella cuando pasa por encima retrocediendo?
        
        camino.setAttribute('class', 'huella');
        el.sceneEl.appendChild(camino);

        camino.addEventListener('click', evt => {
        const pos = evt.target.getAttribute('position');
        console.log("Huella en", pos, "con: Posición Origen:", data.posicionOrigen, "Posición Destino:", data.posicionDestino, "Tiempo Origen:", data.tiempoOrigen, "Tiempo Destino:", data.tiempoDestino);
      });
      }

      el.addEventListener('borrar-huella', e => {
        document.querySelectorAll('.huella').forEach(huella => {
          if (huella.getAttribute('position').x === e.detail.x &&
              huella.getAttribute('position').y === e.detail.y &&
              huella.getAttribute('position').z === e.detail.z) {
            el.sceneEl.removeChild(huella);
            console.log(huella);
          }
        });
      });
    });
  },
});
