AFRAME.registerComponent('resumen', {
  init: function () {
    const el = this.el;

    this.mensajes = {};
    this.filas = {};
    this.filtro = '';

    // 🪟 PANEL PRINCIPAL
    this.panel = document.createElement('a-plane');
    this.panel.setAttribute('position', '5 5 0');
    this.panel.setAttribute('width', '6');
    this.panel.setAttribute('height', '6');
    this.panel.setAttribute('color', '#000000');
    this.panel.setAttribute('opacity', '0.92');
    this.panel.setAttribute('material', 'side: double');
    el.appendChild(this.panel);

    this.contenedor = document.createElement('a-entity');
    this.contenedor.setAttribute('position', '0.5 2.5 0.02');
    this.panel.appendChild(this.contenedor);

    // 🧾 CABECERA estilo Wireshark
    this.header = document.createElement('a-entity');
    this.header.setAttribute('text', {
      value:
        '📡 CAPTURE\n' +
        'No | Time      | Source → Destination | Proto | Len | Info\n' +
        '--------------------------------------------------------------------------',
      color: '#00ffff',
      align: 'left',
      width: 6,
      wrapCount: 120,
      font: 'monoid'
    });
    this.contenedor.appendChild(this.header);

    // 🔍 BUSCADOR
    this.busqueda = document.createElement('a-entity');
    this.busqueda.setAttribute('position', '0 -0.4 0');
    this.busqueda.setAttribute('text', {
      value: 'Filter: ',
      color: '#0ff',
      align: 'left',
      width: 6,
      wrapCount: 120,
      font: 'monoid'
    });
    this.contenedor.appendChild(this.busqueda);

    el.addEventListener('nuevoPaquete', e => {
      this.agregarPaquete(e.detail);
    });

    window.addEventListener('keydown', e => {
      if (e.key.length === 1) this.filtro += e.key.toLowerCase();
      else if (e.key === 'Backspace') this.filtro = this.filtro.slice(0, -1);
      this.actualizarFiltro();
    });
  },

  agregarPaquete: function (m) {
    this.mensajes[m.id] = m;

    const fila = document.createElement('a-entity');
    const offsetY = -0.8 - Object.keys(this.filas).length * 0.22;
    fila.setAttribute('position', `0 ${offsetY} 0`);

    const colores = {
      TCP: '#88ff88',
      UDP: '#ffcc66',
      ICMP: '#ff8888'
    };

    fila.setAttribute('text', {
      value: this.generarTextoFila(m),
      color: colores[m.protocol] || '#eeeeee',
      align: 'left',
      width: 6,
      wrapCount: 120,
      font: 'monoid'
    });

    fila.setAttribute('class', 'fila');
    fila.setAttribute('cursor-listener', '');

    fila.addEventListener('click', () => {
      this.toggleDetalle(m.id, fila);
      this.el.emit('paqueteSeleccionado', { paquete: m });
    });

    this.filas[m.id] = fila;
    this.contenedor.appendChild(fila);
  },

  generarTextoFila: function (m) {
    const id = String(m.id).padStart(3, ' ');
    const time = m.timestamp.toFixed(6).padStart(8);
    const source = (m.origen || '?').padEnd(6);
    const dest = (m.destino || '?').padEnd(6);
    const proto = (m.protocol || '').padEnd(5);
    const len = String(m.length || 0).padStart(4);
    const info = m.info || '';

    return `${id} | ${time} | ${source} → ${dest} | ${proto} | ${len} | ${info}`;
  },

  toggleDetalle: function (id, fila) {
    const m = this.mensajes[id];

    if (fila._expanded) {
      fila._detalle.remove();
      fila._expanded = false;
      return;
    }
    
    let detalleTexto =
      `Frame ${m.id}\n` +
      `Arrival Time: ${m.timestamp}s\n` +
      `Frame Length: ${m.length} bytes\n\n`;

    if (m.ethernet) {
      detalleTexto +=
        `Ethernet II\n` +
        `  Src: ${m.ethernet.src_mac}\n` +
        `  Dst: ${m.ethernet.dst_mac}\n\n`;
    }

    if (m.ip) {
      detalleTexto +=
        `Internet Protocol\n` +
        `  Src: ${m.ip.src}\n` +
        `  Dst: ${m.ip.dst}\n` +
        `  TTL: ${m.ip.ttl}\n\n`;
    }

    if (m.tcp) {
      detalleTexto +=
        `Transmission Control Protocol\n` +
        `  Src Port: ${m.tcp.src_port}\n` +
        `  Dst Port: ${m.tcp.dst_port}\n` +
        `  Flags: ${m.tcp.flags}\n\n`;
    }

    if (m.udp) {
      detalleTexto +=
        `User Datagram Protocol\n` +
        `  Src Port: ${m.udp.src_port}\n` +
        `  Dst Port: ${m.udp.dst_port}\n\n`;
    }

    const detalle = document.createElement('a-entity');
    detalle.setAttribute('position', '3 -0.22 0');
    detalle.setAttribute('text', {
      value: detalleTexto,
      color: '#bbbbbb',
      align: 'left',
      width: 6,
      wrapCount: 120,
      font: 'monoid'
    });

    fila.appendChild(detalle);
    fila._detalle = detalle;
    fila._expanded = true;
  },

  actualizarFiltro: function () {
    this.busqueda.setAttribute('text', 'value', `Filter: ${this.filtro}`);

    Object.entries(this.filas).forEach(([id, fila]) => {
      const m = this.mensajes[id];
      const texto = `${m.origen_id} ${m.destino_id} ${m.protocol} ${m.info}`.toLowerCase();
      fila.object3D.visible = texto.includes(this.filtro.toLowerCase());
    });
  }
});


// 💡 Hover efecto
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    this.el.addEventListener('mouseenter', () =>
      this.el.setAttribute('text', 'color', '#FFD700')
    );
    this.el.addEventListener('mouseleave', () => {
      const proto = this.el.components.text.data.value.includes('TCP') ? 'TCP' : '';
      this.el.setAttribute('text', 'color', '#ffffff');
    });
  }
});
