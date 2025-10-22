AFRAME.registerComponent('reloj', {
  init: function () {
    this.estadoAnterior = null;
  },

  tick: function (time, delta) {
    time = time / 1000;
    this.el.emit('reloj-tick', {time: time, delta:delta});

    let nuevaAccion;
    
    if (time > 5) {
      nuevaAccion = "pausar";
      if (time > 10) {
        nuevaAccion = "retroceder";}
    }

    if (this.estadoAnterior !== nuevaAccion) {
      this.el.emit('control-historia', {accion: nuevaAccion});
      this.estadoAnterior = nuevaAccion;
    }
  }
});
