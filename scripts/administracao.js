document.addEventListener('DOMContentLoaded', async () => {
  const usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente') || '{}');
  if (!usuarioCorrente.email) {
    alert('Faça login para acessar esta página.');
    window.location.href = '../index.html';
  }
  if (usuarioCorrente.tipoAcesso !== 'bibliotecaria') {
    alert('Acesso restrito a bibliotecárias.');
    window.location.href = 'bibliotecaria.html';
  }

  const LIVROS_KEY = 'livros';
  let db_livros = { livros: [] };

  // Inicializa os livros usando a função global
  window.initLivrosApp();

  // Carrega os livros do localStorage após inicialização
  async function loadLivrosFromStorage() {
    db_livros.livros = await window.carregarLivros();
    await window.exibirLivros('tabela-livros', '', true);
    window.configurarBusca('search', 'tabela-livros', true);
  }

  // Chama a função de carregamento após a inicialização
  await loadLivrosFromStorage();

  function adicionarLivro(nome, ano, autor, publicadora, qtd, subjects = []) {
    const id = window.generateUUID();
    const livro = { id, nome, ano, autor, publicadora, qtd, subjects };
    db_livros.livros.push(livro);
    localStorage.setItem(LIVROS_KEY, JSON.stringify(db_livros));
  }

  function editarLivro(id, nome, ano, autor, publicadora, qtd, subjects = []) {
    const livro = db_livros.livros.find(l => l.id === id);
    if (livro) {
      livro.nome = nome;
      livro.ano = ano;
      livro.autor = autor;
      livro.publicadora = publicadora;
      livro.qtd = qtd;
      livro.subjects = subjects; // Update genres
      localStorage.setItem(LIVROS_KEY, JSON.stringify(db_livros));
    }
  }

  function removerLivro(id) {
    db_livros.livros = db_livros.livros.filter(l => l.id !== id);
    localStorage.setItem(LIVROS_KEY, JSON.stringify(db_livros));
  }

  function getLivroPorId(id) {
    return db_livros.livros.find(l => l.id === id);
  }

  function prepararAdicionar() {
    document.getElementById('livro-form').reset();
    document.getElementById('livro-id').value = '';
    document.getElementById('qtd').value = '';
    document.getElementById('livroModalLabel').textContent = 'Adicionar Livro';
    // Clear genre checkboxes
    document.querySelectorAll('#generoList input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    document.getElementById('livroModal').style.display = 'block';
  }

  function prepararEditar(id) {
    const livro = getLivroPorId(id);
    document.getElementById('livro-id').value = livro.id;
    document.getElementById('nome').value = livro.nome;
    document.getElementById('ano').value = livro.ano;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('publicadora').value = livro.publicadora;
    document.getElementById('qtd').value = livro.qtd;
    document.getElementById('livroModalLabel').textContent = 'Editar Livro';
    // Set genre checkboxes based on existing subjects
    document.querySelectorAll('#generoList input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = livro.subjects && livro.subjects.includes(checkbox.value);
    });
    document.getElementById('livroModal').style.display = 'block';
  }

  async function salvarLivro(event) {
    event.preventDefault();
    const id = document.getElementById('livro-id').value;
    const nome = document.getElementById('nome').value.trim();
    const ano = parseInt(document.getElementById('ano').value);
    const autor = document.getElementById('autor').value.trim();
    const publicadora = document.getElementById('publicadora').value.trim();
    const qtd = parseInt(document.getElementById('qtd').value);

    if (!nome || !ano || !autor || !publicadora || isNaN(qtd)) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
    if (isNaN(ano) || ano < 0 || ano > new Date().getFullYear()) {
      alert('O ano deve ser um número válido.');
      return;
    }
    if (isNaN(qtd) || qtd < 0) {
      alert('A quantidade deve ser um número maior ou igual a 0.');
      return;
    }

    // Get selected genres
    const subjects = Array.from(document.querySelectorAll('#generoList input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    if (id) {
      editarLivro(id, nome, ano, autor, publicadora, qtd, subjects);
    } else {
      adicionarLivro(nome, ano, autor, publicadora, qtd, subjects);
    }

    await window.exibirLivros('tabela-livros', '', true);
    document.getElementById('livroModal').style.display = 'none';
  }

  async function deletarLivro(id) {
    if (confirm('Tem certeza que deseja deletar este livro?')) {
      removerLivro(id);
      await window.exibirLivros('tabela-livros', '', true);
    }
  }

  function fecharModal() {
    document.getElementById('livroModal').style.display = 'none';
  }

  document.getElementById('adicionarLivroBtn')?.addEventListener('click', prepararAdicionar);
  document.getElementById('fecharLivroModal')?.addEventListener('click', fecharModal);
  document.getElementById('cancelarLivroBtn')?.addEventListener('click', fecharModal);
  document.getElementById('livro-form')?.addEventListener('submit', salvarLivro);
  document.getElementById('livroModal')?.addEventListener('click', function(event) {
    if (event.target === this) {
      fecharModal();
    }
  });

  window.prepararAdicionar = prepararAdicionar;
  window.prepararEditar = prepararEditar;
  window.deletarLivro = deletarLivro;
});
