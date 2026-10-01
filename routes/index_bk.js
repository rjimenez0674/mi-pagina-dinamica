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

router.post('/saludo', (req, res) => {
  const nombre = req.body.nombre || 'invitado';
  const hora = new Date().toLocaleTimeString();
  res.render('saludo', { nombre: nombre, hora: hora });
});

router.get('/usuarios', (req, res) => {
  res.render('usuarios', { usuarios: usuarios });
});

router.post('/usuarios', (req, res) => {
  const nuevoUsuario = {
    id: Date.now(),
    nombre: req.body.nombre,
    edad: req.body.edad
  };
  usuarios.push(nuevoUsuario);
  res.render('usuarios', { usuarios: usuarios });
});

router.post('/usuarios/eliminar/:id', (req, res) => {
  const idAEliminar = req.params.id;
  const index = usuarios.findIndex(u => u.id == idAEliminar);
  if (index !== -1) {
    usuarios.splice(index, 1);
  }
  res.render('usuarios', { usuarios: usuarios });
});

module.exports = router;