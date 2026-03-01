# TFG-SIMULADOR DE REDES DE ORDENADORES EN XR-MIGUEL CERDEÑO

## Links
- Repositorio Github: https://github.com/mcerdeno2021/SIMULADOR-REDES-ORDENADORES-XR
- Github Pages: https://mcerdeno2021.github.io/SIMULADOR-REDES-ORDENADORES-XR/

## Idea principal:
- Programa que diseñará un escenario en A-FRAME al recibir una traza de Wireshark, que se descomponga con sus diferentes elementos (paquetes, pcs, routers, switches, etc.), generando automáticamente un escenario similar al que puede haber en softwares como Netgui.
- En el escenario se podrán ver todos estos elementos y el flujo de paquetes en VR y XR. A su vez, se podrán usar varias de las funcionalidades extraídas del software "Wireshark", así como un control de reproducción o un diagrama de secuencia de los paquetes.
- Servirá como un apoyo didáctico con explicaciones y detalles.

#### Uso con diferentes ordenadores
git reset --hard origin/main -> borrar cambios en local y volver al último commit (necesario si hay cambios y quieres hacer pull)
git pull origin main -> traer lo que se ha hecho con un push antes, a este ordenador (refrescar el git en el ordenador).

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

## 4. Modelo mensajes, tiempo virtual e historia con JSON.

- Ahora los mensajes no se despliegan desde el index, sino que se utiliza un archivo JSON en el que se definen y que se reciben y se cargan en historia.
- A la hora de dividir los movimientos que realicen los mensajes, estos ajustarán su posición al tiempo de los ticks mediante interpolación lineal.
- El tiempo lo maneja al completo el reloj, manejando los eventos (pausa, retroceder, etc.) dentro del componente.
- Para las posiciones se usarán los elementos de red de la topología (switches, routers, etc.) con su id, estos elementos también se pueden definir en un JSON diferente.
- Estructurar un código más limpio y eficiente.

#### ???:
- Capturar interfaces necesarias de toda la topologia; si solo se captura una, no se tendrá el contexto completo de los paquetes, solo entrada o salida.
- Reloj continuo o discreto y entender bien cómo funciona cada uno. Su precisión también.
- Mensajes cuando no se tienen en cuenta (fuera de su rango de movimiento).
- Vista cenital, minimapa.
- Dos modos: en uno recibe directamente una traza y la convierte en escenario y su flujo; en el otro tú creas un escenario, solo para ping y traceroute.
- Representación visual flujo paquetes (para que sea facil de ver).
- Tener un wireshark a un lateral en el que puedas seleccionar un paquete y se vea, filtrar, etc.
- Huellas hijas de su mensaje.
- Aspecto como en Apartado 1 o más simplista.
- Tabla estilo Wireshark, con información de la topologia y paquetes.
- Cartel identificador encima de cada elemento.
- Como representar el flujo para que no se superpongan los mensaje sy se diferencien en el tiempo (parabolas cada vez mas altas, eje y para tiempo como otro trabajo, canales paralelos entre nodos como una carretera, cada nodo tiene una pila como estanterias de las que van saliendo cada paquete una para llegada y otroa para salida, cad allegada deja ciruclos concentricos que pueden depender su diametro de llegada etc).
- Scrum/agile para memoria.

## 5. Modelo estructura de datos eficiente, funciones, trazas, intervalos y Python

- Mejora de estructura de datos y eficiencia.
- La entidad mensaje se tiene que crear en el componente mensaje y solo una vez, y se va moviendo.
- No es eficiente que el tick lo escuchen todos cuando solo unos pocos se van a mover, por eso (pudiendo mantener la lista this.historias) se deben crear dos diccionarios, uno que tenga en su clave el momento de inicio del mensaje y otro con el final; con esto, el componente verá entre que momentos el mensaje está activo. 
- Aparte de esta, habrá otro diccionario, que tenga cada instante de tiempo como clave, con los mensajes que hay activos en ese momento. Se crea con una función que use los otro dos diccionarios anteriores.
- Se crearán 4 funciones, 3 de ellas recibirán como parametros de entrada los tiempos, y una será para cuando los paquetes se creen, otra para cuando se mueven y otra cuando desaparecen. La cuarta funcionará para calcular con interpolación las posiciones a las que les toca moverse a los paquetes.
- Estas cuatro funciones una vez estén listas se pueden manejar como una sola.
- En el programa debería plantearse que ir a cualquier instante de tiempo es el caso general, mientras que avanzar o ir marcha atrás sería un caso particular; es decir, que no se calculan las cosas como pensando en un recorrido, sino que cada momento está yendo a un punto concreto en el tiempo.
- El listener de los paquetes en mensaje, debe escuchar solo a que posición se mueven.
- Script de Python para generar paquetes automáticamente en el JSON.
- Prueba de estrés, que consiste en generar muchos paquetes y probar cuál es el límite del programa en el que empieza a tener problemas de rendimiento.
- La huella debería ser solo una entidad, siendo un cilindro que se va alargando o encogiendo según la trayectoria.
- Controlador de tiempo.
- Para ver la variable temporal se usa el eje Y; se pueden hacer cuadrículas para marcar mejor el tiempo.
- Ir viendo cómo generar trazas (netgui o con tcpdump); de momento no preocuparse por ver si es el mismo mensaje el que entra en un lado y sale de otro. Descartar mensajes que sean el mismo al escuchar en varias interfaces. De momento nivel wifi, ethernet. Libcap para usar en Python.
- Definir variable precisión para crear los intervalos de tiempo.

