AFRAME.registerComponent('reloj', {
  init: function () {
    this.currentIndex = 1;
    this.lastSecond = 0;
    this.running = false;
    this.velocidad = 1;
    this.direction = 1; // 1 = hacia adelante, -1 = hacia atrás
  },

  tick: function (time) {
    if (!this.running) return;

    const seconds = Math.floor(time / 1000) * this.velocidad;

    if (seconds > this.lastSecond) {
      this.el.emit('reloj-tick', this.currentIndex);
      this.lastSecond = seconds;

      this.currentIndex += this.direction; // avanza o retrocede
    }
  },

  // métodos de control
  play: function () { this.running = true; this.direction = 1; },
  pause: function () { this.running = false; },
  reset: function () { 
    this.currentIndex = 0; 
    this.lastSecond = 1; 
    const huellas = this.el.sceneEl.querySelectorAll('.clickeable');
    huellas.forEach(el => el.remove());
  },
  setVelocidad: function (v) { this.velocidad = v; },
  backward: function () { 
    this.running = true;
    this.direction = -1;
  }
});
