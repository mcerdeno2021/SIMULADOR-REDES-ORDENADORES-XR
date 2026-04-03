let escenarioSeleccionado = null

// cargar escenarios
fetch("/escenarios")
    .then(res => res.json())
    .then(data => {

        const lista = document.getElementById("lista")

        data.forEach(nombre => {

            const li = document.createElement("li")
            const btn = document.createElement("button")

            btn.innerText = nombre

            btn.onclick = () => seleccionar(nombre)

            li.appendChild(btn)
            lista.appendChild(li)
        })
    })


function seleccionar(nombre) {

    if (escenarioSeleccionado === nombre) return // 🔥 evita spam

    fetch("/seleccionar?nombre=" + nombre)

    escenarioSeleccionado = nombre

    document.getElementById("seleccionado").innerText =
        "Escenario elegido: " + nombre
}


// iniciar simulación
function iniciar() {

    if (!escenarioSeleccionado) {
        alert("Selecciona un escenario primero")
        return
    }

    // 🔥 redirigir al A-Frame pasando el escenario
    window.location.href = "aframe/index.html?escenario=" + escenarioSeleccionado
}


// actualizar datos
function actualizar() {

    setInterval(() => {

        fetch("/estado")
            .then(res => res.json())
            .then(data => {

                const box = document.getElementById("box")

                if (data.paquetes.length % 2 === 0) {
                    box.setAttribute("color", "red")
                } else {
                    box.setAttribute("color", "green")
                }

            })

    }, 1000)
}