const express = require('express');
const db = require('../database.js');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inicio', { titulo: 'Mi Página Dinamica' });
});

router.get('/saludo', (req, res) => {
  const nombre = req.query.nombre || 'invitado';
  const hora = new Date().toLocaleTimeString();
  res.render('saludo', { nombre: nombre, hora: hora });
});

router.get('/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, filas) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al obtener usuarios');
    }
    res.render('usuarios', { usuarios: filas });
  });
});

router.post('/usuarios', (req, res) => {
  const { nombre, edad } = req.body;
  db.run('INSERT INTO usuarios (nombre, edad) VALUES (?, ?)', [nombre, edad], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al agregar usuario');
    }
    res.redirect('/usuarios');
  });
});

router.post('/usuarios/eliminar/:id', (req, res) => {
  const idAEliminar = req.params.id;
  db.run('DELETE FROM usuarios WHERE id = ?', [idAEliminar], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al eliminar usuario');
    }
    res.redirect('/usuarios');
  });
});


router.get('/usuarios/editar/:id', (req, res) => {
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

router.post('/usuarios/editar/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, edad } = req.body;
  db.run('UPDATE usuarios SET nombre = ?, edad = ? WHERE id = ?', [nombre, edad, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al actualizar usuario');
    }
    res.redirect('/usuarios');
  });
});


module.exports = router;