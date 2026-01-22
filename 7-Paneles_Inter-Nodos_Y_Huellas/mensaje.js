// AFRAME.registerComponent('mensaje', {
//   init: function () {
//     const el = this.el;

//     this.entidades = {};
//     this.origen = {};

//     el.addEventListener('eje', e => {
//       this.eje = e.detail;
//     });

//     el.addEventListener('mensaje', e => {
//       const { id, x, y, z, estado, tiempo } = e.detail;
      
//       if (estado === "Crear") {
//         const entidad = document.createElement('a-entity');
//         entidad.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
//         entidad.setAttribute('material', 'color: #0000ff');
//         entidad.setAttribute('id', `Mensaje${id}`);
//         el.sceneEl.appendChild(entidad);

//         this.entidades[id] = entidad;
//         this.origen[id] = { 
//           x: x,
//           y: y,
//           z: z
//         };

//         entidad.setAttribute('position', `${x} ${y} ${z}`);
//       }

//       if (estado === "Mover") {
//         // mover el paquete
//         const entidad = this.entidades[id];
//         entidad.setAttribute('position', `${x} ${y} ${z}`);

//         // crear nueva huella abajo
//         const huella = document.createElement('a-sphere');
//         huella.setAttribute('radius', 0.05);
//         huella.setAttribute('color', '#6dff68');
//         huella.setAttribute('opacity', 0.7);
//         huella.setAttribute('position', `${x} ${(tiempo+5)*0.2} ${z}`);
//         el.sceneEl.appendChild(huella)
//       }

//       if (estado === "Acabar") {
//         const entidad = this.entidades[id];
//         if (!entidad) return;

//         entidad.setAttribute('visible', 'false');
//         return;
//       }
//     });
//   }
// });

AFRAME.registerComponent('mensaje', {
  init: function () {
    const el = this.el;

    this.entidades = {};
    this.origen = {};
    this.huellas = {};  // huellas por paquete

    el.addEventListener('panel', e => {
      this.panel = e.detail;
    });

    el.addEventListener('mensaje', e => {
      const { id, x, y, z, estado } = e.detail;
      
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

        this.huellas[id] = [];
      }

      if (estado === "Mover") {
        // mover el paquete
        const entidad = this.entidades[id];
        entidad.setAttribute('position', `${x} ${y} ${z}`);

        // crear nueva huella abajo
        const huella = document.createElement('a-sphere');
        huella.setAttribute('radius', 0.05);
        huella.setAttribute('color', '#6dff68');
        huella.setAttribute('opacity', 0.7);
        huella.setAttribute('position', `${x} ${y} ${z}`);
        //this.panel.appendChild(huella);
        this.huellas[id].push(huella);
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