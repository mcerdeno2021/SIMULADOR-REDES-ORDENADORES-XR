AFRAME.registerComponent('reloj', {
  tick: function (time, delta) {
    time = time / 1000;
    this.el.emit('reloj-tick', {time: time, delta:delta});
  }
});