## 6. Modelo estructura de datos eficiente y Primer modelo interfaz en XR

- Continuación de la estructura de datos eficiente.
- Se mantendrá un solo diccionario, que tenga cada instante de tiempo como clave, con una referencia a los componentes mensajes que hay activos en ese momento.
- Las 4 funciones pueden funcionar como una sola
- La clave del programa es que cualquier instante de tiempo es el caso general, esto reduce eficiencia, pero hace más fácil dirigirse a cualquier instante de tiempo.
- Hacer la prueba de estrés, sin embargo, esta vez hay que comprobar cuántos paquetes al mismo tiempo es capaz de soportar el programa sin sobrecargarse.
- Comprobar que el controlador de tiempo no desplaza la escena al usarlo usando las gafas.
- La variable temporal está al revés, los paquetes siempre deben estar sobre los cables en la topología, son las huellas las que siguen ese recorrido siendo las más altas las más recientes.
- Ir viendo cómo generar trazas (netgui o con tcpdump); de momento no preocuparse por ver si es el mismo mensaje el que entra en un lado y sale de otro. Descartar mensajes que sean el mismo al escuchar en varias interfaces. De momento nivel wifi, ethernet. Libcap para usar en Python.
- Creación de una primera interfaz del programa en XR que permita ver con claridad y sencillez el flujo de paquetes.
- En el suelo, con una vista de planta, el escenario, pudiendo ver así clara la topología de la escena.
- Por otro lado, a la altura de los ojos, rodeando a la persona, habría distintas ventanas, translúcidas, cada una representando una conexión (R1-PC2, por ej.); al pulsar sobre alguna, esta se volverá opaca, y permitirá ver el diagrama de tiempo vertical de huellas del que se hablaba antes.

## 7. Paneles inter-nodos y huellas

- Se van a usar paneles entre nodos, tanto para las huellas y su representación del eje temporal como para la interacción del usuario.
- Estos paneles hay que imaginarlos como cristales, sin grosor, invisibles, que ocupan todo el ancho de la conexión y se ubican sobre el cable. Estos irán creciendo a lo alto con el paso del tiempo, y tendrán unos bordes visibles, que serán los ejes verticales sobre cada elemento.
- Las huellas serán hijas del panel que hay en su conexión, por lo que, a medida que este va creciendo, las huellas subirán con él. Para esto, cuando se cree una huella, se creará a ras de cable, pero el panel y la huella irán creciendo en altura simultáneamente (se pueden hacer cálculos fáciles para ir viendo la posición e incluso se puede jugar con la posición global (la que tiene en la escena) y la local (la que tiene respecto al padre)).
- En cuanto a la interación con el usuario, estos funcionarán como lo hacían las ventanas que se plantearon en el apartado anterior, con la diferencia de que estas ya tienen directamente la vista de la conexión sobre ellas y, al pulsarlas, la idea sería que aislasen esa conexión del resto de la escena (se podría pulsar más de una conexión y tener visibles solo esas).
- Para la gestión de los paquetes, es importante recordar que cualquier instante de tiempo es el caso general; para ello, no solo se tiene en cuenta el paquete que viene, si no el que está en el momento del cambio. Esto es importante porque usando los estados podría haber problemas con los cambios temporales.
- Hay que ir pensando que el usuario debe ser capaz de, mediante sus controladores o manos, hacer zoom, pellizcar la escena y rotarla para verla a su gusto, etc.

## 8. Paneles inter-nodos, huellas y control de reproducción temporal

- En cuanto a la gestión del manejo del tiempo de las huellas y, por ende, de los paneles, hay dos soluciones: 
    · Una más sencilla, que sería que los paneles fueran como una imagen fija, es decir, que cuando vas marcha atrás en el tiempo, las huellas que corresponde se hundan junto con el panel, dando la sensación así de que se eliminan, y cuando, por ejemplo, adelantas a un momento concreto, se dibujen todas las huellas, como si se desplegase hacia arriba el panel. Esto se harí mediante cálculos de la distancia respecto al centro del panel con el suelo, y con una lista de las huellas que hay, que, sabiendo ese dato, cortaríamos en un punto.
    · La otra es más compleja, sobre todo en un nivel de eficiencia; esta haría algo similar a lo que se hace con los mensajes en historia, es decir, guardar un diccionario en el que la clave sea el instante de tiempo, y los valores sean las huellas que tendrían que estar activas.
