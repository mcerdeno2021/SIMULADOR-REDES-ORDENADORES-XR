AFRAME.registerComponent('reloj', {
  tick: function (time) {
    this.el.emit('reloj-tick', time);
  }
});
