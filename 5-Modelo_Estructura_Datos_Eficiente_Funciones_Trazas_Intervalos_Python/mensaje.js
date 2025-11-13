AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.huella = {};
    this.origen = {};

    el.addEventListener('mensaje', e => {
      const { id, x, y, z, estado } = e.detail;

      // Crear mensaje nuevo
      if (estado === "Crear") {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #ff7700');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);
        this.entidades[id] = entidad;
        this.origen[id] = { x, y, z };
      }

      const entidadMensaje = this.entidades[id];
      entidadMensaje.setAttribute('position', `${x} ${y} ${z}`);

      // Crear huella si no existe
      if (!this.huella[id]) {
        const cilindro = document.createElement('a-cylinder');
        cilindro.setAttribute('radius', 0.05);
        cilindro.setAttribute('height', 0.01);
        cilindro.setAttribute('color', '#ff7700');
        cilindro.setAttribute('opacity', 0.6);
        el.sceneEl.appendChild(cilindro);
        this.huella[id] = cilindro;
      }

      /*const huella = this.huella[id];
      const origen = this.origen[id];

      const dx = x - origen.x;
      const dy = y - origen.y;
      const dz = z - origen.z;

      const largo = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const midX = origen.x + dx / 2;
      const midY = origen.y + dy / 2;
      const midZ = origen.z + dz / 2;

      // Ángulos corregidos
      const yaw = Math.atan2(dx, dz) * 180 / Math.PI;
      const pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI;

      huella.setAttribute('height', largo);
      huella.setAttribute('position', `${midX} ${midY} ${midZ}`);
      huella.setAttribute('rotation', `${pitch} ${yaw} 90`);*/
    });

    el.addEventListener('borrar-huella', e => {
      // No borra, solo recalcula cuando vuelva a recibir "mensaje"
    });
  }
});

