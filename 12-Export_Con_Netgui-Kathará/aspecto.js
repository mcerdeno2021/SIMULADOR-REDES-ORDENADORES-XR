AFRAME.registerComponent('ordenador', { // Crea los ordenadores
  schema: {
    ancho: {type: 'number', default: 1},
    fondo: {type: 'number', default: 0.5},
    altoPantalla: {type: 'number', default: 0.5}
 },
  init: function () {
    const el = this.el;
    
    const {ancho, fondo, altoPantalla} = this.data;

    const base = document.createElement('a-box');
    base.setAttribute('depth', fondo);
    base.setAttribute('width', ancho);
    base.setAttribute('height', 0.02);
    base.setAttribute('position', `0 0 0`);
    base.setAttribute('material', 'src: img/teclado.jpg')
    el.appendChild(base);

    const front = document.createElement('a-plane');
    front.setAttribute('material', 'src: img/pantalla.jpg');
    front.setAttribute('width', ancho);
    front.setAttribute('height', altoPantalla);
    front.setAttribute('position', `0 ${altoPantalla/2} ${-fondo/2+0.01}`);
    front.setAttribute('rotation', '0 0 0');
    el.appendChild(front);
    
    const sides = [ // Cada lado que no tiene imagen
      {pos: `0 ${altoPantalla/2} ${-fondo/2}`, rot: '180 0 0', w: ancho, h: altoPantalla},
      {pos: `${ancho/2} ${altoPantalla/2} ${-fondo/2+0.005}`, rot: '0 90 0', w: 0.01, h: altoPantalla},
      {pos: `${-ancho/2} ${altoPantalla/2} ${-fondo/2+0.005}`, rot: '0 -90 0', w: 0.01, h: altoPantalla},
      {pos: ` 0 ${altoPantalla/2} ${-fondo/2+0.005}`, rot: '90 0 0', w: ancho, h: 0.01},
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


AFRAME.registerComponent('router', {
  schema: {
    ancho: {type: 'number', default: 0.5},
    fondo: {type: 'number', default: 0.25},
    alto: {type: 'number', default: 0.1},
 },
  init: function () {
    const el = this.el;
    
    const {ancho, fondo, alto} = this.data;

    const top = document.createElement('a-plane');
    top.setAttribute('material', 'src: img/routertop.png');
    top.setAttribute('width', ancho);
    top.setAttribute('height', fondo);
    top.setAttribute('position', `0 ${alto/2} 0`);
    top.setAttribute('rotation', '-90 0 0');
    el.appendChild(top);

    const back = document.createElement('a-plane');
    back.setAttribute('material', 'src: img/routerback.jpg');
    back.setAttribute('width', ancho);
    back.setAttribute('height', alto);
    back.setAttribute('position', `0 0 ${-fondo/2}`);
    back.setAttribute('rotation', '0 180 0');
    el.appendChild(back);

    const sides = [
      {pos: `0 0 ${fondo/2}`, rot: '0 180 0', w: ancho, h: alto},
      {pos: `0 ${-alto/2} 0`, rot: '-90 0 0', w: ancho, h: fondo},
      {pos: `0 ${-alto/2} 0`, rot: '90 0 0', w: ancho, h: fondo},
      {pos: `${-ancho/2} 0 0`, rot: '0 90 0', w: fondo, h: alto},
      {pos: `${ancho/2} 0 0`, rot: '0 -90 0', w: fondo, h: alto},
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
      {pos: `${ancho*2/5} ${alto} ${-fondo/2}`},
      {pos: `${-ancho*2/5} ${alto} ${-fondo/2}`},
    ]

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


AFRAME.registerComponent('switch', {
  schema: {
    ancho: {type: 'number', default: 0.5},
    fondo: {type: 'number', default: 0.25},
    alto: {type: 'number', default: 0.1},
 },
  init: function () {
    const el = this.el;

    const {ancho, fondo, alto} = this.data;

    const front = document.createElement('a-plane');
    front.setAttribute('material', 'src: img/switchfront.jpg');
    front.setAttribute('width', ancho);
    front.setAttribute('height', alto);
    front.setAttribute('position', `0 0 ${fondo/2}`);
    front.setAttribute('rotation', '0 0 0');
    el.appendChild(front);

    const sides = [
      {pos: `0 ${alto/2} 0`, rot: '-90 0 0', w: ancho, h: fondo},
      {pos: `0 ${-alto/2} 0`, rot: '90 0 0', w: ancho, h: fondo},
      {pos: `${-ancho/2} 0 0`, rot: '0 90 0', w: fondo, h: alto},
      {pos: `${ancho/2} 0 0`, rot: '0 -90 0', w: fondo, h: alto},
      {pos: `0 0 ${-fondo/2}`, rot: '0 180 0', w: ancho, h: alto},
    ];

    sides.forEach(side => {
      const plane = document.createElement('a-plane');
      plane.setAttribute('material', 'src: img/switchside.jpg');
      plane.setAttribute('width', side.w);
      plane.setAttribute('height', side.h);
      plane.setAttribute('position', side.pos);
      plane.setAttribute('rotation', side.rot);
      plane.setAttribute('material', 'side: double');
      el.appendChild(plane);
   });
 }
});

AFRAME.registerComponent('hub', {
  schema: {
    ancho: {type: 'number', default: 0.5},
    fondo: {type: 'number', default: 0.25},
    alto: {type: 'number', default: 0.1},
  },
  init: function () {
    const el = this.el;
    
    const {ancho, fondo, alto} = this.data;

    const sides = [
      {pos: `0 0 ${fondo/2}`, rot: '0 0 0', w: ancho, h: alto},
      {pos: `0 0 ${-fondo/2}`, rot: '0 180 0', w: ancho, h: alto},
      {pos: `0 ${alto/2} 0`, rot: '-90 0 0', w: ancho, h: fondo},
      {pos: `0 ${-alto/2} 0`, rot: '90 0 0', w: ancho, h: fondo},
      {pos: `${-ancho/2} 0 0`, rot: '0 90 0', w: fondo, h: alto},
      {pos: `${ancho/2} 0 0`, rot: '0 -90 0', w: fondo, h: alto},
    ];

    sides.forEach(side => {
      const plane = document.createElement('a-plane');
      plane.setAttribute('color', '#a8a6a6');
      plane.setAttribute('width', side.w);
      plane.setAttribute('height', side.h);
      plane.setAttribute('position', side.pos);
      plane.setAttribute('rotation', side.rot);
      plane.setAttribute('material', 'side: double');
      el.appendChild(plane);
    });
  }
});


AFRAME.registerComponent('cable', {
  schema: {
    origen: {type: 'string'},
    destino: {type: 'string'}
 },

  init: function () {
    const {origen, destino} = this.data;
    const [x1, y1, z1] = origen.split(' ').map(Number); // Para pasar un string de tres numeros separados a x, y, z
    const [x2, y2, z2] = destino.split(' ').map(Number);

    const dx = x2 - x1; // Distancia entre coordenadas
    const dy = y2 - y1;
    const dz = z2 - z1;
    const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz); // Pitágoras
    const puntoMedio = {
      x: x1 + dx / 2,
      y: y1 + dy / 2,
      z: z1 + dz / 2
   };

    const cable = document.createElement('a-cylinder');
    cable.setAttribute('material', 'src: img/cable.png');
    cable.setAttribute('radius', 0.01);
    cable.setAttribute('height', distancia);
    cable.setAttribute('position', puntoMedio.x + ' ' + puntoMedio.y + ' ' + puntoMedio.z);

    const vector = new THREE.Vector3(dx, dy, dz); // Vector nuevo que apunta de origen a destino
    const ejeY = new THREE.Vector3(0, 1, 0); // Los cilindros apuntan en Y por defecto
    const quaternion = new THREE.Quaternion().setFromUnitVectors(ejeY, vector.clone().normalize()); // Rota (quaternion) el eje Y para que apunte hacia el destino; normalize lo convierte en direcicón unitaria
    cable.object3D.setRotationFromQuaternion(quaternion); // Inclinarlo hacia el destino

    this.el.appendChild(cable);
 }
});
