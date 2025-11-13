AFRAME.registerComponent('reloj', {
  schema: {
    intervaloPrecision: { type: 'number', default: 0.1 } // segundos entre ticks
  },

  init: function () {
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

    mostrarVelocidad();
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
    const intervalo = this.data.intervaloPrecision;

    if (this.direccion === 1 && this.tiempo >= this.ultimoTick + intervalo) {
      this.ultimoTick += intervalo;
      this.el.emit('reloj-tick', { tiempo: this.tiempo, direccion: this.direccion });
    } else if (this.direccion === -1 && this.tiempo <= this.ultimoTick - intervalo) {
      this.ultimoTick -= intervalo;
      this.el.emit('reloj-tick', { tiempo: this.tiempo, direccion: this.direccion });
    }
  }
});
