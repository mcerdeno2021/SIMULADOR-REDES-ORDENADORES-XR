AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.ultimo = {}

    el.addEventListener('paneles', e => {
      this.paneles = e.detail;
    });

    el.addEventListener('mensaje', e => {
      const {id, x, y, z, estado, conexion} = e.detail;
      
      if (estado === "Crear" && this.ultimo[id] == undefined) {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #0000ff');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);

        this.entidades[id] = entidad;

        entidad.setAttribute('position', `${x} ${y} ${z}`);
      }

      // quizá sería mejor hacer funciones independeintes y en cada if poner la que toque?

      if (estado === "Crear" && this.ultimo[id] != undefined) {
        // si viene de mover, no se tendría que crear, solo mover a la posicion origen
        if (this.ultimo[id] === "Mover") {
          const entidad = this.entidades[id];
          entidad.setAttribute('position', `${x} ${y} ${z}`);
        }
        // si viene de acabar, no se tendría que crear, solo volver a darle visbilidad y mover a la posición origen
        if (this.ultimo[id] === "Acabar") {
          const entidad = this.entidades[id];
          entidad.setAttribute('position', `${x} ${y} ${z}`);
          
          entidad.setAttribute('visible', 'true');
        }
      }

      if (estado === "Mover" && this.ultimo[id] == undefined) {
        // se tendría que crear la entidad y poner donde toque
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #0000ff');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);

        this.entidades[id] = entidad;

        entidad.setAttribute('position', `${x} ${y} ${z}`);
      }

      if (estado === "Mover" && this.ultimo[id] != undefined) {
        // mover el paquete
        const entidad = this.entidades[id];
        entidad.setAttribute('position', `${x} ${y} ${z}`);
      }

      if (estado === "Acabar" && this.ultimo[id] == undefined) {
        // Se crea, se mueve a donde acaba y se le quita visibilidad
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #0000ff');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);

        this.entidades[id] = entidad;

        entidad.setAttribute('position', `${x} ${y} ${z}`);

        entidad.setAttribute('visible', 'false');
      }

      if (estado === "Acabar" && this.ultimo[id] != undefined) {
        const entidad = this.entidades[id];
        entidad.setAttribute('visible', 'false');
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

      this.ultimo[id] = estado;
    });
  }
});