AFRAME.registerComponent('ventana', {
  schema: {
    titulo: { type: 'string' },
    radio: { type: 'number', default: 3 },
    thetaStart: { type: 'number' },
    thetaLength: { type: 'number' },
    activa: { type: 'boolean', default: false }
  },

  init: function () {
    const d = this.data;
    const el = this.el;

    // ===== PANEL CURVO =====
    this.panel = document.createElement('a-cylinder');
    this.panel.classList.add('ventana-clickable');
    this.panel.addEventListener('click', () => {
      this.el.emit('ventana-click');
    });
    this.panel.setAttribute('radius', d.radio);
    this.panel.setAttribute('height', 1);
    this.panel.setAttribute('open-ended', true);
    this.panel.setAttribute('side', 'double');
    this.panel.setAttribute('theta-start', d.thetaStart);
    this.panel.setAttribute('theta-length', d.thetaLength);
    this.panel.setAttribute('opacity', 0.35);
    this.panel.setAttribute('color', '#ffffff');

    el.appendChild(this.panel);

    // ===== TEXTO CURVO =====
    this.crearTextoCurvo();

    this.actualizar();
  },

  crearTextoCurvo: function () {
    const d = this.data;
    const texto = d.titulo.split('');
    const centro = d.thetaStart + d.thetaLength / 2;
    const radioTexto = d.radio - 0.05;

    texto.forEach((char, i) => {
      const paso = d.thetaLength / Math.max(texto.length - 1, 1);
      const ang = d.thetaStart + i * paso;
      const rad = THREE.MathUtils.degToRad(ang);

      const letra = document.createElement('a-text');
      letra.setAttribute('value', char);
      letra.setAttribute('color', '#111');
      letra.setAttribute('width', 0.6);
      letra.setAttribute('align', 'center');

      const x = Math.sin(rad) * radioTexto;
      const z = Math.cos(rad) * radioTexto;

      letra.setAttribute('position', `${x} 0 ${z}`);
      letra.setAttribute('rotation', `0 ${-ang} 0`);

      this.el.appendChild(letra);
    });
  },

  actualizar: function () {
    this.panel.setAttribute('opacity', this.data.activa ? 0.85 : 0.35);
    this.panel.setAttribute('color', this.data.activa ? '#ffffff' : '#88ccee');
  }
});
