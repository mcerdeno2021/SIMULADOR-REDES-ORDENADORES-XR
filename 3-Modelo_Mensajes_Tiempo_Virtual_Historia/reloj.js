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
        nuevaAccion = "reanudar";}
        if (time > 15) {
          nuevaAccion = "retroceder";}
          if (time > 20) {
            nuevaAccion = "pausar";}
            if (time > 25) {
              nuevaAccion = "reanudar";}
              if (time > 30) {
                nuevaAccion = "avanzar";} // es la unica que no funciona, va directamente al final (manejar keys usadas?)
    }

    if (this.estadoAnterior !== nuevaAccion) {
      this.el.emit('control-historia', {accion: nuevaAccion});
      this.estadoAnterior = nuevaAccion;
    }
  }
});
