AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;
    this.huellas = {}; // diccionario para huellas

    el.addEventListener('mensaje', e => {
      const {id, x, y, z, progreso} = e.detail;

      el.setAttribute('geometry', 'primitive: box; width: 0.8; height: 0.8');
      el.setAttribute('material', 'color: #96ff2d');
      el.setAttribute('position', `${x} ${y} ${z}`);

      if (!this.huellas[id]) this.huellas[id] = []; // Inicializar array si no existe

      const huella = document.createElement('a-entity');
      const colorHuella = el.getAttribute('material').color;
      huella.setAttribute('position', `${x} ${y} ${z}`);
      huella.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
      huella.setAttribute('material', `color: ${colorHuella}; opacity: 0.6`);
      huella.setAttribute('class', 'huella');

      huella.dataset.progreso = progreso // Guarda el valor de progreso como un atributo HTML llamado data-progreso dentro del elemento

      this.huellas[id].push(huella);
      el.sceneEl.appendChild(huella);

      huella.addEventListener('click', e => {
        const pos = e.target.getAttribute('position');
        console.log("Huella en", pos, "→ mensaje", id);
      });
    });

    el.addEventListener('borrar-huella', e => {
      const {id, progresoMensaje} = e.detail;
      if (!this.huellas[id]) return;

      const huellasBorrar = this.huellas[id].filter(huella => huella.dataset.progreso > progresoMensaje); // Filtrar huellas a borrar: progresoHuella > progresoMensaje
      huellasBorrar.forEach(huella => {
        el.sceneEl.removeChild(huella);
        this.huellas[id] = this.huellas[id].filter(x => x !== huella); // Coge las huellas que ya existen y mantén todas menos la que sea igual a huella
      });
    });
  }
});
