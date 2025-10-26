AFRAME.registerComponent('mensaje', {

  init: function () {
    const el = this.el;
    const data = this.data;
    this.huella = null;

    const mensaje = document.createElement('a-entity');
    mensaje.setAttribute('geometry', 'primitive: box');
    mensaje.setAttribute('material', 'color: #FF0000');
    el.appendChild(mensaje);

    el.addEventListener('mensaje', e => {
      this.huella = false;

      const x = e.detail.posicionesX;
      const y = e.detail.posicionesY;
      const z = e.detail.posicionesZ;

      mensaje.setAttribute('position', `${x} ${y} ${z}`);

      document.querySelectorAll('.huella').forEach(huella => {
        if (huella.getAttribute('position').x === x &&
            huella.getAttribute('position').y === y &&
            huella.getAttribute('position').z === z) {
          this.huella = true;
        }
      });

      if (!this.huella) {
        const camino = document.createElement('a-entity');
        camino.setAttribute('position', `${x} ${y} ${z}`);
        camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
        camino.setAttribute('material', `color: ${mensaje.getAttribute('color')}`);

        camino.setAttribute('class', 'huella');
        el.appendChild(camino);

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
            el.removeChild(huella);
          }
        });
      });
    });
  },
});
