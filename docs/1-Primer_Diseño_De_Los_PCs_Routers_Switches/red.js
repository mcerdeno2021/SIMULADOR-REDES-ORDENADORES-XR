AFRAME.registerComponent('red', {
  schema: {
    cantidadPC: { type: 'int' },
    cantidadRouter: { type: 'int' },
    cantidadSwitch: { type: 'int' }
  },
  init: function () {
    var routerPosArr = [];
    var switchPosArr = [];

    // Crear routers
    for (var r = 0; r < this.data.cantidadRouter; r++) {
      var x = Math.random() * 30 - 15;
      var z = Math.random() * 30 - 15;
      var pcPos = new THREE.Vector3(x, 0, z);

      var router = document.createElement('a-entity');
      router.setAttribute('router', '');
      router.setAttribute('position', (r * 3) + ' 0 -3');
      this.el.appendChild(router);

      var pos = new THREE.Vector3(r * 3, 0, -3);
      routerPosArr[r] = pos;
    }

    // Crear switches
    for (var s = 0; s < this.data.cantidadSwitch; s++) {
      var switchElement = document.createElement('a-entity');
      switchElement.setAttribute('switch', '');
      switchElement.setAttribute('position', (s * 3) + ' 0 0');
      this.el.appendChild(switchElement);

      var posS = new THREE.Vector3(s * 3, 0, 0);
      switchPosArr[s] = posS;
    }

    // Crear PCs
    for (var i = 0; i < this.data.cantidadPC; i++) {
      var x = Math.random() * 10 - 5;
      var z = Math.random() * 10 - 5;
      var pcPos = new THREE.Vector3(x, 0, z);

      var ordenador = document.createElement('a-entity');
      ordenador.setAttribute('ordenador', '');
      ordenador.setAttribute('position', x + ' 0 ' + z);
      this.el.appendChild(ordenador);

      // Buscar destino (switch más cercano o router más cercano)
      var destino = null;

      if (this.data.cantidadSwitch > 0) {
        destino = switchPosArr[0];
        var minDist = pcPos.distanceTo(destino);
        for (var s2 = 1; s2 < this.data.cantidadSwitch; s2++) {
          var d = pcPos.distanceTo(switchPosArr[s2]);
          if (d < minDist) {
            minDist = d;
            destino = switchPosArr[s2];
          }
        }
      }

      if (!destino && this.data.cantidadRouter > 0) {
        destino = routerPosArr[0];
        var minDistR = pcPos.distanceTo(destino);
        for (var r2 = 1; r2 < this.data.cantidadRouter; r2++) {
          var d2 = pcPos.distanceTo(routerPosArr[r2]);
          if (d2 < minDistR) {
            minDistR = d2;
            destino = routerPosArr[r2];
          }
        }
      }

      // Crear cable solo si hay destino válido
      if (destino) {
        var distancia = pcPos.distanceTo(destino);
        var puntoMedio = new THREE.Vector3().addVectors(pcPos, destino).multiplyScalar(0.5);

        var cable = document.createElement('a-cylinder');
        cable.setAttribute('src', 'cable.png');
        cable.setAttribute('radius', 0.01);
        cable.setAttribute('height', distancia);
        cable.setAttribute('position', puntoMedio.x + ' ' + puntoMedio.y + ' ' + puntoMedio.z);

        // Rotación hacia el destino
        var dir = new THREE.Vector3().subVectors(destino, pcPos).normalize();
        var eje = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
        var angulo = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir));
        var rotacion = new THREE.Quaternion().setFromAxisAngle(eje, angulo);
        cable.object3D.setRotationFromQuaternion(rotacion);

        this.el.appendChild(cable);
      }
    }

    // Conectar switches al router más cercano
    for (var s3 = 0; s3 < this.data.cantidadSwitch; s3++) {
      var switchPos = switchPosArr[s3];
      var destinoR = null;

      if (this.data.cantidadRouter > 0) {
        destinoR = routerPosArr[0];
        var minDistSR = switchPos.distanceTo(destinoR);
        for (var r3 = 1; r3 < this.data.cantidadRouter; r3++) {
          var d3 = switchPos.distanceTo(routerPosArr[r3]);
          if (d3 < minDistSR) {
            minDistSR = d3;
            destinoR = routerPosArr[r3];
          }
        }
      }

      if (destinoR) {
        var distSR = switchPos.distanceTo(destinoR);
        var puntoMedioSR = new THREE.Vector3().addVectors(switchPos, destinoR).multiplyScalar(0.5);

        var cableSR = document.createElement('a-cylinder');
        cableSR.setAttribute('src', 'cable.png');
        cableSR.setAttribute('radius', 0.01);
        cableSR.setAttribute('height', distSR);
        cableSR.setAttribute('position', puntoMedioSR.x + ' ' + puntoMedioSR.y + ' ' + puntoMedioSR.z);

        var dirSR = new THREE.Vector3().subVectors(destinoR, switchPos).normalize();
        var ejeSR = new THREE.Vector3(0, 1, 0).cross(dirSR).normalize();
        var anguloSR = Math.acos(new THREE.Vector3(0, 1, 0).dot(dirSR));
        var rotacionSR = new THREE.Quaternion().setFromAxisAngle(ejeSR, anguloSR);
        cableSR.object3D.setRotationFromQuaternion(rotacionSR);

        this.el.appendChild(cableSR);
      }
    }

    // Conectar routers entre sí
    for (var r4 = 0; r4 < this.data.cantidadRouter; r4++) {
      for (var r5 = r4 + 1; r5 < this.data.cantidadRouter; r5++) {
        var posR1 = routerPosArr[r4];
        var posR2 = routerPosArr[r5];

        var distRR = posR1.distanceTo(posR2);
        var puntoMedioRR = new THREE.Vector3().addVectors(posR1, posR2).multiplyScalar(0.5);

        var cableRR = document.createElement('a-cylinder');
        cableRR.setAttribute('src', 'cable.png');
        cableRR.setAttribute('radius', 0.01);
        cableRR.setAttribute('height', distRR);
        cableRR.setAttribute('position', puntoMedioRR.x + ' ' + puntoMedioRR.y + ' ' + puntoMedioRR.z);

        var dirRR = new THREE.Vector3().subVectors(posR2, posR1).normalize();
        var ejeRR = new THREE.Vector3(0, 1, 0).cross(dirRR).normalize();
        var anguloRR = Math.acos(new THREE.Vector3(0, 1, 0).dot(dirRR));
        var rotacionRR = new THREE.Quaternion().setFromAxisAngle(ejeRR, anguloRR);
        cableRR.object3D.setRotationFromQuaternion(rotacionRR);

        this.el.appendChild(cableRR);
      }
    }
  }
});

