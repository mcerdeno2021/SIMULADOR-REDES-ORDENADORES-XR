AFRAME.registerComponent('reloj', {
  tick: function (time, delta) {
    time = time / 1000;
    this.el.emit('reloj-tick', {time: time, delta:delta});
    if (time > 7) {
      this.el.emit('control-historia', {accion: "retroceder"});
    } else {
      this.el.emit('control-historia', {accion: "reanudar"});
    }
  }
});
