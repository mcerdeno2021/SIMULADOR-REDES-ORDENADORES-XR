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

      // Obtener origen fijo
      const origen = this.origen[id];

      const dx = x - origen.x;
      const dy = y - origen.y;
      const dz = z - origen.z;

      const largo = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // punto medio
      const midX = origen.x + dx / 2;
      const midY = origen.y + dy / 2;
      const midZ = origen.z + dz / 2;

      
      // Crear si no existe
      if (!this.huella[id]) {
        const cilindro = document.createElement('a-cylinder');
        cilindro.setAttribute('radius', 0.03);
        cilindro.setAttribute('color', '#00ccff');
        cilindro.setAttribute('opacity', 0.6);

        // IMPORTANTE: A-frame crece desde el centro del cilindro
        // así que siempre debe colocarse en el punto medio
        this.el.sceneEl.appendChild(cilindro);
        this.huella[id] = cilindro;
      }

      const huella = this.huella[id];

      // *************
      // ROTACIÓN CORRECTA
      // *************
      // yaw rota en horizontal (XZ)
      const yaw = Math.atan2(dx, dz) * 180 / Math.PI;

      // pitch rota hacia arriba/abajo
      // (ojo: distancia horizontal es sobre XZ)
      const distHorizontal = Math.sqrt(dx*dx + dz*dz);
      const pitch = Math.atan2(dy, distHorizontal) * 180 / Math.PI;

      // *************
      // APLICAR
      // *************
      huella.setAttribute('position', `${midX} ${midY} ${midZ}`);
      huella.setAttribute('height', largo);
      huella.setAttribute('rotation', `${pitch} ${yaw} 0`);
    });
    
    el.addEventListener('borrar-huella', e => {
      // No borra, solo recalcula cuando vuelva a recibir "mensaje"
    });
  }
});