- Para disminuir la complejidad, es posible limitar el control de reproducción a avances o retrasos de x en x tiempo, no saltos temporales abruptos, esto haría que fuera suficiente con tener almacenado el momento anterior y posterior (en lo referente a las huellas también).
- Sería interesante, pensando principalmente en la eficiencia, decidir si seguir trabajando con esferas como huellas, o si intentar usar un único cilindro que represente el camino que sigue el paquete, para hacer esto, hay que pensar que el ángulo que tiene el cilindro respecto al suelo es siempre el mismo.
- Mensajes entre PCs y que pasen por los demás elementos o aleatorios totalmente.
- Es necesario decidir ya en qué se va a enfocar el proyecto en el tiempo que queda:
    · Lo primero, la convocatoria objetivo para presentar es la de junio, por lo que en mayo ya tendría que estar totalmente finalizado; en el caso de no llegar, hay una convocatoria en julio (no arriesgar).
    · Depende mucho de cada persona y su habilidad para redactar la memoria, pero, por lo general, se tarda alrededor de un mes y algo en hacerla completa.
    · Se puede ir empezando con las partes que ya son fijas y definitivas (herramientas, intro, etc.) además de los sprints ya hechos.
    · Estaría bien ir teniendo una versión presentable, y que se pueda seguir avanzando pero, en caso de ir con prisas, tener eso como seguro.
    · Por eso, visto todo esto, en qué se puede enfocar (puede enfocarse en más de una, no en todas):
        · Interactividad del usuario con las gafas y mandos.
        · Eficiencia y mucha escalabilidad.
        · Usar trazas reales de una topología con netgui, diferenciar distintos niveles (capa física, de aplicación, etc.), que se distinga que un paquete que entra por un lado y sale por el otro es el mismo.
        · Apariencia.
        · Tiempo real.
        · ...

## 9. Export de escenarios y captura de trazas con Netgui

- Crear los escenarios y sus topologías con Netgui, se pueden exportar mediante ficheros nkp, en los que estarán los nodos, sus posiciones y las conexiones entre ellos.
- Además, usarlo para lanzar los comandos que se quiera y capturar el tráfico con Wireshark (se puede hacer tcpdump). Para usarlo en el programa existen varios métodos:
    · Se puede modificar los js para que el formato de wireshark se pegue directo.
    · Crear un traductor (recomendado):
        · Hay librerias de Wireshark para python que son útiles para manejar la traza resultante.
        · Por otro lado, el fichero de Wireshark se puede exportar como un json y usar parecido a lo que se hace ahora.
- Ahora los paquetes tienen un tiempo de inicio en un punto y otro de fin en otro lado; en la realidad con Wireshark, lo que se captura es el instante en el que un paquete ha pasado por un nodo en el que estamos capturando el tráfico. Hay que elegir entonces entre:
    · Capturar solo en nodos que no esten conectados entre sí, ya que se si un mismo paquete entra de un lado y sale de otro estaría repetido. Con esta implementación no sabríamos lo que tarda en capturar el siguiente nodo dicho paquete (habría que darle un tiempo random de trayecto, que sería igual para todos los paquetes) ni el sentido hacia el que va.
    · Implementar una forma de diferenciar los paquetes, así se podría capturar en todos los nodos y se identificaría que paquete es el mismo, pudiendo además ver el sentido que sigue el paquete así como el tiempo que pasa entre un nodo y otro.
- Es posible una implementación a tiempo real de netgui haciendo que el formato se pegue directo (investigar más adelante).

#### ???:
- Qué hace falta para usar el traductor de wireshark?? pip install, tshark??
- Entender bien el concepto de cómo introducir las cap de wireshark.
    Se captura desde los terminales de netgui con tcpdump? se usa una que ya exista?
- Despueś de responder eso, cómo funcionaba lo de que se pegara en el formato necesario en tiempo real la captura en el script.
- Cuánta info sacar de la cap de Wireshark.
- Pasar de las capas 1, 2, 3 y 4 del modelo OSI a más altas, qué cambiaría.
- Cómo hacer la memoria (qué web usar, consejos, ...).

## 10. Export de escenarios y captura de trazas con Netgui (I)

- Una solución sencilla es exportar las capturas como json (quizá peor para pegar directo).
- La otra opción es usar pyshark, docu: https://github.com/KimiNewt/pyshark/
    Con esto se puede hacer un parsing de paquetes de Wireshark.
    También se puede hacer una lectura del fichero en tiempo real.
    Y escuchar un servidor remoto.
