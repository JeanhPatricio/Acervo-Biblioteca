function logoutUser() {
  sessionStorage.removeItem('usuarioCorrente');
  window.location.href = '/index.html';
}

document.addEventListener("DOMContentLoaded", function() {
  // Determina se a página atual é uma página de admin
  const isAdminPage = window.location.pathname.includes('administracao.html');
  
  // Modal e eventos de filtros
  document.getElementById('abrirFiltroBtn')?.addEventListener('click', function() {
    document.getElementById('modalFiltro').style.display = 'block';
  });

  document.getElementById('fecharModal')?.addEventListener('click', function() {
    document.getElementById('modalFiltro').style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalFiltro');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.getElementById('aplicarFiltroBtn')?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[id^="genre-filter-"]:checked');
    const selectedGenres = Array.from(checkboxes).map(cb => cb.value);
    // Se nenhum gênero estiver selecionado, limpa o filtro
    const genresToApply = selectedGenres.length > 0 ? selectedGenres : [];
    // Chama a função de livros.js para aplicar o filtro, passando isAdmin baseado na página
    window.aplicarFiltroGenero('tabela-livros', genresToApply, isAdminPage).catch(error => {
      console.error('Error applying genre filter:', error);
    });
    // Fecha o modal
    document.getElementById('modalFiltro').style.display = 'none';
  });

  // Adiciona evento para o botão Limpar Filtros
  document.getElementById('limparFiltrosBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input[id^="genre-filter-"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    // Aplica filtro vazio para exibir todos os livros
    window.aplicarFiltroGenero('tabela-livros', [], isAdminPage).catch(error => {
      console.error('Error clearing genre filter:', error);
    });
    document.getElementById('modalFiltro').style.display = 'none';
  });

  document.getElementById('configBtn')?.addEventListener('click', function() {
    alert('Página de configurações não implementada.');
  });

  document.getElementById('sairBtn')?.addEventListener('click', function() {
    logoutUser();
  });
});

// Função para gerar UUID
function generateUUID() {
  const d = new Date().getTime();
  const d2 = performance.now() * 1000 || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    r = (d + r) % 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Dados iniciais dos livros com IDs fixos
const livrosIniciais = {
  livros: [
    { id: "book1", nome: "Dom Quixote", ano: 1605, autor: "Miguel de Cervantes", publicadora: "Francisco de Robles", qtd: 1, subjects: ["Fiction", "Adventure"] },
    { id: "book2", nome: "1984", ano: 1949, autor: "George Orwell", publicadora: "Secker & Warburg", qtd: 1, subjects: ["Fiction", "Dystopia"] },
    { id: "book3", nome: "O Senhor dos Anéis", ano: 1954, autor: "J.R.R. Tolkien", publicadora: "Allen & Unwin", qtd: 1, subjects: ["Fantasy", "Adventure"] }
  ]
};

// Inicializa os livros se não existirem no localStorage
function initLivrosApp() {
  const livrosJSON = localStorage.getItem('livros');
  if (!livrosJSON) {
    console.log('Dados de livros não encontrados no localStorage. Carregando dados iniciais.');
    localStorage.setItem('livros', JSON.stringify(livrosIniciais));
  }
}

// Exporta funções para uso em outros scripts
window.generateUUID = generateUUID;
window.initLivrosApp = initLivrosApp;
window.livrosIniciais = livrosIniciais;
