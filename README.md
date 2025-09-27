# TRABAJO-FIN-GRADO-SIMULADOR-WIRESHARK-VRXR-MIGUEL-CERDEÑO

## Idea principal:
- Programa en el cual, al recibir una traza de Wireshark, esta se descomponga con sus diferentes elementos (archivos, paquetes, pcs, routers, switches, etc.), generando automáticamente un escenario en Netgui, el cual dará una primera imagen del esquema.
- Esto dará lugar, a su vez, a un escenario en A-FRAME, donde se podrán ver todos estos elementos y el flujo de paquetes en VR y XR. En este escenario se podrán usar varias de las funcionalidades del propio Wireshark, así como un control de reproducción.
- Servirá como un apoyo didáctico con explicaciones y detalles.

## ??:
- Diagrama de secuencia para los paquetes, cómo representarla, ¿Cómo en flow graph de Wireshark?.



## 1. Primer diseño de los PCs, Routers y Switches en el escenario principal.

- En la pantalla principal aparecerá el escenario, se generará con un diseño similar al de netgui pero con un aspecto un poco más moderno, fondo azul claro, con los pc como portátiles, y los routers y switches con un diseño más adaptado a los actuales. Los cables, aunque de lejos parezcan planos, tendrán cuerpo, al igual que todos los demás elementos, que no serán simples bloques.

#### ???:
- Tabla de elementos, la cual consistirá de los tres elementos principales del escenario, con un botón para desplegar, al hacerlo, se podrán ver, por ejemplo, todos los pcs que forman la escena. En cada uno, habrá dos botones, uno de ubicación, el cual llevará al punto de vista de ese elemento; y otro de info, que dará todos los detalles necesarios para entender el funcionamiento de ese elemento, como podría ser el flujo que pasa por él, su ubicación o el papel que tiene dentro del escenario.
- Minimapa, que será un canvas 2D, que servirá para ver el flujo de una forma más sencilla y práctica, pudiendo acercar y alejar la vista, con unos gráficos mas sencillos, además, tendrá opción de ajustar la velocidad de reproducción.
- Abrir y cerrar tapa pc para cuando lleguen paquetes.


## 2. Primer modelo mensajes y tiempo virtual.

- Los mensajes se generan sintéticamente (en el HTML) y el objetivo es que vayan de un punto a otro.
- Componente mensaje que se configura con origen destino, tiempo_origen y tiempo_destino.
- Componente reloj, que se configura con una lista de tiempos virtuales; cada tiempo virtual es un evento lanzado por el reloj con el tiempo correspondiente.
- El mensaje reacciona a ese evento colocándose donde le toque (si es posible con una animación) y dejando un rastro en las posiciones por las que ha pasado, cada "rastro" será un componente que deberá escuchar el componente click.
- Componente historia, donde se almacenarán la lista de tiempos, las posiciones, etc.
- Se debe poder usar el reproductor temporal así como la velocidad de reproducción o la marcha atrás.

#### ???:
- Los mensajes deben generarse (cuando no se haga sintéticamente) desde el principio o cuando les toque aparecer.
- Cilindros equiespaciados para el rastro, esferas, ... 
- Componente nuevo para el reproductor y slider
- Se puede arrastrar el deslizador en una escena VR