- Siguiendo esta última opción, el programa se podría montar en un servidor web y escuchar en directo los cambios.
- En cuanto a la info que usar de los paquetes, el objetivo final sería tener un Wireshark dentro del propio programa, pudiendo interactuar con los paquetes y ver todos los niveles de información.
- Comenzar la memoria con la documentación en el correo que ha mandado Jesús.

#### ???:
- Cómo se va a usar el proyecto (y presentar):
    - Desplegado en un servidor.
    - En un enlace en la web.
    - Con el repo clonado.
    Según la opción hay que decidir cómo se gestiona el import de pyshark (requirements para instalar con un venv, web con backend).
- Hay que leer más de un pcap (uno por cada elemento e interfaz).
- En Netgui hay que configurar los routers.
- Para relacionar IPs de la cap y nkp:
    - Definir la relación en el conversor de antemano.
    - Opción automática (detectar qué IP solo aparece en un extremo → probablemente PC?).
- Solo hay origen, destino y momento en el que pasa se captura el paquete, cómo puedo relacionarlo para mostrarlo.

## 11. Export de escenarios y captura de trazas con Netgui (II)

- No hay problema por tener más de una captura (aunque para una prueba de concepto valdría con usar un solo router entre dos pcs y capturar con any), pero hay que tener en cuenta que habría que relacionar todas las capturas para saber que paquetes corresponden con otros, borrar repetidos, etc.
    Hay que tener en cuenta también para esto que los tiempos de entrada en un lado y de salida en otro no van a coincidir por completo.
    De momento para la prueba de concepto es viable poner el timestamp que se captura en la traza y añadirle un tiempo x que es lo que tardará en llegar.
- En cuanto a la relación entre los datos de Netgui y las trazas:
    - Para las pruebas de concepto es viable escribir manualmente la relación IP - Nombre Netgui.
    - Es posible desde Netgui sacar también la IP (Eva, Pedro?).
- El objetivo ideal sería:
    - Mediante websockets mantener una conexión cliente - servidor, esta será a tiempo real, escuchando todas las peticiones necesarias.
    1. El cliente inicia en una web donde elige el escenario (entre varias posibilidades o generándolo a mano?).
    2. Una vez definido eso, mediante unos scripts, se obtendrá el nkp y el socket se quedará escuchando.
    3. El cliente podrá ver en XR el escenario y con un script que pueda conectarse con Netgui se ejecutarán en los terminales de cada equipo los comandos necesarios (entre ellos las capturas a realizar, sacar las IPs, incluso el ping, por ej.).
- Definir hacia qué lado avanzar (hacer lo más parecido a un wireshark interactivo, el objetivo en un servidor que he puesto, ...).

# 12. Export con Netgui/Kathará

- Lo primero es que el formato de exportado de los paquetes funcione.
- El objetivo no será con tiempo real:
    La idea sería que se desplegase un servidor web como hace live server, que serviria el html con la realidad aumentada (vale igual el servidor de una línea de python).
    Este servidor estará pegado a netgui (esto puedo más adelante ser más profesional, de momento con que reciba los ficheros) y deje los ficheros que genera en un sitio en el que al programa le sirva.
    Una vez funcionase cada segundo (por ej.) se volvería a reconectar al fichero y vería si ha cambiado y pondría un icono para indicar que hay novedades.
        Esto recargaría solo ese fichero no toda la escena, sin tener que salir de la escena y volver a entrar.
            En un ejemplo de ping que se haga cada cinco segundos, cuando vaya actualizando tendré otro ping, por ej.
- Para la información se puede:
    Leer en un panel que va pegado con el paquete.
    Usar un panel como wireshark.
    Usar como referencia para los temas visuales -> https://pheras.gitlab.io/wirexrk/demos/ping/
- Sobre Netgui/Kathará
    Tiene la función "start pcap"/"stop pcap"
        Se usa eso para cada captura.
    Usa los dominios de colisión.
        Es donde el paquete es el mismo.
        Genera cada captura con dominiocolision.pcap en cada uno.
    En la carpeta donde he lanzado el escenario se crea una caperta shared y se guardan las captura ahí.
        En el domain.conf se puede ver a q dominio pertecene cada elemento.
    Las capturas dominio"c" son las capturas en la que se comenta en cada paquete con todas las relaciones.
    Con all_c se hace un merge donde estan también los comentarios (también se ha visto como merged_capture).
        Aparece además de como pcap como json (se usa pyshark).
    machineNames.json genera todas los relaciones IP, links, ... Lo que es la topología.
- Sería útil representar los diagramas de TCP.
- Necesario usar el componente lookat en la mayoria de elementos, carteles, ¿topología?.