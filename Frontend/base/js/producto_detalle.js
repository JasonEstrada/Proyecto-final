let calificacion = 0;


document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const idProducto = params.get('id');
    const dataCliente = JSON.parse(localStorage.getItem("data_cliente"));

    if (idProducto) {
        fetch(`http://127.0.0.1:3000/productos/${idProducto}`)
            .then(response => response.json())
            .then(producto => {
                document.getElementById('detalle-imagen').src = producto.imagen;
                document.getElementById('detalle-nombre').textContent = producto.nombre;
                document.getElementById('detalle-precio').textContent = `$${producto.precio}`;
                document.getElementById('detalle-descripcion').textContent = producto.descripcion;
                document.getElementById('detalle-categoria').textContent = producto.categoria;
                document.getElementById('detalle-stock').textContent = producto.stock;
                document.getElementById('detalle-proveedor').textContent = producto.proveedor;

                // Añadir evento al botón "Agregar al carrito"
                const botonAgregarAlCarrito = document.getElementById('agregar-al-carrito');
                botonAgregarAlCarrito.addEventListener('click', () => {
                    agregarAlCarrito(producto);
                });

                // Cargar reseñas
                cargarResenas(idProducto);
            })
            .catch(error => {
                console.error('Error al cargar los detalles del producto:', error);
            });
    } else {
        console.error('No se ha especificado un ID de producto.');
    }

    // Lógica para manejar el envío de reseñas
    const resenaForm = document.getElementById('resena-form');
    resenaForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const rating = document.querySelector('.rating span.selected')?.dataset.value;
        const comentario = document.getElementById('comentario').value;

        if (rating && comentario && dataCliente) {
            const nuevaResena = {
                id_producto: idProducto,
                id_cliente: dataCliente.id_cliente,
                calificacion: calificacion,
                comentario: comentario
            };

            // Enviar la reseña al servidor
            fetch('http://127.0.0.1:3000/resenas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevaResena)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    agregarResenaAlDOM(nuevaResena, dataCliente.desc_cliente, new Date().toISOString().slice(0, 10));
                    resenaForm.reset();
                    resetearEstrellasSubmit();
                    calificacion = 0;
                } else {
                    console.error('Error al enviar la reseña:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al enviar la reseña:', error);
            });
        }
    });

    // Lógica para manejar las estrellas de calificación
    const estrellas = document.querySelectorAll('.rating span');

    // Añade el evento mouseover a cada estrella
    estrellas.forEach(estrella => {
        estrella.addEventListener('mouseover', function() {
            resetearEstrellas();  // Resetea las estrellas antes de añadir el color
            this.classList.add('hover');  // Añade la clase 'hover' a la estrella actual
            let prevSibling = this.previousElementSibling;
            while (prevSibling) {
                prevSibling.classList.add('hover');  // Añade la clase 'hover' a todas las estrellas anteriores
                prevSibling = prevSibling.previousElementSibling;
            }
        });

        // Añade el evento mouseout a cada estrella
        estrella.addEventListener('mouseout', function() {
            resetearEstrellas();  // Resetea las estrellas cuando el mouse sale de ellas
        });

        // Añade el evento click a cada estrella
        estrella.addEventListener('click', function() {
            estrellas.forEach(e => e.classList.remove('selected'));  // Elimina la clase 'selected' de todas las estrellas
            this.classList.add('selected');  // Añade la clase 'selected' a la estrella actual
            calificacion = document.querySelector('.rating span.selected')?.dataset.value;
            let prevSibling = this.previousElementSibling;
            while (prevSibling) {
                prevSibling.classList.add('selected');  // Añade la clase 'selected' a todas las estrellas anteriores
                prevSibling = prevSibling.previousElementSibling;
            }

        });


    });

    

    // Función para resetear las estrellas eliminando las clases 'hover' y 'selected'
    function resetearEstrellas() {
        estrellas.forEach(e => e.classList.remove('hover'));
        //estrellas.forEach(e => e.classList.remove('selected'));
    }
    function resetearEstrellasSubmit() {
        estrellas.forEach(e => e.classList.remove('hover'));
        estrellas.forEach(e => e.classList.remove('selected'));
    }
});



function agregarAlCarrito(producto) {
    let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

    const index = productosEnCarrito.findIndex(p => p.id_producto === producto.id_producto);
    if (index !== -1) {
        productosEnCarrito[index].cantidad++;
    } else {
        producto.cantidad = 1;
        productosEnCarrito.push(producto);
    }

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    mostrarMensajeProductoAgregado();
}

function mostrarMensajeProductoAgregado() {
    const mensajeProductoAgregado = document.createElement('div');
    mensajeProductoAgregado.textContent = "Producto agregado al carrito";
    mensajeProductoAgregado.className = "producto-agregado-mensaje";
    document.body.appendChild(mensajeProductoAgregado);

    setTimeout(() => {
        mensajeProductoAgregado.remove();
    }, 3000);
}

function cargarResenas(idProducto) {
    fetch(`http://127.0.0.1:3000/resenas/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.resenas.forEach(resena => {
                    const fechaFormateada = new Date(resena.fecha_resena).toISOString().slice(0, 10);
                    agregarResenaAlDOM(resena, resena.desc_cliente, fechaFormateada);
                });
            } else {
                console.error('Error al obtener las reseñas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al obtener las reseñas:', error);
        });
}

function agregarResenaAlDOM(resena, desc_cliente, fecha_resena) {
    const resenasLista = document.getElementById('resenas-lista');

    const resenaDiv = document.createElement('div');
    resenaDiv.className = 'resena';
    resenaDiv.innerHTML = `
        <div class="resena-rating">${generarEstrellas(resena.calificacion)}</div>
        <p><strong>${desc_cliente}</strong> - ${fecha_resena}</p>
        <p>${resena.comentario}</p>
    `;
    resenasLista.appendChild(resenaDiv);
}

function generarEstrellas(rating) {
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<span class="estrella${i <= rating ? '-filled" style="color: #ffcc00"' : ''}">&#9733;</span>`;
    }
    return estrellasHTML;
}
