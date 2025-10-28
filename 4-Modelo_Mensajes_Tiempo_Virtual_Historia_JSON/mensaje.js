AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;
    this.huellas = {}; // diccionario para huellas

    el.addEventListener('mensaje', e => {
      const { id, x, y, z, progreso } = e.detail;

      el.setAttribute('geometry', 'primitive: box');
      el.setAttribute('material', 'color: #96ff2d');
      el.setAttribute('position', `${x} ${y} ${z}`);

      // ✅ Inicializar array si no existe
      if (!this.huellas[id]) this.huellas[id] = [];

      const huella = document.createElement('a-entity');
      huella.setAttribute('position', `${x} ${y} ${z}`);
      huella.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
      const colorHuella = el.getAttribute('material').color;
      huella.setAttribute('material', `color: ${colorHuella}; opacity: 0.6`);
      huella.setAttribute('class', 'huella');

      huella.dataset.progreso = progreso

      this.huellas[id].push(huella);
      el.sceneEl.appendChild(huella);

      huella.addEventListener('click', evt => {
        const pos = evt.target.getAttribute('position');
        console.log("Huella en", pos, "→ mensaje", id);
      });
    });

    el.addEventListener('borrar-huella', e => {
      const { id, progresoActual } = e.detail;
      if (!this.huellas[id]) return;

      // Filtrar huellas a borrar: progreso > progresoActual
      const huellasABorrar = this.huellas[id].filter(h => parseFloat(h.dataset.progreso) > progresoActual);
      huellasABorrar.forEach(h => {
        el.sceneEl.removeChild(h);
        this.huellas[id] = this.huellas[id].filter(x => x !== h);
      });
    });
  }
});
