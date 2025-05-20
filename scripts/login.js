const LOGIN_URL = "../index.html";

let db_usuarios = {};
let usuarioCorrente = {};

function generateUUID() {
  const d = new Date().getTime();
  const d2 = performance.now() * 1000 || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    r = (d + r) % 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const dadosIniciais = {
  usuarios: [
    { id: generateUUID(), tipoAcesso: "bibliotecaria", senha: "123", nome: "Admin", email: "admin@abc.com" },
    { id: generateUUID(), tipoAcesso: "cliente", senha: "123", nome: "Usuario", email: "user@abc.com" },
  ]
};

function initLoginApp() {
  sessionStorage.removeItem('usuarioCorrente');
  const usuariosJSON = localStorage.getItem('db_usuarios');
  if (!usuariosJSON) {
    db_usuarios = dadosIniciais;
    localStorage.setItem('db_usuarios', JSON.stringify(dadosIniciais));
  } else {
    db_usuarios = JSON.parse(usuariosJSON);
  }
  toggleNovoUsuarioButton();
  // Add event listener for tipoAcesso change
  const tipoAcessoSelect = document.getElementById('tipoAcesso');
  if (tipoAcessoSelect) {
    tipoAcessoSelect.addEventListener('change', toggleNovoUsuarioButton);
  }
}

function loginUser(email, senha, tipoAcesso) {
  for (const usuario of db_usuarios.usuarios) {
    if (email === usuario.email && senha === usuario.senha && tipoAcesso === usuario.tipoAcesso) {
      usuarioCorrente = usuario;
      sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
      return true;
    }
  }
  return false;
}

function logoutUser() {
  sessionStorage.removeItem('usuarioCorrente');
  usuarioCorrente = {};
  window.location.href = LOGIN_URL;
}

function isEmailUnique(email) {
  return !db_usuarios.usuarios.some(u => u.email === email);
}

function addUser(nome, senha, email, tipoAcesso) {
  const novoUsuario = {
    id: generateUUID(),
    nome, senha, email, tipoAcesso
  };
  db_usuarios.usuarios.push(novoUsuario);
  localStorage.setItem('db_usuarios', JSON.stringify(db_usuarios));
}

function toggleNovoUsuarioButton() {
  const btnNovoUsuario = document.getElementById('btnNovoUsuario');
  if (btnNovoUsuario) {
    const tipoAcesso = document.getElementById('tipoAcesso')?.value || 'cliente';
    btnNovoUsuario.style.display = tipoAcesso === 'bibliotecaria' ? 'none' : 'block';
  }
}

document.getElementById('loginForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('password').value;
  const tipoAcesso = document.getElementById('tipoAcesso').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !senha || !tipoAcesso) {
    alert('Preencha todos os campos.');
    return;
  }
  if (!emailRegex.test(email)) {
    alert('Por favor, insira um email válido.');
    return;
  }

  if (!loginUser(email, senha, tipoAcesso)) {
    alert('Email, senha ou tipo incorretos.');
    return;
  }

  window.location.href = tipoAcesso === 'cliente' ? 'cliente.html' : 'bibliotecaria.html';
});

const modalOverlay = document.getElementById('modalOverlay');
const btnNovoUsuario = document.getElementById('btnNovoUsuario');
const btnFecharModal = document.getElementById('fecharModal');
const btnCancelar = document.getElementById('cancelar');

btnNovoUsuario.addEventListener('click', () => {
  document.getElementById('registerForm').reset();
  modalOverlay.classList.remove('hidden');
});

btnFecharModal.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

btnCancelar.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

document.getElementById('btn_salvar').addEventListener('click', () => {
  const nome = document.getElementById('txt_nome').value.trim();
  const email = document.getElementById('txt_email').value.trim();
  const senha = document.getElementById('txt_senha').value;
  const senha2 = document.getElementById('txt_senha2').value;
  const tipoAcesso = document.getElementById('tipoAcessoReg').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!nome || !email || !senha || !senha2) {
    alert('Todos os campos são obrigatórios.');
    return;
  }
  if (!emailRegex.test(email)) {
    alert('Por favor, insira um email válido.');
    return;
  }
  if (!isEmailUnique(email)) {
    alert('Email já cadastrado.');
    return;
  }
  if (senha !== senha2) {
    alert('Senhas não coincidem.');
    return;
  }

  addUser(nome, senha, email, tipoAcesso);
  alert('Usuário cadastrado com sucesso!');
  modalOverlay.classList.add('hidden');
});

initLoginApp();