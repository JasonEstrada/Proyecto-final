document.addEventListener("DOMContentLoaded", function() {
    const dataCliente = JSON.parse(localStorage.getItem("data_cliente"));
    const btnSesion = document.getElementById("btnSesion");
    const sesionTexto = document.getElementById("sesionTexto");
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (dataCliente) {
        sesionTexto.textContent = "Cerrar sesión";
        btnCerrarSesion.addEventListener("click", function() {
            localStorage.removeItem("data_cliente");
            localStorage.removeItem("productos-en-carrito");
            window.location.href = "../login.html";
        });
    } else {
        sesionTexto.textContent = "Iniciar sesión";
        btnCerrarSesion.addEventListener("click", function() {
            window.location.href = "../login.html";
        });
    }
});
