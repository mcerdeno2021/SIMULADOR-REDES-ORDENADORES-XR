AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.huella = {};
    this.huellaCil = {}; 
    this.origen = {};

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

      if (estado === "Crear") {
        const entidad = document.createElement('a-entity');
        entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
        entidad.setAttribute('material', 'color: #ff7700');
        entidad.setAttribute('id', `Mensaje${id}`);
        el.sceneEl.appendChild(entidad);

        this.entidades[id] = entidad;
        this.origen[id] = { x, y, z };

        entidad.setAttribute('position', `${x} ${y} ${z}`);
      }

      // 👉 PROTECCIÓN CRÍTICA
      if (!this.entidades[id]) return;

      const entidadMensaje = this.entidades[id];
      entidadMensaje.setAttribute('position', `${x} ${y} ${z}`);

      const origen = this.origen[id];

      const dx = x - origen.x;
      const dy = y - origen.y;
      const dz = z - origen.z;

      const largo = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // ======= CREACIÓN DE CONTENEDOR + CILINDRO =======

      if (!this.huella[id]) {
        // Contenedor que rotaremos y moveremos
        const cont = document.createElement('a-entity');
        cont.setAttribute('id', `HuellaCont${id}`);
        this.el.sceneEl.appendChild(cont);
        this.huella[id] = cont;

        // Cilindro que crecerá y se desplazará
        const cylind = document.createElement('a-cylinder');
        cylind.setAttribute('radius', 0.03);
        cylind.setAttribute('color', '#00ccff');
        cylind.setAttribute('opacity', 0.6);

        // posición inicial local — luego se actualiza en cada tick
        cylind.setAttribute('position', `0 -0.5 0`);

        cont.appendChild(cylind);
        this.huellaCil[id] = cylind;
      }
      
      const cont = this.huella[id];
      const cylind = this.huellaCil[id];

      // ======= ROTACIÓN CORRECTA =======
      const yaw = Math.atan2(dx, dz) * 180 / Math.PI;
      const distHor = Math.sqrt(dx*dx + dz*dz);
      const pitch = Math.atan2(dy, distHor) * 180 / Math.PI;

      // ======= ACTUALIZAR POSICIÓN DEL CONTENEDOR =======
      // AHORA EL CONTENEDOR SIEMPRE ESTÁ EN EL ORIGEN
      cont.setAttribute('position', `${origen.x} ${origen.y} ${origen.z}`);


      // ======= ROTACIÓN DEL CONTENEDOR (apunta al origen) =======
      cont.setAttribute('rotation', `${pitch} ${yaw} 0`);

      // ======= ACTUALIZAR ALTURA DEL CILINDRO =======
      cylind.setAttribute('height', largo);

      // ======= MOVER EL CILINDRO HACIA ATRÁS PARA QUE NAZCA EN EL MENSAJE =======
      cylind.setAttribute('position', `0 ${largo / 2} 0`);

    });
  }
});

