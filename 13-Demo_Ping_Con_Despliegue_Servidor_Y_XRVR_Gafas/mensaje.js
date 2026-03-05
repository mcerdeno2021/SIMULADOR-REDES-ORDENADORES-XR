AFRAME.registerComponent('mensaje', {
  init: function () {
    this.entidades = {};
    this.trazas = {};
    this.paneles = null;
    
    this.coloresProtocolos = {};
    this.protocolosDetectados = new Set();

    this.el.addEventListener('paneles', e => {
      this.paneles = e.detail;
    });

    this.el.addEventListener('mensaje', e => {
    const { id, x, y, z, estado, conexion, visible, protocolo } = e.detail;

    const entidad = this.crearEntidadSiNoExiste(id, x, y, z, conexion, protocolo);

    if (estado === "Crear" || estado === "Mover") {
      entidad.setAttribute('visible', visible);
      entidad.setAttribute('position', `${x} ${y} ${z}`);
    }

    if (estado === "Acabar") {
      entidad.setAttribute('visible', false);
    }

    const traza = this.crearTrazaSiNoExiste(id, conexion, x, y, z);
    if (traza) {
      this.actualizarTraza(traza, x, y, z);
    }
  });
  },

  // ===============================
  // COMPARAR CONEXIONES SIN DIRECCIÓN
  // ===============================
  mismaConexion: function (idPanel, conexionMensaje) {
    if (!idPanel || !conexionMensaje) return false;

    const [a1, b1] = idPanel.split(' -> ');
    const [a2, b2] = conexionMensaje.split(' -> ');

    return (a1 === a2 && b1 === b2) || (a1 === b2 && b1 === a2);
  },

  // ===============================
  // CREAR PAQUETE
  // ===============================
  crearEntidadSiNoExiste: function (id, x, y, z, conexionMensaje, protocolo) {
    if (this.entidades[id]) return this.entidades[id];

    const entidad = document.createElement('a-box');
    entidad.setAttribute('depth', 0.2);
    entidad.setAttribute('height', 0.2);
    entidad.setAttribute('width', 0.2);
    this.protocolosDetectados.add(protocolo);
    this.generarColoresProtocolos()
    const color = this.coloresProtocolos[protocolo] || "#FFFFFF";
    entidad.setAttribute("color", color);
    entidad.setAttribute('position', `${x} ${y} ${z}`);
    
    entidad.classList.add('mensaje')
    entidad.dataset.conexion = conexionMensaje;

    this.el.sceneEl.appendChild(entidad);
    this.entidades[id] = entidad;
    return entidad;
  },

  // ===============================
  // CREAR TRAZA (UNA SOLA VEZ)
  // ===============================
  crearTrazaSiNoExiste: function (id, conexion, x, y, z) {
    if (this.trazas[id]) return this.trazas[id];
    if (!this.paneles) return null;

    const panel = this.paneles.find(p => this.mismaConexion(p.id, conexion));
    if (!panel) return null;

    const cilindro = document.createElement('a-cylinder');
    cilindro.setAttribute('radius', 0.03);
    cilindro.setAttribute('height', 0.01);
    cilindro.setAttribute('color', '#ff00aa');
    cilindro.setAttribute('opacity', 0.8);

    panel.appendChild(cilindro);

    // Guardamos el punto inicial EN LOCAL DEL PANEL
    const worldStart = new THREE.Vector3(x, y, z);
    const localStart = panel.object3D.worldToLocal(worldStart.clone());

    this.trazas[id] = {
      panel: panel,
      cilindro: cilindro,
      inicio: localStart
    };

    return this.trazas[id];
  },

  // ===============================
  // ACTUALIZAR TRAZA (ESTIRAR + ROTAR)
  // ===============================
  actualizarTraza: function (traza, x, y, z) {
    const { panel, cilindro, inicio } = traza;

    const worldNow = new THREE.Vector3(x, y, z);
    const localNow = panel.object3D.worldToLocal(worldNow.clone());

    const direccion = new THREE.Vector3().subVectors(localNow, inicio);
    const distancia = direccion.length();

    if (distancia < 0.001) return;

    const medio = new THREE.Vector3().addVectors(inicio, localNow).multiplyScalar(0.5);

    cilindro.setAttribute('height', distancia);
    cilindro.setAttribute('position', medio);

    const ejeY = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(ejeY, direccion.clone().normalize());

    cilindro.object3D.quaternion.copy(quat);
  },

  generarColoresProtocolos: function () {

    this.protocolosDetectados.forEach(proto => {
      if (this.coloresProtocolos[proto]) return;
      this.coloresProtocolos[proto] = this.colorAleatorio();
      console.log(this.coloresProtocolos)
    });

    this.crearPanelProtocolos();

  },

  colorAleatorio: function () {

    const r = Math.floor(Math.random() * 156 + 100);
    const g = Math.floor(Math.random() * 156 + 100);
    const b = Math.floor(Math.random() * 156 + 100);

    return `rgb(${r},${g},${b})`;
  },

  crearPanelProtocolos() {

    const viejo = document.getElementById("panel-protocolos");
    if (viejo) viejo.remove();

    const panel = document.createElement("a-plane");

    panel.setAttribute("id", "panel-protocolos");
    panel.setAttribute("width", 2.5);
    panel.setAttribute("height", 1.5);
    panel.setAttribute("color", "#111");
    panel.setAttribute("position", "-2 1.5 -2");
    panel.setAttribute("look-at", "[camera]");
    panel.setAttribute("material", "opacity:0.95; transparent:true");

    let y = 0.6;

    Object.entries(this.coloresProtocolos).forEach(([proto, color]) => {

      const cuadrito = document.createElement("a-plane");
      cuadrito.setAttribute("width", 0.2);
      cuadrito.setAttribute("height", 0.2);
      cuadrito.setAttribute("color", color);
      cuadrito.setAttribute("position", `-1 ${y} 0.01`);

      const texto = document.createElement("a-text");
      texto.setAttribute("value", proto);
      texto.setAttribute("align", "left");
      texto.setAttribute("color", "#FFF");
      texto.setAttribute("width", 2);
      texto.setAttribute("position", `-0.6 ${y} 0.01`);

      panel.appendChild(cuadrito);
      panel.appendChild(texto);

      y -= 0.3;
    });

    this.el.sceneEl.appendChild(panel);
  }
});
