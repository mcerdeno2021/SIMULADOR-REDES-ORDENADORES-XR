AFRAME.registerComponent('reloj', {
  init: function () {
    this.intervaloPrecision = 0.1;
    this.tiempo = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1;
    this.ultimoTick = -this.intervaloPrecision;
    this.maxTiempo = 0;

    const textoTiempo = document.querySelector('#texto-tiempo');

    // 🔹 Cargar tiempo máximo UNA sola vez
    fetch('escenario.json')
      .then(r => r.json())
      .then(datos => {
        const { mensajes } = datos;
        this.maxTiempo = Math.max(...mensajes.map(m => m.tiempoDestino));
        actualizarHUD(0, this.maxTiempo);
      });

    const actualizarHUD = (actual, max) => {
      if (!textoTiempo) return;
      textoTiempo.setAttribute('value', `${actual.toFixed(2)} / ${max.toFixed(2)}`);
    };

    // 🎮 BOTONES
    document.querySelector('#btn-pausa').addEventListener('click', () => {
      this.pausado = !this.pausado;
    });

    document.querySelector('#btn-avanzar').addEventListener('click', () => {
      this.direccion = 1;
    });

    document.querySelector('#btn-retroceder').addEventListener('click', () => {
      this.direccion = -1;
    });

    document.querySelector('#btn-inicio').addEventListener('click', () => {
      this.tiempo = 0;
      this.ultimoTick = 0;
      this.el.emit('set-time', this.tiempo);
      actualizarHUD(this.tiempo, this.maxTiempo);
    });

    document.querySelector('#btn-final').addEventListener('click', () => {
      this.tiempo = this.maxTiempo;
      this.el.emit('set-time', this.tiempo);
      actualizarHUD(this.tiempo, this.maxTiempo);
    });

    document.querySelector('#btn-vel-mas').addEventListener('click', () => {
      this.velocidad = Math.min(this.velocidad + 0.1, 5);
    });

    document.querySelector('#btn-vel-menos').addEventListener('click', () => {
      this.velocidad = Math.max(this.velocidad - 0.1, 0.1);
    });

    // 🔹 Cuando el slider cambia el tiempo manualmente
    this.el.sceneEl.addEventListener('time', e => {
      this.tiempo = THREE.MathUtils.clamp(e.detail, 0, this.maxTiempo);
      this.ultimoTick = this.tiempo;
      actualizarHUD(this.tiempo, this.maxTiempo);
    });

    // 🔹 Actualizar HUD cuando el reloj emite tiempo
    this.el.sceneEl.addEventListener('set-time', e => {
      actualizarHUD(e.detail, this.maxTiempo);
    });
  },

  tick: function(time, delta) {
    if (this.pausado) return;

    const deltaSeg = (delta / 1000) * this.direccion * this.velocidad;
    this.tiempo += deltaSeg;

    // 🔒 Límites
    if (this.tiempo <= 0) {
      this.tiempo = 0;
    }

    if (this.maxTiempo && this.tiempo >= this.maxTiempo) {
      this.tiempo = this.maxTiempo;
    }

    // Actualizar HUD y slider
    this.el.emit('set-time', this.tiempo);

    // === GENERAR TICK DISCRETO ESTABLE ===
    const intervalo = this.intervaloPrecision;

    const pasos = Math.floor(this.tiempo / intervalo + 1e-9);
    const tickDiscreto = Number((pasos * intervalo).toFixed(2));

    // 👇 Emitir todos los ticks intermedios si se saltó alguno
    while (
      (this.direccion === 1 && this.ultimoTick < tickDiscreto) ||
      (this.direccion === -1 && this.ultimoTick > tickDiscreto)
    ) {
      this.ultimoTick = Number((this.ultimoTick + intervalo * this.direccion).toFixed(2));

      if (this.ultimoTick < 0 || this.ultimoTick > this.maxTiempo) break;

      this.el.emit('reloj-tick', {
        tiempo: this.ultimoTick,
        direccion: this.direccion
      });
    }
  }
});

AFRAME.registerComponent('slider', {
  init: function () {
    this.min = 0;
    this.step = 0.1;
    this.width = 8;
    this.dragging = false;
    this.max = 1;

    fetch('escenario.json')
      .then(r => r.json())
      .then(datos => {
        const { mensajes } = datos;
        this.max = Math.max(...mensajes.map(m => m.tiempoDestino));
      });

    this.bar = document.createElement('a-plane');
    this.bar.setAttribute('width', this.width);
    this.bar.setAttribute('height', 0.12);
    this.bar.setAttribute('color', '#dddddd');
    this.el.appendChild(this.bar);

    this.progress = document.createElement('a-plane');
    this.progress.setAttribute('width', 0.001);
    this.progress.setAttribute('height', 0.12);
    this.progress.setAttribute('color', '#666666');
    this.progress.setAttribute('position', `${-this.width/2} 0 0.01`);
    this.el.appendChild(this.progress);

    this.handle = document.createElement('a-circle');
    this.handle.setAttribute('radius', 0.1);
    this.handle.setAttribute('color', '#222');
    this.handle.setAttribute('position', `${-this.width/2} 0 0.02`);
    this.el.appendChild(this.handle);

    // 🔄 Cuando el reloj avanza solo
    this.el.sceneEl.addEventListener('set-time', e => {
      this.setValue(e.detail);
    });
  },

  setHandlePosition(localX) {
    this.handle.object3D.position.x = localX;

    const progressWidth = localX + this.width/2;
    this.progress.setAttribute('width', progressWidth);
    this.progress.setAttribute('position', `${-this.width/2 + progressWidth/2} 0 0.01`);
  },

  emitValue() {
    const localX = this.handle.object3D.position.x;
    const ratio = (localX + this.width / 2) / this.width;
    let value = this.min + ratio * (this.max - this.min);
    value = Math.round(value / this.step) * this.step;

    this.el.sceneEl.emit('time', value); // 👈 IMPORTANTE
  },

  setValue(value) {
    value = THREE.MathUtils.clamp(value, this.min, this.max);
    const ratio = (value - this.min) / (this.max - this.min);
    const localX = -this.width/2 + ratio * this.width;
    this.setHandlePosition(localX);
  }
});
