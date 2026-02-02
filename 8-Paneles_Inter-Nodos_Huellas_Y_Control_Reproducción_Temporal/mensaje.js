AFRAME.registerComponent('mensaje', {
  init: function () {
    this.entidades = {};
    this.trazas = {};
    this.paneles = null;

    this.el.addEventListener('paneles', e => {
      this.paneles = e.detail;
    });

    this.el.addEventListener('mensaje', e => {
      const { id, x, y, z, estado, conexion } = e.detail;

      const entidad = this.crearEntidadSiNoExiste(id, x, y, z, conexion);

      if (estado === "Crear" || estado === "Mover") {
        entidad.setAttribute('visible', true);
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
  crearEntidadSiNoExiste: function (id, x, y, z, conexionMensaje) {
    if (this.entidades[id]) return this.entidades[id];

    const entidad = document.createElement('a-box');
    entidad.setAttribute('depth', 0.2);
    entidad.setAttribute('height', 0.2);
    entidad.setAttribute('width', 0.2);
    entidad.setAttribute('color', '#0000ff');
    entidad.setAttribute('position', `${x} ${y} ${z}`);
    
    entidad.classList.add('mensaje')
    entidad.dataset.conexion = conexionMensaje;
    console.log(conexionMensaje)

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
  }
});
