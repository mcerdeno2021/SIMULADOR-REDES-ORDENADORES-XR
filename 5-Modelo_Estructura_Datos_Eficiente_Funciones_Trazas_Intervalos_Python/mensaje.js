AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.huella = {};
    this.origen = {}; // origen del mensaje para poder calcular longitud

    el.addEventListener('mensaje', e => {
      const {id, x, y, z, estado} = e.detail;
      
      if (estado === "Crear") {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #ff7700');
        entidad.setAttribute('id', `Mensaje${id}`)
        el.sceneEl.appendChild(entidad);
        this.entidades[id] = entidad;

        this.origen[id] = {x, y, z}; // guardar origen del mensaje la 1a vez
      }

      const entidadMensaje = this.entidades[id];
      entidadMensaje.setAttribute('position', `${x} ${y} ${z}`);

      if (!this.huella[id]) { // crear huella si no existe
        const cilindro = document.createElement('a-cylinder');
        cilindro.setAttribute('radius', 0.05);
        cilindro.setAttribute('height', 0.01);
        cilindro.setAttribute('rotation', '90 0 0')
        cilindro.setAttribute('color', '#ff7700');
        cilindro.setAttribute('opacity', 0.6);
        el.sceneEl.appendChild(cilindro);
        this.huella[id] = cilindro;
      }

      const huella = this.huella[id];
      const origen = this.origen[id];

      const dx = x - origen.x; // Cálculos del cilindro huella
      const dy = y - origen.y;
      const dz = z - origen.z;

      const largo = Math.sqrt(dx*dx + dy*dy + dz*dz);

      const midX = origen.x + dx/2; // Posición en el punto medio
      const midY = origen.y + dy/2;
      const midZ = origen.z + dz/2;

      const yaw = Math.atan2(dx, dz) * 180/Math.PI; // rotación para apuntar desde origen hasta punto actual
      const pitch = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz)) * 180/Math.PI;

      huella.setAttribute('height', largo);
      huella.setAttribute('position', `${midX} ${midY} ${midZ}`);
      huella.setAttribute('rotation', `${pitch} ${yaw} 0`);
    });

    el.addEventListener('borrar-huella', e => {
      const {id, ultimoProgreso} = e.detail;

      // al retroceder simplemente encogemos el cilindro:
      // no borres nada
      // cuando llegue mensaje() con menos progreso recalculará el largo automáticamente
    });
  }
});
