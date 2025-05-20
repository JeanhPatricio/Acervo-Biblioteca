const LIVROS_KEY = 'livros';

// Carrega livros do localStorage
function carregarLivros() {
  const livrosJSON = localStorage.getItem(LIVROS_KEY);
  return livrosJSON ? JSON.parse(livrosJSON).livros : [];
}

// Exibe livros em uma tabela
function exibirLivros(tabelaId, filtro = '', isAdmin = false) {
  const tbody = document.getElementById(tabelaId);
  if (!tbody) return;
  tbody.innerHTML = '';
  const livros = carregarLivros();
  const livrosFiltrados = livros.filter(l => l.nome.toLowerCase().includes(filtro.toLowerCase()));
  
  livrosFiltrados.forEach(livro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${livro.nome}</td>
      <td>${livro.ano}</td>
      <td>${livro.autor}</td>
      <td>${livro.publicadora}</td>
    `;
    // Wrap row in a link to detalhes.html
    const link = document.createElement('a');
    link.href = `/content/detalhes.html?id=${livro.id}`;
    link.className = 'livro-link';
    link.style.display = 'contents'; // Preserve table row styling
    link.appendChild(tr);
    tbody.appendChild(link);
  });
}

// Configura o evento de busca
function configurarBusca(inputId, tabelaId, isAdmin = false) {
  const searchInput = document.getElementById(inputId);
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const termo = searchInput.value;
      exibirLivros(tabelaId, termo, isAdmin);
    });
  }
}

// Exporta funções para uso em outros scripts
window.carregarLivros = carregarLivros;
window.exibirLivros = exibirLivros;
window.configurarBusca = configurarBusca;