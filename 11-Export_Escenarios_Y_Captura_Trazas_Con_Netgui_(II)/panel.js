AFRAME.registerComponent('panel', {
  schema: {
    origenPos: {type: 'string'},
    origen: {type: 'string'},
    destinoPos: {type: 'string'},
    destino: {type: 'string'},
    activa: {type: 'boolean', default: false}
  },

  init: function () {
    const el = this.el;
    const {origenPos, destinoPos, origen, destino} = this.data;
    this.titulo = `${origen} -> ${destino}`;

    const [x1, y1, z1] = origenPos.split(' ').map(Number);
    const [x2, y2, z2] = destinoPos.split(' ').map(Number);

    const dx = x2 - x1;
    const dz = z2 - z1;
    const distancia = Math.sqrt(dx * dx + dz * dz);

    const puntoMedio = {
      x: x1 + dx / 2,
      z: z1 + dz / 2
    };

    const angulo = Math.atan2(dx, dz) * 180 / Math.PI - 90;

    el.classList.add('panel');
    el.setAttribute('id', this.titulo);
    el.setAttribute('height', 1);
    el.setAttribute('width', distancia);
    el.setAttribute('side', 'double');
    el.setAttribute('position', `${puntoMedio.x} 1.5 ${puntoMedio.z}`);
    el.setAttribute('rotation', `0 ${angulo} 0`);

    this.texto();
    this.actualizar();

    // CLICK → alternar modo conexión
    el.addEventListener('click', () => {
      el.sceneEl.emit('toggle-conexion', {
        origen: this.data.origen,
        destino: this.data.destino,
        panelId: el.id
      });
    });
  },

  update: function () {
    this.actualizar();
  },

  texto: function () {
    const letras = document.createElement('a-text');
    letras.setAttribute('value', this.titulo);
    letras.setAttribute('color', '#111');
    letras.setAttribute('width', 4);
    letras.setAttribute('align', 'center');
    letras.setAttribute('position', '0 0.5 0');
    this.el.appendChild(letras);
  },

  actualizar: function () {
    this.el.setAttribute('material', {
      color: this.data.activa ? '#ffffff' : '#ff3b90',
      opacity: this.data.activa ? 0.9 : 0.08,
      transparent: true,
      depthWrite: false
    });
  }
});

AFRAME.registerComponent('modo-escena', {
  init() {
    this.modo = 'global';
    this.conexionActiva = null;

    this.el.addEventListener('toggle-conexion', e => {
      const { origen, destino, panelId } = e.detail;

      // Si ya estamos en esa conexión → salir
      if (this.modo === 'conexion' && this.conexionActiva?.panelId === panelId) {
        this.salirModoConexion();
      } else {
        this.entrarModoConexion(origen, destino, panelId);
      }
    });
  },

  mismaConexion: function (idPanel, conexionMensaje) {
    if (!idPanel || !conexionMensaje) return false;

    const [a1, b1] = idPanel.split(' -> ');
    const [a2, b2] = conexionMensaje.split(' -> ');

    return (a1 === a2 && b1 === b2) || (a1 === b2 && b1 === a2);
  },

  // ===============================
  // ENTRAR EN MODO CONEXIÓN
  // ===============================
  entrarModoConexion(origen, destino, panelId) {
    this.modo = 'conexion';
    this.conexionActiva = { origen, destino, panelId };

    // 🔹 PANELES → solo el activo
    document.querySelectorAll('[panel]').forEach(el => {
      const esActivo = el.id === panelId;
      el.object3D.visible = esActivo;
      el.setAttribute('panel', 'activa', esActivo);
    });

    // 🔹 MENSAJES → oculto todos
    document.querySelectorAll('.mensaje').forEach(mensaje => {
      mensaje.object3D.visible = false;
    });

    // Dejo los del panel activo
    document.querySelectorAll('.mensaje').forEach(mensaje => {
      if (this.mismaConexion(mensaje.dataset.conexion, panelId)) {
        mensaje.object3D.visible = true;
      }
    });

    // 🔹 NODOS Y CABLES → solo origen y destino
    document.querySelectorAll('[ordenador],[router],[switch],[hub],[cable]').forEach(el => {
      el.object3D.visible = (el.id === origen || el.id === destino);
    });

    // 🔹 EJES → ocultar todos primero
    document.querySelectorAll('.eje').forEach(eje => {
      eje.object3D.visible = false;
    });

    // 🔹 Mostrar solo los ejes de esos nodos
    document.querySelectorAll('.eje').forEach(eje => {
      if (eje.dataset.nodo === origen || eje.dataset.nodo === destino) {
        eje.object3D.visible = true;
      }
    });
  },

  // ===============================
  // SALIR DEL MODO CONEXIÓN
  // ===============================
  salirModoConexion() {
    this.modo = 'global';
    this.conexionActiva = null;

    // 🔹 Restaurar paneles
    document.querySelectorAll('[panel]').forEach(el => {
      el.object3D.visible = true;
      el.setAttribute('panel', 'activa', false);
    });

    // 🔹 Restaurar mensajes
    document.querySelectorAll('.mensaje').forEach(mensaje => {
      mensaje.object3D.visible = true;
    });

    // 🔹 Restaurar nodos
    document.querySelectorAll('[ordenador],[router],[switch],[hub],[cable]').forEach(el => {
      el.object3D.visible = true;
    });

    // 🔹 Restaurar ejes
    document.querySelectorAll('.eje').forEach(eje => {
      eje.object3D.visible = true;
    });
  }
});