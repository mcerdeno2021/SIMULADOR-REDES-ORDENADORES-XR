AFRAME.registerComponent('reloj', {
  init: function () {
    this.time = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1; // 1 para avanzar, -1 para retroceder

    // BOTÓN PAUSA / REANUDAR
    document.querySelector('#btn-pausa').addEventListener('click', () => {
      this.pausado = !this.pausado; // alternar estado
      console.log(this.pausado ? "⏸️ Pausado" : "▶️ Reanudado");
    });

    // BOTÓN AVANZAR
    document.querySelector('#btn-avanzar').addEventListener('click', () => {
      this.direccion = 1;
    });

    // BOTÓN RETROCEDER
    document.querySelector('#btn-retroceder').addEventListener('click', () => {
      this.direccion = -1;
    });
  },

  tick: function (time, delta) {
    if (this.pausado) return; // detiene

    this.time += (delta / 1000) * this.direccion * this.velocidad;
    
    this.el.emit('reloj-tick', {time: this.time, delta: delta});
  }
});
