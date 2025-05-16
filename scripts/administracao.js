document.addEventListener('DOMContentLoaded', () => {
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

  function generateUUID() {
    const d = new Date().getTime();
    const d2 = performance.now() * 1000 || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random() * 16;
      r = (d + r) % 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  const livrosIniciais = {
    livros: [
      { id: generateUUID(), nome: "Dom Quixote", ano: 1605, autor: "Miguel de Cervantes", publicadora: "Francisco de Robles", qtd: 1 },
      { id: generateUUID(), nome: "1984", ano: 1949, autor: "George Orwell", publicadora: "Secker & Warburg", qtd: 1 },
      { id: generateUUID(), nome: "O Senhor dos Anéis", ano: 1954, autor: "J.R.R. Tolkien", publicadora: "Allen & Unwin", qtd: 1 }
    ]
  };

  function initLivrosApp() {
    const livrosJSON = localStorage.getItem(LIVROS_KEY);
    if (!livrosJSON) {
      console.log('Dados de livros não encontrados no localStorage. Carregando dados iniciais.');
      db_livros = livrosIniciais;
      localStorage.setItem(LIVROS_KEY, JSON.stringify(livrosIniciais));
    } else {
      db_livros = JSON.parse(livrosJSON);
    }
    exibirLivros('tabela-livros', '', true);
    configurarBusca('search', 'tabela-livros', true);
  }

  function adicionarLivro(nome, ano, autor, publicadora, qtd) {
    const id = generateUUID();
    const livro = { id, nome, ano, autor, publicadora, qtd };
    db_livros.livros.push(livro);
    localStorage.setItem(LIVROS_KEY, JSON.stringify(db_livros));
  }

  function editarLivro(id, nome, ano, autor, publicadora, qtd) {
    const livro = db_livros.livros.find(l => l.id === id);
    if (livro) {
      livro.nome = nome;
      livro.ano = ano;
      livro.autor = autor;
      livro.publicadora = publicadora;
      livro.qtd = qtd;
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

  function exibirLivros(tableId, termoBusca = '', isAdmin = false) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    tbody.innerHTML = '';
    let livros = db_livros.livros;
    if (termoBusca) {
      livros = livros.filter(livro =>
        livro.nome.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    livros.forEach(livro => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${livro.nome}</td>
        <td>${livro.ano}</td>
        <td>${livro.autor}</td>
        <td>${livro.publicadora}</td>
        <td>${livro.qtd}</td>
        ${isAdmin ? `
          <td>
            <button class="btn btn-warning" onclick="prepararEditar('${livro.id}')">Editar</button>
            <button class="btn btn-danger" onclick="deletarLivro('${livro.id}')">Deletar</button>
          </td>
        ` : ''}
      `;
      tbody.appendChild(tr);
    });
  }

  function prepararAdicionar() {
    document.getElementById('livro-form').reset();
    document.getElementById('livro-id').value = '';
    document.getElementById('qtd').value = '';
    document.getElementById('livroModalLabel').textContent = 'Adicionar Livro';
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
    document.getElementById('livroModal').style.display = 'block';
  }

  function salvarLivro(event) {
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

    if (id) {
      editarLivro(id, nome, ano, autor, publicadora, qtd);
    } else {
      adicionarLivro(nome, ano, autor, publicadora, qtd);
    }

    exibirLivros('tabela-livros', '', true);
    document.getElementById('livroModal').style.display = 'none';
  }

  function deletarLivro(id) {
    if (confirm('Tem certeza que deseja deletar este livro?')) {
      removerLivro(id);
      exibirLivros('tabela-livros', '', true);
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

  initLivrosApp();

  window.prepararAdicionar = prepararAdicionar;
  window.prepararEditar = prepararEditar;
  window.deletarLivro = deletarLivro;
});