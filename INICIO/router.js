AFRAME.registerComponent('router', {
  schema: {
    ancho: { type: 'number', default: 0.5 },
    fondo: { type: 'number', default: 0.25 },
    alto: { type: 'number', default: 0.1 },
  },
  init: function () {
    const el = this.el;
    const data = this.data;

    // Parte de arriba (imagen)
    const top = document.createElement('a-plane');
    top.setAttribute('src', 'routertop.png');
    top.setAttribute('width', data.ancho);
    top.setAttribute('height', data.fondo);
    top.setAttribute('position', `0 ${data.alto/2} 0`);
    top.setAttribute('rotation', '-90 0 0');
    el.appendChild(top);

    // Parte de atrás (imagen)
    const back = document.createElement('a-plane');
    back.setAttribute('src', 'routerback.jpg');
    back.setAttribute('width', data.ancho);
    back.setAttribute('height', data.alto);
    back.setAttribute('position', `0 0 ${-data.fondo/2}`);
    back.setAttribute('rotation', '0 180 0');
    el.appendChild(back);

    // Parte de frente
    const front = document.createElement('a-plane');
    front.setAttribute('src', 'routerfront.jpg');
    front.setAttribute('width', data.ancho);
    front.setAttribute('height', data.alto);
    front.setAttribute('position', `0 0 ${data.fondo/2}`);
    front.setAttribute('rotation', '0 0 0');
    el.appendChild(front);

    // misma textura
    const sides = [
      { pos: `0 ${-data.alto/2} 0`, rot: '90 0 0', w: data.ancho, h: data.fondo },
      { pos: `${-data.ancho/2} 0 0`, rot: '0 90 0', w: data.fondo, h: data.alto },
      { pos: `${data.ancho/2} 0 0`, rot: '0 -90 0', w: data.fondo, h: data.alto },
    ];

    sides.forEach(side => {
      const plane = document.createElement('a-plane');
      plane.setAttribute('color', '#000000');
      plane.setAttribute('width', side.w);
      plane.setAttribute('height', side.h);
      plane.setAttribute('position', side.pos);
      plane.setAttribute('rotation', side.rot);
      plane.setAttribute('material', 'side: double');
      el.appendChild(plane);
    });

    const antenas = [
      { pos: `${data.ancho*2/5} ${data.alto} ${-data.fondo/2}` },
      { pos: `${-data.ancho*2/5} ${data.alto} ${-data.fondo/2}` },
    ]

    // Antenas
    antenas.forEach(cilindro => {
      const antena = document.createElement('a-cylinder');
      antena.setAttribute('position', cilindro.pos);
      antena.setAttribute('color', '#000000');
      antena.setAttribute('radius', '0.01');
      antena.setAttribute('height', '0.3');
      el.appendChild(antena);
    })
  }
});
