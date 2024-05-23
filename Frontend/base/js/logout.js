document.getElementById('btn-cerrar-sesion').addEventListener('click', function() {
    // Limpiar el localStorage
    localStorage.removeItem('id_cliente');
    localStorage.removeItem('data_cliente');
    localStorage.removeItem('productos-en-carrito');

    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = '../login.html';
});
