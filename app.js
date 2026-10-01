const express = require('express');
const app = express();
const PORT = 3000;
const routes = require('./routes/index');
const db = require('./database.js');
const session = require('express-session');

// 1. Middleware de sesión (DEBE IR ANTES DE LAS RUTAS)
app.use(session({
  secret: 'mi_clave_secreta',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

