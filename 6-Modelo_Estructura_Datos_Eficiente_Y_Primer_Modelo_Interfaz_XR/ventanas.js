AFRAME.registerComponent('ventanas', {
  init: function () {
    this.conexiones = [];
    this.ventanas = [];
    this.activa = null;
  },

  // =========================================
  // SE LLAMA DESDE historia.js
  // =========================================
  addConexion: function (origen, destino) {
    const key = `${origen}-${destino}`;

    if (this.conexiones.find(c => c.key === key)) return;

    this.conexiones.push({ origen, destino, key });
    this.reconstruir();
  },

  // =========================================
  reconstruir: function () {
    // borrar ventanas anteriores
    this.ventanas.forEach(v => v.remove());
    this.ventanas = [];

    const total = this.conexiones.length;
    if (total === 0) return;

    const radio = 3;
    const altura = 1.6;
    const arcoTotal = 360;
    const arcoPorVentana = arcoTotal / total;

    this.conexiones.forEach((c, i) => {
      const thetaStart = i * arcoPorVentana;

      const ventana = document.createElement('a-entity');

      ventana.setAttribute('ventana', {
        titulo: `${c.origen} → ${c.destino}`,
        radio: radio,
        thetaStart: thetaStart,
        thetaLength: arcoPorVentana
      });

      ventana.setAttribute('position', `0 ${altura} 0`);
      ventana.classList.add('ventana-clickable');

      ventana.addEventListener('ventana-click', () => {
        this.seleccionarVentana(ventana);
      });

      this.el.appendChild(ventana);
      this.ventanas.push(ventana);
    });
  },

  // =========================================
  seleccionarVentana: function (ventana) {
    if (this.activa === ventana) return;

    this.ventanas.forEach(v => {
      v.components.ventana.data.activa = false;
      v.components.ventana.actualizar();
    });

    ventana.components.ventana.data.activa = true;
    ventana.components.ventana.actualizar();

    this.activa = ventana;
  }
});
