AFRAME.registerComponent('ordenador', {
  schema: {
    ancho: { type: 'number', default: 1 },
    fondo: { type: 'number', default: 0.5 },
    altoPantalla: { type: 'number', default: 0.5 }
  },
  init: function () {
    const el = this.el;
    const data = this.data;

    let angle = 0;

    // Base
    const base = document.createElement('a-box');
    base.setAttribute('depth', data.fondo);
    base.setAttribute('width', data.ancho);
    base.setAttribute('height', 0.02);
    base.setAttribute('position', `0 0 0`);
    base.setAttribute('src', 'teclado.jpg')
    el.appendChild(base);

    // Parte de frente
    const front = document.createElement('a-plane');
    front.setAttribute('src', 'pantalla.jpg');
    front.setAttribute('width', data.ancho);
    front.setAttribute('height', data.altoPantalla);
    front.setAttribute('position', `0 ${data.altoPantalla/2} ${-data.fondo/2+0.01}`);
    front.setAttribute('rotation', '0 0 0');
    el.appendChild(front);
    
    // misma textura
    const sides = [
      { pos: `0 ${data.altoPantalla/2} ${-data.fondo/2}`, rot: '180 0 0', w: data.ancho, h: data.altoPantalla },
      { pos: `${data.ancho/2} ${data.altoPantalla/2} ${-data.fondo/2+0.005}`, rot: '0 90 0', w: 0.01, h: data.altoPantalla },
      { pos: `${-data.ancho/2} ${data.altoPantalla/2} ${-data.fondo/2+0.005}`, rot: '0 -90 0', w: 0.01, h: data.altoPantalla },
      { pos: ` 0 ${data.altoPantalla/2} ${-data.fondo/2+0.005}`, rot: '90 0 0', w: data.ancho, h: 0.01 },
    ];

    sides.forEach(side => {
      const plane = document.createElement('a-plane');
      plane.setAttribute('color', '#ffffff');
      plane.setAttribute('width', side.w);
      plane.setAttribute('height', side.h);
      plane.setAttribute('position', side.pos);
      plane.setAttribute('rotation', side.rot);
      plane.setAttribute('material', 'side: double');
      el.appendChild(plane);
    });
  }
});

