document.addEventListener("DOMContentLoaded", function() {
    const dataCliente = JSON.parse(localStorage.getItem("data_cliente"));

    if (!dataCliente) {
        alert("Por favor, inicia sesión primero.");
        window.location.href = '../login.html'; // Redirigir a la página de inicio de sesión
        return;
    }

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const ciudadInput = document.getElementById("ciudad");
    const paisInput = document.getElementById("pais");
    const telefonoInput = document.getElementById("telefono");
    const direccionInput = document.getElementById("direccion");

    nombreInput.value = dataCliente.desc_cliente;
    emailInput.value = dataCliente.correo_electronico;
    ciudadInput.value = dataCliente.ciudad;
    paisInput.value = dataCliente.pais;
    telefonoInput.value = dataCliente.telefono;
    direccionInput.value = dataCliente.direccion;

    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault();

        const updatedCliente = {
            desc_cliente: nombreInput.value,
            correo_electronico: emailInput.value,
            ciudad: ciudadInput.value,
            pais: paisInput.value,
            telefono: telefonoInput.value,
            direccion: direccionInput.value
        };

        fetch('http://127.0.0.1:3000/actualizar-cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_cliente: dataCliente.id_cliente, ...updatedCliente })
        })
        .then(response => response.json())
        .then(data => {
            const mensaje = document.createElement('div');
            mensaje.classList.add('mensaje');
            if (data.success) {
                mensaje.classList.add('exito');
                mensaje.textContent = "Información actualizada correctamente.";
                // Actualizar el localStorage con los nuevos datos del cliente
                localStorage.setItem("data_cliente", JSON.stringify({ ...dataCliente, ...updatedCliente }));
            } else {
                mensaje.classList.add('error');
                mensaje.textContent = "Error al actualizar la información.";
            }
            document.querySelector(".container").appendChild(mensaje);
            // Hacer visible el mensaje
            mensaje.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
