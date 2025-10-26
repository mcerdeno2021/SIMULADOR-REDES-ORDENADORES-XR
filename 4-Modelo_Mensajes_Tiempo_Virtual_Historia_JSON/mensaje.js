AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    el.addEventListener('mensaje', e => {
      const { x, y, z } = e.detail;
      let huellaExistente = false;

      // El propio mensaje es la entidad "móvil"
      el.setAttribute('geometry', 'primitive: box');
      el.setAttribute('material', 'color: #FFF23D');
      el.setAttribute('position', `${x} ${y} ${z}`);

      // Comprobar si ya hay huella en esa posición
      document.querySelectorAll('.huella').forEach(huella => {
        const pos = huella.getAttribute('position');
        if (pos.x === x && pos.y === y && pos.z === z) {
          huellaExistente = true;
        }
      });

      if (!huellaExistente) {
        const camino = document.createElement('a-entity');
        camino.setAttribute('position', `${x} ${y} ${z}`);
        camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
        camino.setAttribute('material', `color: ${el.getAttribute('material').color}`);
        camino.setAttribute('class', 'huella');
        el.sceneEl.appendChild(camino); // añadimos al scene, no dentro del mensaje

        camino.addEventListener('click', evt => {
          const pos = evt.target.getAttribute('position');
          console.log("Huella en", pos, "→ mensaje", e.detail.id);
        });
      }
    });

    el.addEventListener('borrar-huella', e => {
      const { x, y, z } = e.detail;
      document.querySelectorAll('.huella').forEach(huella => {
        const pos = huella.getAttribute('position');
        if (pos.x === x && pos.y === y && pos.z === z) {
          huella.remove();
        }
      });
    });
  }
});

