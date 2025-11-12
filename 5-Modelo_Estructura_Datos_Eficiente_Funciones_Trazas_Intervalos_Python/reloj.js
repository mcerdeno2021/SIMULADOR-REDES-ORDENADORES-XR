AFRAME.registerComponent('reloj', {
  init: function () {
    this.tiempo = 0;
    this.velocidad = 1;
    this.pausado = false;
    this.direccion = 1; // 1 para avanzar, -1 para retroceder
    this.mostrado = false; // Para no repetir el mensaje al llegar a 0

    const mostrarVelocidad = () => {
      const valorVelocidad = document.querySelector('#velocidad-valor');
      valorVelocidad.setAttribute('value', this.velocidad.toFixed(1) + 'x'); // Se usa toFixed para tener solo un decimal
    };

    document.querySelector('#btn-pausa').addEventListener('click', () => {
      this.pausado = !this.pausado; // Cambia al booleano contrario
      console.log(this.pausado ? "⏸️ Pausado" : "▶️ Reanudado"); // Si True: pausado; si False: reanudado
    });
    document.querySelector('#btn-avanzar').addEventListener('click', () => {
      this.direccion = 1;
      console.log("⏩ Avanzando")
    });
    document.querySelector('#btn-retroceder').addEventListener('click', () => {
      this.direccion = -1;
      console.log("⏪ Retrocediendo")
    });

    document.querySelector('#btn-vel-mas').addEventListener('click', () => {
      this.velocidad = Math.min(this.velocidad + 0.1, 5); // Máximo 5
      mostrarVelocidad();
      console.log(`🚀 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });

    document.querySelector('#btn-vel-menos').addEventListener('click', () => {
      this.velocidad = Math.max(this.velocidad - 0.1, 0.1); // Mínimo 0.1
      mostrarVelocidad();
      console.log(`🐢 Velocidad: ${this.velocidad.toFixed(1)}x`);
    });
  },

  tick: function (time, delta) {
    if (this.pausado) return; // Detiene
    
    this.tiempo += (delta / 1000) * this.direccion * this.velocidad; // Entre 1000 para milisegundos

    if (this.tiempo < 0) { // Evita que el tiempo baje de 0
      this.tiempo = 0;
      if (!this.mostrado) {
        console.log("⏹️ Tiempo en 0");
        this.mostrado = true; // Ya se ha mostrado el mensaje
      }
    }

    const tiempoEntero = Math.floor(this.tiempo);

    // Solo emitir si cambia el número entero
    if (this.ultimoEntero !== tiempoEntero) {
      this.ultimoEntero = tiempoEntero;
      this.el.emit('reloj-tick', { tiempo: tiempoEntero, direccion: this.direccion });
    }
  }
});
