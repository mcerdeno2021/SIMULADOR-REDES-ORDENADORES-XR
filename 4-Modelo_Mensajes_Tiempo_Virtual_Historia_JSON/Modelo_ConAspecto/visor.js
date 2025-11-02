AFRAME.registerComponent('resumen', {
  init: function () {
    const el = this.el;
    this.mensajes = {};
    this.filas = {};
    this.filtro = '';

    // 🪟 Fondo del panel (opaco)
    this.panel = document.createElement('a-plane');
    this.panel.setAttribute('position', '-2 4.5 -3');
    this.panel.setAttribute('width', '5');
    this.panel.setAttribute('height', '4');
    this.panel.setAttribute('color', '#111');
    this.panel.setAttribute('opacity', '0.85');
    this.panel.setAttribute('material', 'side: double');
    el.appendChild(this.panel);

    // 📜 Contenedor del texto — lo movemos un poco al frente (z = 0.02)
    this.contenedor = document.createElement('a-entity');
    this.contenedor.setAttribute('position', '0 1.2 0');
    this.panel.appendChild(this.contenedor);

    // 🧾 Cabecera
    this.header = document.createElement('a-entity');
    this.header.setAttribute('text', {
      value: '📡 MONITOR DE PAQUETES\n# | Tiempo | Origen → Destino | Info\n-------------------------------------------',
      color: '#00ffff',
      align: 'left',
      width: 4.6,
      wrapCount: 80,
      font: 'monoid'
    });
    this.contenedor.appendChild(this.header);

    // 🔍 Campo de búsqueda
    this.busqueda = document.createElement('a-entity');
    this.busqueda.setAttribute('position', '0 -0.3 0');
    this.busqueda.setAttribute('text', {
      value: 'Buscar: ',
      color: '#0ff',
      align: 'left',
      width: 4.6,
      wrapCount: 80,
      font: 'monoid'
    });
    this.contenedor.appendChild(this.busqueda);

    // Escuchar actualizaciones
    el.addEventListener('resumen', e => {
      const historia = e.detail.historia;
      this.actualizarPanel(historia);
    });

    // Filtro por teclado
    window.addEventListener('keydown', e => {
      if (e.key.length === 1) this.filtro += e.key.toLowerCase();
      else if (e.key === 'Backspace') this.filtro = this.filtro.slice(0, -1);
      this.actualizarFiltro();
    });
  },

  actualizarPanel: function (historia) {
    const { id } = historia;
    this.mensajes[id] = historia;

    if (this.filas[id]) {
      this.actualizarFila(id);
      return;
    }

    const fila = document.createElement('a-entity');
    const offsetY = -0.8 - Object.keys(this.filas).length * 0.25;
    fila.setAttribute('position', `0 ${offsetY} 0`);
    fila.setAttribute('text', {
      value: this.generarTextoFila(historia),
      color: '#eee',
      align: 'left',
      width: 4.6,
      wrapCount: 80,
      font: 'monoid'
    });

    fila.setAttribute('class', 'fila');
    fila.setAttribute('cursor-listener', '');
    fila.addEventListener('click', () => this.toggleDetalle(id, fila));

    this.filas[id] = fila;
    this.contenedor.appendChild(fila);
  },

  actualizarFila: function (id) {
    const m = this.mensajes[id];
    const fila = this.filas[id];
    if (!fila) return;
    fila.setAttribute('text', 'value', this.generarTextoFila(m));
  },

  generarTextoFila: function (m) {
    const progreso = (m.ultimoProgreso * 100).toFixed(1);
    const tOrigen = m.tiempoOrigen?.toFixed(1) ?? 0;
    const tDestino = m.tiempoDestino?.toFixed(1) ?? 0;
    const info = progreso < 100 ? `(${progreso}%)` : '✅';

    return `${String(m.id).padStart(2, ' ')} | ${tOrigen.padStart(5)}s → ${tDestino.padStart(5)}s | ${m.origenNom || '?'} → ${m.destinoNom || '?'} | ${info}`;
  },

  toggleDetalle: function (id, fila) {
    const m = this.mensajes[id];
    if (fila._expanded) {
      fila._detalle.remove();
      fila._expanded = false;
      return;
    }

    const detalle = document.createElement('a-entity');
    detalle.setAttribute('position', '0 -0.18 0');
    detalle.setAttribute('text', {
      value:
        `🧩 Detalle de paquete #${id}\n` +
        `Origen: ${m.origenNom}\nDestino: ${m.destinoNom}\n` +
        `Duración: ${(m.tiempoDestino - m.tiempoOrigen).toFixed(2)}s\n` +
        `Progreso: ${(m.ultimoProgreso * 100).toFixed(1)}%`,
      color: '#aaa',
      align: 'left',
      width: 4.6,
      wrapCount: 80,
      font: 'monoid'
    });

    fila.appendChild(detalle);
    fila._detalle = detalle;
    fila._expanded = true;
  },

  actualizarFiltro: function () {
    this.busqueda.setAttribute('text', 'value', `Buscar: ${this.filtro}`);
    Object.entries(this.filas).forEach(([id, fila]) => {
      const m = this.mensajes[id];
      const texto = `${m.origenNom} ${m.destinoNom} ${id}`.toLowerCase();
      fila.object3D.visible = texto.includes(this.filtro.toLowerCase());
    });
  }
});

// 💡 efecto hover
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    this.el.addEventListener('mouseenter', () =>
      this.el.setAttribute('text', 'color', '#FFD700')
    );
    this.el.addEventListener('mouseleave', () =>
      this.el.setAttribute('text', 'color', '#ffffff')
    );
  }
});

