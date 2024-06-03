document.getElementById('checkout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const direccionEnvio = document.getElementById('direccion-envio').value;
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
    const numeroTarjeta = document.getElementById('numero-tarjeta').value;
    const fechaVencimiento = document.getElementById('fecha-vencimiento').value;
    const cvv = document.getElementById('cvv').value;

    // Obtener productos del carrito desde localStorage
    const productosEnCarrito = JSON.parse(localStorage.getItem('productos-en-carrito')) || [];

    // Calcular el total de la compra
    const total = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);

    // Crear objeto de la orden
    const orden = {
        cliente: localStorage.getItem("id_cliente"),  // Usar id_usuario del localStorage
        productos: productosEnCarrito,
        total: total,
        direccionEnvio: direccionEnvio,
        metodoPago: metodoPago,
        numeroTarjeta: numeroTarjeta,
        fechaVencimiento: fechaVencimiento,
        cvv: cvv
    };

    console.log(orden);

    // Enviar la orden al servidor
    fetch(`${config.apiBaseUrl}/crear-orden`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orden)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Limpiar el carrito y redirigir al usuario
            localStorage.removeItem('productos-en-carrito');
            window.location.href = 'index.html';
        } else {
            alert('Error al crear la orden');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
