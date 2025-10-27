AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    el.addEventListener('mensaje', e => {
      const { x, y, z } = e.detail;
      let huellaExistente = false;

      // El propio mensaje es la entidad "móvil"
      el.setAttribute('geometry', 'primitive: box');
      el.setAttribute('material', 'color: #f700ffff');
      el.setAttribute('position', `${x} ${y} ${z}`);
      
      const camino = document.createElement('a-entity');
      camino.setAttribute('position', `${x} ${y} ${z}`);
      camino.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
      camino.setAttribute('material', `color: ${el.getAttribute('material').color}`);
      camino.setAttribute('class', 'huella');
      el.sceneEl.appendChild(camino); // se añade al scene, no dentro del mensaje

      camino.addEventListener('click', evt => {
        const pos = evt.target.getAttribute('position');
        console.log("Huella en", pos, "→ mensaje", e.detail.id);
      });
    });

    el.addEventListener('borrar-huella', e => {
      const { x, y, z } = e.detail;
      const huellas = Array.from(document.querySelectorAll(`.huella-${e.detail.id}`));

      if (huellas.length > 0) {
        // Encuentra la huella más cercana a la posición actual
        let huellaBorrar = huellas.reduce((prev, curr) => {
          const p1 = prev.getAttribute('position');
          const p2 = curr.getAttribute('position');
          const dist1 = Math.hypot(p1.x - x, p1.y - y, p1.z - z);
          const dist2 = Math.hypot(p2.x - x, p2.y - y, p2.z - z);
          return dist1 > dist2 ? prev : curr;
        });

        huellaBorrar.remove();
      }
    });
  }
});

