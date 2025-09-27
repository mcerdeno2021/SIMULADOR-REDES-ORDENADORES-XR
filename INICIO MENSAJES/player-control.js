AFRAME.registerComponent('player-control', {
  init: function () {
    const botones = this.el.querySelectorAll('.player');
    const idreloj = document.querySelector('#miReloj');
    const reloj = idreloj.components.reloj;

    botones[0].addEventListener('click', () => reloj.play());   // Play
    botones[1].addEventListener('click', () => reloj.pause());  // Pause
    botones[2].addEventListener('click', () => reloj.reset());  // Reset
    this.el.addEventListener('v', e => {
      var v = e.detail;
      console.log(v);
      botones[3].addEventListener('click', () => reloj.setVelocidad(v));  // Velocidad Xx
    })
    botones[4].addEventListener('click', () => reloj.backward());  // Marcha atrás
  }
});
