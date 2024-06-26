// login.js
async function login(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    var user = document.getElementById('userid').value;
    var password = document.getElementById('passwordid').value;

    var invalido = document.getElementById('invalido');
    invalido.textContent = "";

    if (user === '' || password === '') {
        invalido.textContent = "Campos requeridos";
        return;
    }

    // Realizar la solicitud HTTP POST al servidor
    fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: user, password: password })
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Error en la solicitud');
    })
    .then(data => {
        if (data === 'no autorizado') {
            invalido.textContent = "Usuario o contraseña incorrecto";
        } else {
            localStorage.removeItem('id_cliente');
            localStorage.removeItem('data_cliente');
            localStorage.removeItem('productos-en-carrito');
            localStorage.setItem('data_cliente', JSON.stringify(JSON.parse(data)));
            localStorage.setItem('id_cliente', JSON.stringify(JSON.parse(data).id_cliente));
            window.location.href = "index.html";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// register.js
async function register() {
    // Obtener los valores del formulario
    var name = document.getElementById('name1id').value;
    var surname = document.getElementById('surname1id').value;
    var correo = document.getElementById('correoid').value;
    var telefono = document.getElementById('telefonoid').value;
    var direccion = document.getElementById('direccionid').value;
    var ciudad = document.getElementById('ciudadid').value;
    var pais = document.getElementById('paisid').value;
    var user = document.getElementById('userid').value;
    var password = document.getElementById('passwordid').value;

    var invalido = document.getElementById('invalido');
    invalido.textContent = "";

    if (name === '' || surname === '' || correo === '' || telefono === '' || direccion === '' || ciudad === '' || pais === '' || user === '' || password === '') {
        invalido.textContent = "Campos requeridos";
        return;
    }

    // Realizar la solicitud HTTP POST al servidor
    fetch(`${config.apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            surname: surname,
            correo: correo,
            telefono: telefono,
            direccion: direccion,
            ciudad: ciudad,
            pais: pais,
            user: user,
            password: password
        })
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Error en la solicitud');
    })
    .then(data => {
        if (data === 'registrado') {
            window.location.href = 'login.html';
        } else {
            invalido.textContent = data;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}
