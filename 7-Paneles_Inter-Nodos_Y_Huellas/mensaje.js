AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.origen = {};

    el.addEventListener('paneles', e => {
      this.paneles = e.detail;
    });

    el.addEventListener('mensaje', e => {
      const { id, x, y, z, estado, conexion } = e.detail;
      
      if (estado === "Crear") {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #0000ff');
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
      }

      if (estado === "Acabar") {
        const entidad = this.entidades[id];
        if (!entidad) return;

        entidad.setAttribute('visible', 'false');
        return;
      }

      const huella = document.createElement('a-sphere');
      huella.setAttribute('radius', 0.05);
      huella.setAttribute('color', '#ffedf4');
      huella.setAttribute('opacity', 0.7);

      for (let i=0; i<this.paneles.length; i++) {
        if (conexion == this.paneles[i].id) {
          this.paneles[i].appendChild(huella);
           // convertir la posición global del paquete a local del panel
            const worldPos = new THREE.Vector3(x, y, z);
            const localPos = this.paneles[i].object3D.worldToLocal(worldPos.clone());

            // colocamos la huella donde realmente está el paquete
            huella.setAttribute('position', {
              x: localPos.x,
              y: localPos.y,   // base del panel
              z: localPos.z
            });
        }
      }
    });
  }
});