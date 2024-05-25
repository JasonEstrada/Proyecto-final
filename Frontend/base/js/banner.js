document.addEventListener("DOMContentLoaded", function() {
    const bannerContainer = document.getElementById("banner-container");

    bannerContainer.innerHTML = `
        <header class="header">
            <div class="logo" id="logo">
                <img src="./img/logo.png" alt="TuTienda">
            </div>
        <!-- 
            <div class="search-bar">
                <input type="text" placeholder="Buscar productos, marcas y más...">
                <button type="button"><i class="bi bi-search"></i></button>
            </div> 
        -->
            <div class="user-info" id="user-info">
                <!-- Contenido dinámico -->
            </div>
        </header>
    `;

    // Agregar evento de clic al logo
    const logo = document.getElementById("logo");
    logo.addEventListener("click", function() {
        window.location.href = "./index.html";
    });

    const dataCliente = JSON.parse(localStorage.getItem("data_cliente"));
    const userInfo = document.getElementById("user-info");

    if (dataCliente) {
        userInfo.innerHTML = `
            <span>Hola, ${dataCliente.desc_cliente}</span>
            <a href="#" id="logout">Cerrar sesión</a>
        `;

        document.getElementById("logout").addEventListener("click", function() {
            localStorage.removeItem("data_cliente");
            localStorage.removeItem("productos-en-carrito");
            window.location.href = "../login.html";
        });
    } else {
        userInfo.innerHTML = `
            <a href="../login.html">Iniciar sesión</a> 
            <a href="../register.html">Registrarse</a>
        `;
    }
});
