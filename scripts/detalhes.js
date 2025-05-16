window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'in', url, 'at line', lineNo, ':', columnNo, error);
  return false;
};

// Debug: Log all click events
document.addEventListener('click', (event) => {
  console.log('Document click on:', event.target, 'id:', event.target.id);
});

function voltar() {
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('voltar usuarioCorrente:', usuarioCorrenteJSON); // Debug
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;
  console.log('voltar Parsed usuarioCorrente:', usuarioCorrente); // Debug

  if (usuarioCorrente && usuarioCorrente.tipoAcesso === 'cliente') {
    console.log('Redirecting to /content/cliente.html');
    window.location.href = '/content/cliente.html';
  } else if (usuarioCorrente && usuarioCorrente.tipoAcesso === 'bibliotecaria') {
    console.log('Redirecting to /content/bibliotecaria.html');
    window.location.href = '/content/bibliotecaria.html';
  } else {
    console.log('Redirecting to /index.html (no usuarioCorrente or invalid tipoAcesso)');
    window.location.href = '/index.html';
  }
}

// Função para carregar livros do localStorage
function carregarLivros() {
  const livrosJSON = localStorage.getItem('livros');
  return livrosJSON ? JSON.parse(livrosJSON).livros : [];
}

// Função para salvar livros no localStorage
function salvarLivros(livros) {
  localStorage.setItem('livros', JSON.stringify({ livros }));
}

// Função para carregar empréstimos do localStorage
function carregarEmprestimos() {
  return JSON.parse(localStorage.getItem('emprestimos') || '[]');
}

// Função para salvar empréstimos no localStorage
function salvarEmprestimos(emprestimos) {
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
}

function reservar(livroId) {
  console.log('reservar called for livroId:', livroId); // Debug
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;
  console.log('reservar usuarioCorrente:', usuarioCorrente); // Debug

  if (!usuarioCorrente || !usuarioCorrente.id) {
    alert('Faça login para reservar.');
    window.location.href = '/content/login.html';
    return;
  }

  const livros = carregarLivros();
  const livro = livros.find(l => l.id === livroId);

  if (!livro) {
    alert('Livro não encontrado.');
    return;
  }

  if (!livro.qtd || livro.qtd <= 0) {
    alert('Livro indisponível.');
    return;
  }

  // Verificar reserva duplicada
  const emprestimos = carregarEmprestimos();
  if (emprestimos.some(e => e.usuarioId === usuarioCorrente.id && e.livroId === livroId && e.ativo)) {
    alert('Você já reservou este livro.');
    return;
  }

  // Diminuir quantidade
  livro.qtd -= 1;
  salvarLivros(livros);

  // Criar registro de empréstimo com status ativo
  const emprestimo = {
    usuarioId: usuarioCorrente.id,
    livroId: livroId,
    data: new Date().toISOString(),
    ativo: true
  };
  emprestimos.push(emprestimo);
  salvarEmprestimos(emprestimos);

  alert('Livro reservado com sucesso!');
  // Atualiza a UI com quantidade
  const qtdElement = document.getElementById('livro-qtd');
  if (qtdElement) {
    qtdElement.textContent = livro.qtd;
  } else {
    const qtdPara = document.createElement('p');
    qtdPara.innerHTML = `<strong>Quantidade disponível:</strong> <span id="livro-qtd">${livro.qtd}</span>`;
    document.getElementById('livro-detalhes').appendChild(qtdPara);
  }
}

// Garante que a função reservar esteja disponível globalmente
window.reservar = reservar;

document.addEventListener('DOMContentLoaded', () => {
  console.log('detalhes.js loaded'); // Debug: Confirm script execution
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON); // Debug
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;
  console.log('DOMContentLoaded Parsed usuarioCorrente:', usuarioCorrente); // Debug

  // Obtém o ID do livro da URL
  const urlParams = new URLSearchParams(window.location.search);
  const livroId = urlParams.get('id');

  if (!livroId) {
    document.getElementById('livro-detalhes').innerHTML = '<p>Livro não encontrado.</p>';
    return;
  }

  // Carrega livros do localStorage
  const livros = carregarLivros();
  const livro = livros.find(l => l.id === livroId);

  if (!livro) {
    document.getElementById('livro-detalhes').innerHTML = '<p>Livro não encontrado.</p>';
    return;
  }

  // Preenche os detalhes do livro
  document.getElementById('livro-nome').textContent = livro.nome;
  document.getElementById('livro-ano').textContent = livro.ano;
  document.getElementById('livro-autor').textContent = livro.autor;
  document.getElementById('livro-publicadora').textContent = livro.publicadora;
  // Adiciona quantidade na UI
  const qtdPara = document.createElement('p');
  qtdPara.innerHTML = `<strong>Quantidade disponível:</strong> <span id="livro-qtd">${livro.qtd || 0}</span>`;
  document.getElementById('livro-detalhes').appendChild(qtdPara);

  // Adiciona event listener para voltarBtn
  const voltarBtn = document.getElementById('voltarBtn');
  if (voltarBtn) {
    voltarBtn.addEventListener('click', () => {
      console.log('voltarBtn clicked'); // Debug
      voltar();
    });
  } else {
    console.error('voltarBtn not found');
  }

  // Adiciona event listener para reservarBtn após DOM updates
  const reservarBtn = document.getElementById('reservarBtn');
  if (reservarBtn) {
    reservarBtn.addEventListener('click', () => {
      console.log('reservarBtn clicked'); // Debug
      reservar(livroId);
    });
  } else {
    console.error('reservarBtn not found');
  }
});
