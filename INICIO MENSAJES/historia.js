AFRAME.registerComponent('historia', {

    init: function () {
      const el = this.el;
      const historia = {};

      el.addEventListener('historia', e => {
        console.log(e.detail);
        historia[e.detail[0]] = {
          indice : e.detail[1],
          posicionOrigen: e.detail[2],
          posicionDestino: e.detail[3],
          huella: e.detail[4]
        };
      })
    }
})