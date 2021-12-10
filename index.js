const path = require('path');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

/**
 * Definição de conexão com o banco de dados MySQL
 * (crud_db) em localhost.
 */
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db'
});

mysqlConnection.connect(erro => { if (erro) throw erro });

/**
 * Callback invocada para carregamento da página inicial,
 * quando requisição à raiz da aplicação (homepage_view).
 */
app.get('/', (req, res) => carregarPaginaInicial(req, res));

/**
 * Callback invocada para carregamento da página inicial.
 * (homepage_view).
 */
app.get('/home', (req, res) => carregarPaginaInicial(req, res));

/**
 * Callback invocada para carregamento da página de feed
 * ('feed_view'). 
 */
app.get('/feed', (req, res) => carregarFeed(req, res));

/**
 * Callback invocada para carregamento da página do usuário 
 * ('user_view'). 
 */
app.get('/user', (req, res) => carregarPaginaDoUsuario(req, res));

/**
 * Callback invocada sempre que um novo usuário for inserido
 * na base de dados.
 */
app.post('/save', (req, res) => inserirUsuario(req, res));

/**
 * Callback invocada sempre que uma atualização for realizada
 * no registro de um usuário.
 */
app.post('/update', (req, res) => atualizarUsuario(req, res));

/**
 * Callback invocada sempre que o registro de um usuário for
 * deletado.
 */
app.post('/delete', (req, res) => deletarUsuario(req, res));

/**
 * Callback invocada no momento de entrada do usuário na
 * aplicação (login).
 */
app.post('/auth', (req, res) => realizarLoginComoUsuario(req, res));

/**
 * Inicialização da aplicação em localhost na porta 8000.
 */
app.listen(8000, () => console.log('Server is running at port 8000'));

/**
 * Método responsável pelo carregamento da página inicial,
 * repassando todos os registros de usuários. 
 */
function carregarPaginaInicial(req, res) {
  const sql = 'SELECT * FROM usuario';
  mysqlConnection.query(sql, (erro, resultados) => {
    if (erro) throw erro;

    res.render('homepage_view', { results: resultados });
  });
}

/**
 * Método responsável pelo carregamento do feed, repassando
 * o registro do usuário atual. 
 */
function carregarFeed(req, res) {
  if (req.session.loggedin) {
    const sql = `SELECT * FROM usuario WHERE usuario_email  = '${req.session.usuario_email}'`;
    mysqlConnection.query(sql, (erro, resultados) => {
      if (erro) throw erro;

      res.render('feed_view', { results: resultados });
    });
  } else {
    res.send('Entre com um email valido!');
  }
}

/**
 * Método responsável pelo carregamento da página do usuário,
 * repassando o registro do usuário atual. 
 */
function carregarPaginaDoUsuario(req, res) {
  const sql = `SELECT * FROM usuario WHERE usuario_email  = '${req.session.usuario_email}'`;
  mysqlConnection.query(sql, (erro, resultados) => {
    if (erro) throw erro;

    res.render('user_view', { results: resultados });
  });
}

function inserirUsuario(req, res) {
  const usuario = {
    usuario_name: req.body.usuario_name,
    usuario_email: req.body.usuario_email,
    usuario_senha: req.body.usuario_senha
  };
  const sql = 'INSERT INTO usuario SET ?';
  mysqlConnection.query(sql, usuario, erro => {
    if (erro) throw erro;

    res.redirect('/');
  });
}

function atualizarUsuario(req, res) {
  const sql = `
    UPDATE usuario SET 
      usuario_name = '${req.body.usuario_name}',
      usuario_email = '${req.body.usuario_email}',
      usuario_senha = '${req.body.usuario_senha}' 
    WHERE usuario_id = '${req.body.id}'`;
  mysqlConnection.query(sql, erro => {
    if (erro) throw erro;

    res.redirect('/user');
  });
}

function deletarUsuario(req, res) {
  const sql = `DELETE FROM usuario WHERE usuario_id = '${req.body.usuario_id}'`;
  mysqlConnection.query(sql, erro => {
    if (erro) throw erro;

    req.session.loggedin = false;
    req.session.usuario_email = null;
    res.redirect('/');
  });
}

/**
 * Método responsável pela entrada do usuário na plataforma caso
 * exista usuário com email e senha indicados. 
 */
function realizarLoginComoUsuario(req, res) {
  const email = req.body.usuario_email
  const senha = req.body.usuario_senha;
  if (email && senha) {
    encaminharUsuarioParaFeedCasoExista([email, senha], req, res);
  } else {
    res.send('Entre com email e senha válidos!');
    res.end();
  }
}

function encaminharUsuarioParaFeedCasoExista(credenciais, req, res) {
  const sql = 'SELECT * FROM usuario WHERE usuario_email = ? AND usuario_senha = ?';
  mysqlConnection.query(sql, credenciais, (erro, resultados) => {
    if (resultados.length > 0) {
      req.session.loggedin = true;
      req.session.usuario_email = credenciais[0];
      res.redirect('/feed');
    } else {
      res.send('Email ou senha incorretos!');
    }

    res.end();
  });
}
