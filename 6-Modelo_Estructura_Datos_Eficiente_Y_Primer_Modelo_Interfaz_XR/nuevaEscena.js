AFRAME.registerComponent('modo-escena', {
  init() {
    this.modo = 'global';
    this.conexionActiva = null;

    this.el.addEventListener('activar-conexion', e => {
      this.modo = 'conexion';
      this.conexionActiva = e.detail;
      this.aplicarFiltro();
    });

    this.el.addEventListener('salir-conexion', () => {
      this.modo = 'global';
      this.conexionActiva = null;
      this.restaurar();
    });
  },

  aplicarFiltro() {
    const { origen, destino } = this.conexionActiva;

    // NODOS
    document.querySelectorAll('[ordenador],[router],[switch]').forEach(el => {
      el.object3D.visible =
        el.id === origen || el.id === destino;
    });

    // CABLES
    document.querySelectorAll('[cable]').forEach(el => {
      const data = el.components.cable.data;
      el.object3D.visible =
        (data.origen === origen && data.destino === destino) ||
        (data.origen === destino && data.destino === origen);
    });
  },

  restaurar() {
    document.querySelectorAll('[ordenador],[router],[switch],[cable]').forEach(el => {
      el.object3D.visible = true;
    });
  }
});
