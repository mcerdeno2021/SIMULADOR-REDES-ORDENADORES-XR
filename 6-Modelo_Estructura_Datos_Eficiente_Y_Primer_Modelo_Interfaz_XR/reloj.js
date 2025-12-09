AFRAME.registerComponent('reloj', {

  init: function () {
    this.intervaloPrecision = 0.1
    this.tiempo = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1;
    this.mostrado = false;
    this.ultimoTick = 0; // último instante en que se emitió tick

    const mostrarVelocidad = () => {
      const valorVelocidad = document.querySelector('#velocidad-valor');
      if (valorVelocidad)
        valorVelocidad.setAttribute('value', this.velocidad.toFixed(1) + 'x');
    };

    document.querySelector('#btn-pausa').addEventListener('click', () => {
      this.pausado = !this.pausado;
      console.log(this.pausado ? "⏸️ Pausado" : "▶️ Reanudado");
    });

    document.querySelector('#btn-avanzar').addEventListener('click', () => {
      this.direccion = 1;
      console.log("⏩ Avanzando");
    });

    document.querySelector('#btn-retroceder').addEventListener('click', () => {
      this.direccion = -1;
      console.log("⏪ Retrocediendo");
    });

    document.querySelector('#btn-vel-mas').addEventListener('click', () => {
      this.velocidad = Math.min(this.velocidad + 0.1, 5);
      mostrarVelocidad();
      console.log(`🚀 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });

    document.querySelector('#btn-vel-menos').addEventListener('click', () => {
      this.velocidad = Math.max(this.velocidad - 0.1, 0.1);
      mostrarVelocidad();
      console.log(`🐢 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });

    this.el.sceneEl.addEventListener('time', e => {
        var time = e.detail;
        console.log(time);
        this.tiempo = time;
    });
  },

  tick: function (time, delta) {
    if (this.pausado) return;

    this.tiempo += (delta / 1000) * this.direccion * this.velocidad;

    // Evita que baje de 0
    if (this.tiempo < 0) {
      this.tiempo = 0;
      if (!this.mostrado) {
        console.log("⏹️ Tiempo en 0");
        this.mostrado = true;
      }
    } else {
      this.mostrado = false;
    }

    // Emitir tick solo cuando se alcanza el siguiente intervalo
    const intervalo = this.intervaloPrecision;

    if (this.direccion === 1 && this.tiempo >= this.ultimoTick + intervalo) {
      this.ultimoTick += intervalo;
      this.el.emit('reloj-tick', { tiempo: this.tiempo, direccion: this.direccion });
    } else if (this.direccion === -1 && this.tiempo <= this.ultimoTick - intervalo) {
      this.ultimoTick -= intervalo;
      this.el.emit('reloj-tick', { tiempo: this.tiempo, direccion: this.direccion });
    }
  }
});

AFRAME.registerComponent('slider', {
  init: function () {
    this.min = 0;
    this.max = 50;
    this.step = 0.1;
    this.width = 3;
    this.dragging = false;

    // Barra
    this.bar = document.createElement('a-plane');
    this.bar.setAttribute('width', this.width);
    this.bar.setAttribute('height', 0.1);
    this.bar.setAttribute('color', 'gray');
    this.bar.setAttribute('class', 'btn');
    this.el.appendChild(this.bar);

    // Manija
    this.handle = document.createElement('a-circle');
    this.handle.setAttribute('radius', 0.08);
    this.handle.setAttribute('color', 'orange');
    this.handle.setAttribute('position', `${-this.width / 2} 0 0.01`);
    this.handle.setAttribute('class', 'btn');   // ⚠️ NECESARIO PARA EL RAYCASTER
    this.el.appendChild(this.handle);

    // Cursor con raycaster
    this.cursorEl = this.el.sceneEl.querySelector('[cursor]');

    // Iniciar arrastre
    this.handle.addEventListener('mousedown', () => {
      this.dragging = true;
    });

    // Soltar arrastre
    window.addEventListener('mouseup', () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.emitValue();
    });

    // CLICK EN LA BARRA → SALTO DIRECTO
    this.bar.addEventListener('click', (e) => {
      const ray = this.cursorEl.components.raycaster;
      if (!ray) return;

      const intersection = ray.getIntersection(this.bar);
      if (!intersection) return;

      const worldPoint = intersection.point.clone();
      this.el.object3D.worldToLocal(worldPoint);

      let localX = Math.max(-this.width / 2, Math.min(this.width / 2, worldPoint.x));
      this.handle.object3D.position.x = localX;

      this.emitValue(); // emitir valor al hacer click
    });
  },

  tick: function () {
    if (!this.dragging || !this.cursorEl) return;

    const ray = this.cursorEl.components.raycaster;
    if (!ray) return;

    const intersection = ray.getIntersection(this.bar);
    if (!intersection) return;

    const worldPoint = intersection.point.clone();
    this.el.object3D.worldToLocal(worldPoint);

    let localX = worldPoint.x;
    localX = Math.max(-this.width / 2, Math.min(this.width / 2, localX));

    this.handle.object3D.position.x = localX;
  },

  emitValue: function () {
    const localX = this.handle.object3D.position.x;
    const ratio = (localX + this.width / 2) / this.width;

    let value = this.min + ratio * (this.max - this.min);

    // aplicar step
    value = Math.round(value / this.step) * this.step;

    this.el.emit('time', value);
  }
});