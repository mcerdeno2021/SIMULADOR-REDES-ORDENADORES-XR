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

    const [x1, y1, z1] = origenPos.split(' ').map(Number); // Para pasar un string de tres numeros separados a x, y, z
    const [x2, y2, z2] = destinoPos.split(' ').map(Number);
    const dx = x2 - x1; // Distancia entre coordenadas
    const dy = y2 - y1;
    const dz = z2 - z1;
    const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz); // Pitágoras
    const puntoMedio = {
      x: x1 + dx / 2,
      z: z1 + dz / 2
    }
    const angulo = Math.atan2(dx, dz) * 180 / Math.PI - 90;

    el.classList.add('panel');
    el.setAttribute('id', `${this.titulo}`);
    el.setAttribute('height', 1);
    el.setAttribute('width', distancia)
    el.setAttribute('side', 'double');
    const y = 1/2 + 1
    el.setAttribute('position', `${puntoMedio.x} ${y} ${puntoMedio.z}`)
    el.setAttribute('rotation', `0 ${angulo} 0`);

    el.addEventListener('click', () => {
      el.emit('activar-conexion', {origen, destino});
      this.data.activa = true;
    });

    this.texto();

    this.actualizar();
  },

  texto: function () {
    const texto = this.titulo;

    const letras = document.createElement('a-text');
    letras.setAttribute('value', texto);
    letras.setAttribute('color', '#111');
    letras.setAttribute('width', 0.6);
    letras.setAttribute('align', 'center');
    letras.setAttribute('position', '0 0 0');

    this.el.appendChild(letras);
  },

  actualizar: function () {
    this.el.setAttribute('material', {
      color: this.data.activa ? '#ffffff' : '#ff3b90',
      opacity: this.data.activa ? 0.85 : 0.05,
      });
  },
});
  

AFRAME.registerComponent('modo-escena', {
  init() {
    this.modo = 'global';
    this.conexionActiva = null;

    this.el.addEventListener('activar-conexion', e => {
      this.modo = 'conexion';
      this.conexionActiva = e.detail;
      this.aplicarFiltro();
    });

    this.el.addEventListener('salir-conexion', () => {
      this.modo = 'global';
      this.conexionActiva = null;
      this.restaurar();
    });
  },

  aplicarFiltro() {
    const { origen, destino } = this.conexionActiva;

    // NODOS
    document.querySelectorAll('[ordenador],[router],[switch]').forEach(el => {
      el.object3D.visible =
        el.id === origen || el.id === destino;
    });

    // CABLES
    document.querySelectorAll('[cable]').forEach(el => {
      const data = el.components.cable.data;
      el.object3D.visible =
        (data.origen === origen && data.destino === destino) ||
        (data.origen === destino && data.destino === origen);
    });
  },

  restaurar() {
    document.querySelectorAll('[ordenador],[router],[switch],[cable]').forEach(el => {
      el.object3D.visible = true;
    });
  }
});
