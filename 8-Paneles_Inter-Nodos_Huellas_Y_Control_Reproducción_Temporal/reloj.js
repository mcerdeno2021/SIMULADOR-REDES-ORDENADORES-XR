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

  tick: function(time, delta) {
    if (this.pausado) return;

    let deltaSeg = (delta / 1000) * this.direccion * this.velocidad;

    if (this.tiempo <= 0 && this.direccion < 0) {
      this.tiempo = 0;
      return;
    }

    // Actualizamos el tiempo
    this.tiempo += deltaSeg;

    // Emitimos solo si está dentro de los límites
    this.el.emit('set-time', this.tiempo);

    fetch('escenario.json')
      .then(r => r.json())
      .then(datos => {
        const {mensajes} = datos;

        const max = Math.max(...mensajes.map(m => m.tiempoDestino));
        // Limitar al tiempo máximo y mínimo
        if (max !== null) {
          if (this.direccion > 0 && this.tiempo >= max) {
            this.tiempo = max;
            // ⬅️ DETENER la emisión de eventos
            return;
          }
        }
        const textoTiempo = document.querySelector('#tiempo');
        textoTiempo.setAttribute('value', `${this.tiempo.toFixed(2)} / ${max.toFixed(2)}`)
      });

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
    this.step = 0.1;
    this.width = 8;
    this.dragging = false;

    fetch('escenario.json')
      .then(r => r.json())
      .then(datos => {
        const {mensajes} = datos;

        this.max = Math.max(...mensajes.map(m => m.tiempoDestino));
      });
    
    // === BARRA FONDO ===
    this.bar = document.createElement('a-plane');
    this.bar.setAttribute('width', this.width);
    this.bar.setAttribute('height', 0.12);
    this.bar.setAttribute('color', '#dddddd');
    this.bar.setAttribute('class', 'btn');
    this.el.appendChild(this.bar);

    // === BARRA PROGRESO (oscura) ===
    this.progress = document.createElement('a-plane');
    this.progress.setAttribute('width', 0.001);
    this.progress.setAttribute('height', 0.12);
    this.progress.setAttribute('color', '#666666');
    this.progress.setAttribute('position', `${-this.width/2} 0 0.01`);
    this.el.appendChild(this.progress);

    // === MANIJA ===
    this.handle = document.createElement('a-circle');
    this.handle.setAttribute('radius', 0.1);
    this.handle.setAttribute('color', '#222');
    this.handle.setAttribute('position', `${-this.width / 2} 0 0.02`);
    this.handle.setAttribute('class', 'btn');
    this.el.appendChild(this.handle);

    this.cursorEl = this.el.sceneEl.querySelector('[cursor]');

    this.handle.addEventListener('mousedown', () => this.dragging = true);

    window.addEventListener('mouseup', () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.emitValue();
    });

    this.bar.addEventListener('click', (e) => {
      this.updateFromRay();
      this.emitValue();
    });

    this.el.sceneEl.addEventListener('set-time', e => {
      this.setValue(e.detail);
    });
  },

  tick: function () {
    if (!this.dragging) return;
    this.updateFromRay();
  },

  updateFromRay: function () {
    const ray = this.cursorEl.components.raycaster;
    if (!ray) return;

    const intersection = ray.getIntersection(this.bar);
    if (!intersection) return;

    const worldPoint = intersection.point.clone();
    this.el.object3D.worldToLocal(worldPoint);

    let localX = THREE.MathUtils.clamp(worldPoint.x, -this.width/2, this.width/2);
    this.setHandlePosition(localX);
  },

  setHandlePosition: function(localX) {
    this.handle.object3D.position.x = localX;

    // actualizar barra de progreso
    const progressWidth = localX + this.width/2;
    this.progress.setAttribute('width', progressWidth);
    this.progress.setAttribute('position', `${-this.width/2 + progressWidth/2} 0 0.01`);
  },

  emitValue: function () {
    const localX = this.handle.object3D.position.x;
    const ratio = (localX + this.width / 2) / this.width;
    let value = this.min + ratio * (this.max - this.min);
    value = Math.round(value / this.step) * this.step;
    this.el.emit('time', value);
  },

  // 👇 MOVER SLIDER AUTOMÁTICAMENTE SEGÚN TIEMPO
  setValue: function(value) {
    value = THREE.MathUtils.clamp(value, this.min, this.max);
    const ratio = (value - this.min) / (this.max - this.min);
    const localX = -this.width/2 + ratio * this.width;
    this.setHandlePosition(localX);
  }
});
