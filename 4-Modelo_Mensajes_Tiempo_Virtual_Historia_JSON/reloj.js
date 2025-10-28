AFRAME.registerComponent('reloj', {
  init: function () {
    this.time = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1; // 1 para avanzar, -1 para retroceder

    const mostrarVelocidad = () => {
      const texto = document.querySelector('#velocidad-valor');
      if (texto) texto.setAttribute('value', this.velocidad.toFixed(1) + 'x');
    };

    // BOTÓN PAUSA / REANUDAR
    document.querySelector('#btn-pausa').addEventListener('click', () => {
      this.pausado = !this.pausado;
      console.log(this.pausado ? "⏸️ Pausado" : "▶️ Reanudado");
    });

    // BOTÓN AVANZAR
    document.querySelector('#btn-avanzar').addEventListener('click', () => {
      this.direccion = 1;
      console.log("Avanzando")
    });

    // BOTÓN RETROCEDER
    document.querySelector('#btn-retroceder').addEventListener('click', () => {
      this.direccion = -1;
      console.log("Retrocediendo")
    });

    // 🔹 BOTONES DE VELOCIDAD
    document.querySelector('#btn-vel-mas').addEventListener('click', () => {
      this.velocidad = Math.min(this.velocidad + 0.1, 5); // límite superior
      mostrarVelocidad();
      console.log(`🚀 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });

    document.querySelector('#btn-vel-menos').addEventListener('click', () => {
      this.velocidad = Math.max(this.velocidad - 0.1, 0.1); // límite inferior
      mostrarVelocidad();
      console.log(`🐢 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });
  },

  tick: function (time, delta) {
    if (this.pausado) return;
    this.time += (delta / 1000) * this.direccion * this.velocidad;
    this.el.emit('reloj-tick', { time: this.time, direccion: this.direccion });
  }
});

