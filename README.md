# TFG-SIMULADOR DE REDES DE ORDENADORES EN XR-MIGUEL CERDEÑO

## Links
- Repositorio Github: https://github.com/mcerdeno2021/SIMULADOR-REDES-ORDENADORES-XR
- Github Pages: https://mcerdeno2021.github.io/SIMULADOR-REDES-ORDENADORES-XR/

## Idea principal:
- Programa que diseñará un escenario en A-FRAME al recibir una traza de Wireshark, que se descomponga con sus diferentes elementos (archivos, paquetes, pcs, routers, switches, etc.), generando automáticamente un escenario similar al que puede haber en softwares como Netgui.
- En el escenario se podrán ver todos estos elementos y el flujo de paquetes en VR y XR. A su vez, se podrán usar varias de las funcionalidades extraídas del software "Wireshark", así como un control de reproducción y un diagrama de secuencia de los paquetes.
- Servirá como un apoyo didáctico con explicaciones y detalles.


## 1. Primer diseño de los PCs, Routers y Switches en el escenario principal.

- En la pantalla principal aparecerá el escenario, se generará con un diseño similar al de netgui pero con un aspecto más moderno, fondo azul claro, con los pc como portátiles, y los routers y switches con un diseño más adaptado a los actuales. Los cables, aunque de lejos parezcan planos, tendrán cuerpo, al igual que todos los demás elementos, que no serán simples bloques.

#### ???:
- Los elementos ocupan demasiado al ser más complejos en lugar de un solo bloque.
- Interfaz Netgui.
- Tabla de elementos, la cual consistirá de los tres elementos principales del escenario, con un botón para desplegar, al hacerlo, se podrán ver, por ejemplo, todos los pcs que forman la escena. En cada uno, habrá dos botones, uno de ubicación, el cual llevará al punto de vista de ese elemento; y otro de info, que dará todos los detalles necesarios para entender el funcionamiento de ese elemento, como podría ser el flujo que pasa por él, su ubicación o el papel que tiene dentro del escenario.
- Minimapa, que será un canvas 2D, que servirá para ver el flujo de una forma más sencilla y práctica, pudiendo acercar y alejar la vista, con unos gráficos mas sencillos, además, tendrá opción de ajustar la velocidad de reproducción.
- Abrir y cerrar tapa pc cuando lleguen paquetes.


## 2. Primer modelo mensajes y tiempo virtual.

- Los mensajes se generan sintéticamente (en el HTML) y el objetivo es que vayan de un punto a otro.
- Componente mensaje que se configura con origen, destino, tiempo_origen y tiempo_destino.
- Componente reloj, que se configura con una lista de tiempos virtuales; cada tiempo virtual es un evento lanzado por el reloj con el tiempo correspondiente.
- El mensaje reacciona a ese evento colocándose donde le toque (si es posible con una animación) y dejando un rastro en las posiciones por las que ha pasado, cada "rastro" será un componente que deberá escuchar el componente click.
- Componente historia, donde se almacenarán la lista de tiempos, las posiciones, etc.
- Se debe poder usar el reproductor temporal así como la velocidad de reproducción o la marcha atrás.

#### ???:
- Los mensajes deben generarse (cuando no se haga sintéticamente) desde el principio o cuando les toque aparecer.
- Cilindros equiespaciados para el rastro, esferas, ... 
- Componente nuevo para el reproductor y slider.
- Se puede arrastrar el deslizador en una escena VR.


## 3. Modelo mensajes, tiempo virtual e historia.

- Implementación mejorada del anterior apartado.
- Siguen siendo 3 componentes, mensaje, reloj e historia; se deberían hacer por separado y haciendo programas de prueba para testear cada uno.
- Los paquetes en el componente mensaje tendrán unos parámetros de entrada: posicionOrigen, posicionDestino, tiempoOrigen y tiempoDestino. Cuando se trabaje con nodos es posible que los parámetros de entrada de posicion sean IDs de elementos del escenario. Este componente recibirá de historia las acciones correspondientes al tick de reloj actual y las ejecutará (creándolo, haciéndolo desaparecer, moviéndolo, parándolo, etc.).
- En el componente historia se recibirán todos los datos de los paquetes, y se crearán las listas y objetos js correspondientes; una vez se reciba cada ciclo de reloj se seguirán los mismos pasos (mirar las listas y ver si hay que quitar paquetes que ya llegaron a su destino, ver si hay que añadir paquetes que estén en el ciclo que toca, comprobar todos los paquetes a los que les toca moverse y seguir almacenando los nuevos moviemientos). Tras tener toda esta información sobre el ciclo de reloj que viene, se la enviará al componente mensaje.
- Por último, el componente reloj, podrá funcionar de dos maneras diferentes, trabajando con tiempos discretos (ejemplo de la historia año a año) en el que el reloj solo enviaría un tick cada "año" que pasase, que se correspondería con x tiempo en la realidad; o continuos, siendo más realista y adaptado a lo que sería trabajar con trazas de Wireshark, en las que, al no salir los paquetes al mismo tiempo (a veces con diferencias de microsegundos), se lanzarían ticks, constantemente, y sería el propio componente historia al recibirlos quien viera si corresponden a alguna acción o si se descartan. En cualquiera de los dos casos, sería el reloj quien manejase las funciones de parar, seguir, ir hacia adelante, ir hacia atrás, ir a cualquier punto temporal, etc. Esto lo haría valiéndose de las listas con tiempos que tiene.

### Extras:
Para sincronizar dos ordenadores distintos: 
- git pull origin main -> en el que no se ha hecho el push para traer lo nuevo del repo al local.
- git reset --hard origin/main -> si había modificaciones en el local y no deja traer lo nuevo del repo.