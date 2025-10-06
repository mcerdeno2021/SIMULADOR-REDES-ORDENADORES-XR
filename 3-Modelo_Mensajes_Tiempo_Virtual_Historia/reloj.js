AFRAME.registerComponent('reloj', {
  tick: function (time) {
    time = time / 1000;
    this.el.emit('reloj-tick', time);
  }
});
