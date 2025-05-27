function logoutUser() {
  sessionStorage.removeItem('usuarioCorrente');
  window.location.href = '/index.html';
}

document.addEventListener("DOMContentLoaded", function() {
  // Filtrar lógica modal
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

  // Botão de Configuração (não implementado)
  document.getElementById('configBtn')?.addEventListener('click', function() {
    alert('Página de configurações não implementada.');
  });

  // Sair button
  document.getElementById('sairBtn')?.addEventListener('click', function() {
    logoutUser();
  });

  // Atualizar Acervo button
  document.getElementById('atualizarAcervoBtn')?.addEventListener('click', function(event) {
    console.log('Atualizar Acervo button clicked');
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

// Dados iniciais dos livros
const livrosIniciais = {
  livros: [
    { id: generateUUID(), nome: "Dom Quixote", ano: 1605, autor: "Miguel de Cervantes", publicadora: "Francisco de Robles", qtd: 1 },
    { id: generateUUID(), nome: "1984", ano: 1949, autor: "George Orwell", publicadora: "Secker & Warburg", qtd: 1 },
    { id: generateUUID(), nome: "O Senhor dos Anéis", ano: 1954, autor: "J.R.R. Tolkien", publicadora: "Allen & Unwin", qtd: 1 }
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
