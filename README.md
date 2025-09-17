# TRABAJO-FIN-GRADO-SIMULADOR-REDES-VRXR-MIGUEL-CERDEÑO

#### Idea:
- Programa en el cual, al realizar una búsqueda en Internet, esta se descomponga con sus diferentes elementos (archivos, paquetes, pcs, routers, switches, etc.), probablemente usando Wireshark.
- Con esto se generará automáticamente un escenario en Netgui, el cual dará una primera imagen del esquema.
- Esto dará lugar, a su vez, a un escenario en A-FRAME, donde se podrán ver todos estos elementos y el flujo de paquetes en VR y XR.
- Servirá como un apoyo didáctico con explicaciones y detalles.

#### ???:
- Simular órdenes en tiempo real como un stream, una llamada, OTT, IPTV, ...

#### Apartados 1 y ?:
- En la pantalla principal aparecerá el escenario, con una barra simulando un navegador en la que se verá la url de la que se ha generado el mismo. Este se generará con un diseño similar al de netgui pero con un aspecto un poco más moderno, fondo azul claro, con los pc como portátiles, y los routers y switches con un diseño más adaptado a los actuales. Los cables, aunque de lejos parezcan planos, tendrán cuerpo, al igual que todos los demás elementos, que no serán simples bloques.
- Por otro lado, aparece la tabla de elementos, la cual consistirá de los tres bloques mencionados, con un botón para desplegar, al hacerlo, se podrán ver, por ejemplo, todos los pcs que forman la escena. En cada uno, habrá dos botones, uno de ubicación, el cual llevará al punto de vista de ese elemento; y otro de info, que dará todos los detalles necesarios para entender el funcionamiento de ese elemento, como podría ser el flujo que pasa por él, su ubicación o el papel que tiene dentro del escenario.
- Queda un último elemento, el minimapa, que será un canvas 2D, que servirá para ver el flujo de una forma más sencilla y práctica, pudiendo acercar y alejar la vista, con unos gráficos mas sencillos, además, tendrá opción de ajustar la velocidad de reproducción.


## 1. INICIO: Primer diseño de los PCs, Routers y Switches en el escenario principal.

#### ???:
- Diferentes diseños según los pc sean ordenadores, u otras cosas.
- Abrir y cerrar tapa pc para cuando lleguen paquetes.



Estas son mis notas rápidas sobre lo que hemos hablado, de cara a la
próxima reunión:

- Va a trabajar con los mensajes, con un modelo de tiempo virtual:
        - Componente mensaje que se configura con origen, destino,
tiempo_origan y tiempo_destino
        - Componente reloj, que se configura con una lista de tiempos
virtuales
        - Cada tiempo virtual es un evento lanzado por el reloj con el
tiempo correspondiente.
        - El mensaje reacciona a ese evento colocándose donde le toque
(si es posible con una animación)