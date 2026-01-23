AFRAME.registerComponent('panel', {
  schema: {
    origenPos: {type: 'string'},
    origen: {type: 'string'},
    destinoPos: {type: 'string'},
    destino: {type: 'string'},
    activa: { type: 'boolean', default: false }
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
      y: y1 + dy / 2,
      z: z1 + dz / 2
    }
    const angulo = Math.atan2(dx, dz) * 180 / Math.PI - 90;

    this.panel = document.createElement('a-plane');
    this.panel.classList.add('panel');
    this.panel.setAttribute('height', 1);
    this.panel.setAttribute('width', distancia)
    this.panel.setAttribute('side', 'double');
    this.panel.setAttribute('opacity', 0.35);
    this.panel.setAttribute('color', '#ffffff');
    this.panel.setAttribute('position', `${puntoMedio.x} ${puntoMedio.y} ${puntoMedio.z}`)
    this.panel.setAttribute('rotation', `0 ${angulo} 0`);

    this.panel.addEventListener('click', () => {
      el.emit('activar-conexion', {origen, destino});
    });

    this.texto();

    el.appendChild(this.panel);
    
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
    this.panel.setAttribute('opacity', this.data.activa ? 0.85 : 0.35);
    this.panel.setAttribute('color', this.data.activa ? '#ffffff' : '#88ccee');
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
