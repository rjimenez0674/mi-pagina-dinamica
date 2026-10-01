const express = require('express');
const db = require('../database.js');
const router = express.Router();
const bcrypt = require('bcrypt');



function requiereLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  next();
}


router.get('/', (req, res) => {
  res.render('inicio', { titulo: 'Mi Página Dinamica' });
});

router.get('/saludo', (req, res) => {
  const nombre = req.query.nombre || 'invitado';
  const hora = new Date().toLocaleTimeString();
  res.render('saludo', { nombre: nombre, hora: hora });
});

router.get('/usuarios', requiereLogin, (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, filas) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al obtener usuarios');
    }
    res.render('usuarios', { usuarios: filas });
  });
});

router.post('/usuarios', requiereLogin, (req, res) => {
  const { nombre, edad } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).send('El nombre es obligatorio');
  }
  if (!edad || isNaN(edad) || Number(edad) <= 0) {
    return res.status(400).send('La edad debe ser un número positivo');
  }

  db.run('INSERT INTO usuarios (nombre, edad) VALUES (?, ?)', [nombre, edad], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al agregar usuario');
    }
    res.redirect('/usuarios');
  });
});

router.post('/usuarios/eliminar/:id', requiereLogin, (req, res) => {
  const idAEliminar = req.params.id;
  db.run('DELETE FROM usuarios WHERE id = ?', [idAEliminar], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al eliminar usuario');
    }
    res.redirect('/usuarios');
  });
});

router.get('/usuarios/editar/:id', requiereLogin, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM usuarios WHERE id = ?', [id], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al buscar usuario');
    }
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.render('editar', { usuario: usuario });
  });
});

router.post('/usuarios/editar/:id', requiereLogin, (req, res) =>  {
  const id = req.params.id;
  const { nombre, edad } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).send('El nombre es obligatorio');
  }
  if (!edad || isNaN(edad) || Number(edad) <= 0) {
    return res.status(400).send('La edad debe ser un número positivo');
  }

  db.run('UPDATE usuarios SET nombre = ?, edad = ? WHERE id = ?', [nombre, edad, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al actualizar usuario');
    }
    res.redirect('/usuarios');
  });
});



router.get('/registro', (req, res) => {
  res.render('registro');
});

router.post('/registro', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || usuario.trim() === '') {
    return res.status(400).send('El usuario es obligatorio');
  }
  if (!password || password.length < 6) {
    return res.status(400).send('La contraseña debe tener al menos 6 caracteres');
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al encriptar la contraseña');
    }

    db.run('INSERT INTO cuentas (usuario, password) VALUES (?, ?)', [usuario, hash], (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).send('Ese usuario ya existe');
        }
        console.error(err);
        return res.status(500).send('Error al registrar usuario');
      }
      res.redirect('/login');
    });
  });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  db.get('SELECT * FROM cuentas WHERE usuario = ?', [usuario], (err, cuenta) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al buscar la cuenta');
    }
    if (!cuenta) {
      return res.status(401).send('DEBUG: no se encontró ese usuario en la tabla cuentas');
    }

    bcrypt.compare(password, cuenta.password, (err, coincide) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al verificar la contraseña');
      }
      if (!coincide) {
        return res.status(401).send('DEBUG: usuario encontrado pero la contraseña no coincide');
      }

      req.session.usuario = cuenta.usuario;
      res.redirect('/usuarios');
    });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
});

module.exports = router;