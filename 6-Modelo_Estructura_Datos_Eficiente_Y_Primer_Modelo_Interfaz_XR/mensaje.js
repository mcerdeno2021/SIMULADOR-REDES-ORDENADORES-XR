AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.origen = {};
    this.huellas = [];  // huellas por paquete


    el.addEventListener('mensaje', e => {
      const { id, x, y, z, estado } = e.detail;
      
      if (estado === "Crear") {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #ff7700');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);

        this.entidades[id] = entidad;
        this.origen[id] = { 
          x: x,
          y: y,
          z: z
        };

        entidad.setAttribute('position', `${x} ${y} ${z}`);
      }

      if (estado === "Mover") {
        // mover el paquete
        const entidad = this.entidades[id];
        entidad.setAttribute('position', `${x} ${y} ${z}`);

        // subir huellas antiguas
        this.huellas.forEach(h => {
            const pos = h.getAttribute('position');
            h.setAttribute('position', { x: pos.x, y: pos.y + 0.001, z: pos.z });
        });

        // crear nueva huella abajo
        const huella = document.createElement('a-sphere');
        huella.setAttribute('radius', 0.1);
        huella.setAttribute('color', '#ee00ff');
        huella.setAttribute('opacity', 0.8);
        huella.setAttribute('position', `${x} ${y} ${z}`);
        el.sceneEl.appendChild(huella);
        this.huellas.push(huella);
      }

      if (estado === "Acabar") {
        const entidad = this.entidades[id];
        if (!entidad) return;

        entidad.setAttribute('visible', 'false');
        return;
      }
    });
  }
});

