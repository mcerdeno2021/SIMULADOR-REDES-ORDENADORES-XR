AFRAME.registerComponent('slider', {
  schema: {
    min: { type: 'number', default: 0.1 },
    max: { type: 'number', default: 2 },
    step: { type: 'number', default: 0.1 },
    value: { type: 'number', default: 1 },
    width: { type: 'number', default: 1.5 }
  },

  init: function () {
    this.dragging = false;

    // Barra
    this.bar = document.createElement('a-plane');
    this.bar.setAttribute('width', this.data.width);
    this.bar.setAttribute('height', 0.1);
    this.bar.setAttribute('color', 'gray');
    this.bar.setAttribute('class', 'clickeable'); // importante: raycaster debe verla
    this.el.appendChild(this.bar);

    // Manija
    this.handle = document.createElement('a-circle');
    this.handle.setAttribute('radius', 0.08);
    this.handle.setAttribute('color', 'orange');
    this.handle.setAttribute('position', `${-this.data.width / 2} 0 0.01`);
    this.handle.setAttribute('class', 'player');
    this.el.appendChild(this.handle);

    // Guardar referencia al cursor con raycaster
    this.cursorEl = this.el.sceneEl.querySelector('[cursor]');

    // Eventos para empezar / terminar arrastre
    this.handle.addEventListener('mousedown', () => { this.dragging = true; });
    window.addEventListener('mouseup', () => { 
        if (!this.dragging) return;
        this.dragging = false; 

        // Cuando sueltas, calcular valor final y emitirlo
        const localX = this.handle.object3D.position.x;
        const ratio = (localX + this.data.width / 2) / this.data.width;
        let value = this.data.min + ratio * (this.data.max - this.data.min);
        value = Math.round(value / this.data.step) * this.data.step;

        this.el.emit('v', { value });

        // ejemplo: actualizar el reloj
        const relojEl = document.querySelector('#miReloj');
        if (relojEl && relojEl.components.reloj) {
          relojEl.components.reloj.setVelocidad(value);
      }
    });
  },

  tick: function () {
    if (!this.dragging || !this.cursorEl) return;

    const ray = this.cursorEl.components.raycaster;
    if (!ray) return;

    const intersection = ray.getIntersection(this.bar);
    if (!intersection) return;

    // Transformar coordenada mundial a local
    const worldPoint = intersection.point.clone();
    this.el.object3D.worldToLocal(worldPoint);

    let localX = worldPoint.x;
    localX = Math.max(-this.data.width / 2, Math.min(this.data.width / 2, localX));

    // Sólo mover la manija (no enviar valor aún)
    this.handle.object3D.position.x = localX;
  }
});

