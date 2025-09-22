AFRAME.registerComponent('reloj', {

  init: function () {
    this.currentIndex = 1;
    this.lastSecond = 0;
  },

  tick: function (time) {
    const seconds = Math.floor(time / 1000);

    if (seconds > this.lastSecond) {
      this.el.emit('reloj-tick',this.currentIndex);
      this.lastSecond = seconds;

      this.currentIndex++;   
    }
 }
});
