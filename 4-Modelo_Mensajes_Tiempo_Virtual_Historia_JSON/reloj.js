AFRAME.registerComponent('reloj', {
  init: function () {
    this.time = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1; // 1 para avanzar, -1 para retroceder

    this.el.addEventListener('control', e => {
      const accion = e.detail.accion;
      if (accion === 'pausar') this.pausado = true;
      else if (accion === 'reanudar') this.pausado = false;
      else if (accion === 'retroceder') this.direccion = -1;
      else if (accion === 'avanzar') this.direccion = 1;
    });
  },

  tick: function (time, delta) {
    if (this.pausado) return; // detiene

    this.time += (delta / 1000) * this.direccion * this.velocidad;
    console.log("Reloj tiempo:", this.time, delta/1000);
    
    this.el.emit('reloj-tick', {time: this.time, delta: delta });
  }
});
