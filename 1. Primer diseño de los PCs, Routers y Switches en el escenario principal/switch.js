AFRAME.registerComponent('switch', {
  schema: {
    ancho: { type: 'number', default: 0.5 },
    fondo: { type: 'number', default: 0.25 },
    alto: { type: 'number', default: 0.1 },
  },
  init: function () {
    const el = this.el;

    // Crear grupo para el switch
    const switchGroup = document.createElement('a-entity');

    const { ancho, fondo, alto } = this.data;

    // Parte de frente (imagen)
    const front = document.createElement('a-plane');
    front.setAttribute('src', 'switchfront.jpg');
    front.setAttribute('width', ancho);
    front.setAttribute('height', alto);
    front.setAttribute('position', `0 0 ${fondo/2}`);
    front.setAttribute('rotation', '0 0 0');
    switchGroup.appendChild(front);

    // misma textura
    const sides = [
      { pos: `0 ${alto/2} 0`, rot: '-90 0 0', w: ancho, h: fondo },
      { pos: `0 ${-alto/2} 0`, rot: '90 0 0', w: ancho, h: fondo },
      { pos: `${-ancho/2} 0 0`, rot: '0 90 0', w: fondo, h: alto },
      { pos: `${ancho/2} 0 0`, rot: '0 -90 0', w: fondo, h: alto },
      { pos: `0 0 ${-fondo/2}`, rot: '0 180 0', w: ancho, h: alto },
    ];

    sides.forEach(side => {
      const plane = document.createElement('a-plane');
      plane.setAttribute('src', 'switchside.jpg');
      plane.setAttribute('width', side.w);
      plane.setAttribute('height', side.h);
      plane.setAttribute('position', side.pos);
      plane.setAttribute('rotation', side.rot);
      plane.setAttribute('material', 'side: double');
      switchGroup.appendChild(plane);
    });

    el.appendChild(switchGroup);
  }
});