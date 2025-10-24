AFRAME.registerComponent('reloj', {
  init: function () {
    this.estadoAnterior = null;
  },

  tick: function (time, delta) {
    time = time / 1000;
    this.el.emit('reloj-tick', {time: time, delta: delta});

    let nuevaAccion;
    
    if (time > 5) {
      nuevaAccion = "pausar";
      if (time > 10) {
        nuevaAccion = "avanzar"}
        if (time > 15) {
          nuevaAccion = "retroceder"}
          if (time > 20) {
            nuevaAccion = "pausar"}
            if (time > 25) {
              nuevaAccion = "retroceder"}
              if (time > 30) {
                nuevaAccion = "avanzar"} 
              // no funciona porque aunque el tiempo se para con las pausas, tu vas retrodediendo y tal pero el tiempo avanza, entonces cuando quieres por ejemplo avanzar o retroceder ya no esta el tiempo dentro del rango
    }
    if (this.estadoAnterior !== nuevaAccion) {
      this.el.emit('control-historia', {accion: nuevaAccion});
      this.estadoAnterior = nuevaAccion;
    }
  }
});
