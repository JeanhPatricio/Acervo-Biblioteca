window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'in', url, 'at line', lineNo, ':', columnNo, error);
  return false;
};

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

// Garante que a função voltar esteja disponível globalmente
window.voltar = voltar;

document.addEventListener('DOMContentLoaded', () => {
  console.log('detalhes.js loaded'); // Debug: Confirm script execution
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON); // Debug
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;
  console.log('DOMContentLoaded Parsed usuarioCorrente:', usuarioCorrente); // Debug

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
});