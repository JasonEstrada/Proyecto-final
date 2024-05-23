require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Ruta para manejar las solicitudes de inicio de sesión
app.post('/login', (req, res) => {
  const { user, password } = req.body;

  // Verificar las credenciales del usuario en la base de datos
  connection.query('SELECT C.* FROM CLIENTES C inner join USUARIOS U ON C.usuario = U.usuario WHERE U.usuario = ? AND U.contrasena = ?', [user, password], (err, results) => {
    if (err) {
      console.error('Error al verificar las credenciales:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.send('no autorizado');
    }
  });
});

app.post('/register', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { name, surname, correo, telefono, direccion, ciudad, pais, user, password } = req.body;

  // Consulta para verificar si el usuario ya existe
  const checkUserQuery = "SELECT * FROM USUARIOS WHERE usuario = ?";
  connection.query(checkUserQuery, [user], (error, results) => {
      if (error) {
          console.error('Error al verificar el usuario:', error);
          res.status(500).send('Error interno del servidor');
          return;
      }

      if (results.length > 0) {
          // El usuario ya existe
          res.status(200).send('El usuario ya existe. Por favor, utilice otro.');
      } else {
          // El usuario no existe, proceder con la inserción
          const insertQuery = "INSERT INTO CLIENTES (desc_cliente, correo_electronico, telefono, direccion, ciudad, pais, usuario) VALUES (?, ?, ?, ?, ?, ?, ?); INSERT INTO USUARIOS (usuario, contrasena, tipo_usuario) VALUES (?, ?, 'cliente');";
          connection.query(insertQuery, [name+" "+surname, correo, telefono, direccion, ciudad, pais, user, user, password], (error, results, fields) => {
              if (error) {
                  console.error('Error al insertar datos en la base de datos:', error);
                  res.status(500).send('Error al registrar el usuario');
                  return;
              }
              console.log('Usuario registrado exitosamente');
              res.status(200).send('registrado');
          });
      }
  });
});


  // Ruta para obtener los productos
app.get('/productos', (req, res) => {
  // Consulta SQL para obtener todos los productos
  const query = 'SELECT * FROM PRODUCTOS where stock > 0';

  // Ejecutar la consulta SQL
  connection.query(query, (error, results, fields) => {
      if (error) {
          console.error('Error al ejecutar la consulta:', error);
          res.status(500).json({ error: 'Error al obtener los productos' });
          return;
      }

      // Enviar los productos como respuesta en formato JSON
      res.json(results);
  });
});

app.post('/crear-orden', (req, res) => {
  const { cliente, productos, total, direccionEnvio, metodoPago } = req.body;
  const estadoOrden = 'pendiente';
  const fechaOrden = new Date().toISOString().slice(0, 10);  // Formatear fecha para MySQL (YYYY-MM-DD)
  const fechaFactura = fechaOrden;

  // Iniciar la transacción
  connection.beginTransaction(error => {
      if (error) {
          console.error('Error al iniciar la transacción:', error);
          res.status(500).json({ error: 'Error al iniciar la transacción' });
          return;
      }

      // Crear la consulta SQL para insertar la orden principal
      let queryOrden = "INSERT INTO ORDENES_DE_PEDIDO (id_cliente, id_producto, fecha_orden, estado_orden, total, direccion_envio, cantidad) VALUES ?";
      let valuesOrden = productos.map(producto => [cliente, producto.id_producto, fechaOrden, estadoOrden, (producto.cantidad * producto.precio), direccionEnvio, producto.cantidad]);

      connection.query(queryOrden, [valuesOrden], (error, results) => {
          if (error) {
              return connection.rollback(() => {
                  console.error('Error al insertar la orden:', error);
                  res.status(500).json({ error: 'Error al crear la orden' });
              });
          }

          // Crear la consulta SQL para insertar la facturación
          let queryFactura = "INSERT INTO FACTURACION (fecha_factura, metodo_pago, total_facturado, id_cliente) VALUES (?, ?, ?, ?)";
          let valuesFactura = [fechaFactura, metodoPago, total, cliente];

          connection.query(queryFactura, valuesFactura, (error, results) => {
              if (error) {
                  return connection.rollback(() => {
                      console.error('Error al insertar la facturación:', error);
                      res.status(500).json({ error: 'Error al crear la facturación' });
                  });
              }

              // Crear la consulta SQL para actualizar el stock de los productos
              let queryStock = "UPDATE PRODUCTOS SET stock = stock - ? WHERE id_producto = ?";
              let valuesStock = productos.map(producto => [producto.cantidad, producto.id_producto]);

              // Ejecutar la actualización del stock para cada producto
              let stockUpdatePromises = valuesStock.map(([cantidad, id_producto]) => {
                  return new Promise((resolve, reject) => {
                      connection.query(queryStock, [cantidad, id_producto], (error, results) => {
                          if (error) {
                              return reject(error);
                          }
                          resolve(results);
                      });
                  });
              });

              // Esperar a que todas las actualizaciones de stock se completen
              Promise.all(stockUpdatePromises)
                  .then(() => {
                      // Confirmar la transacción
                      connection.commit(error => {
                          if (error) {
                              return connection.rollback(() => {
                                  console.error('Error al confirmar la transacción:', error);
                                  res.status(500).json({ error: 'Error al confirmar la transacción' });
                              });
                          }
                          res.status(200).json({ success: true });
                      });
                  })
                  .catch(error => {
                      connection.rollback(() => {
                          console.error('Error al actualizar el stock:', error);
                          res.status(500).json({ error: 'Error al actualizar el stock' });
                      });
                  });
          });
      });
  });
});


// Ruta para actualizar la información del cliente
app.post('/actualizar-cliente', (req, res) => {
  const { id_cliente, desc_cliente, correo_electronico, telefono, direccion, ciudad, pais } = req.body;

  // Consulta SQL para actualizar la información del cliente
  const query = `
      UPDATE CLIENTES SET 
          desc_cliente = ?, 
          correo_electronico = ?, 
          telefono = ?, 
          direccion = ?, 
          ciudad = ?, 
          pais = ? 
      WHERE id_cliente = ?`;

  connection.query(query, [desc_cliente, correo_electronico, telefono, direccion, ciudad, pais, id_cliente], (error, results) => {
      if (error) {
          console.error('Error al actualizar la información del cliente:', error);
          res.status(500).json({ error: 'Error al actualizar la información del cliente' });
          return;
      }
      res.status(200).json({ success: true });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js en funcionamiento en el puerto ${PORT}`);
});
