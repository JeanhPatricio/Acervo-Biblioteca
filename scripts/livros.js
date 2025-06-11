const LIVROS_KEY = 'livros';
const CACHE_KEY = 'apiCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours em milesegundos

// Estado global para armazenar os gêneros selecionados
let currentFilterGenres = []; // Para filtragem
let currentIsAdmin = false;
let currentSearchTerm = '';

// Carrega livros do localStorage e API, preservando edições manuais
async function carregarLivros() {
  let livros = [];
  // Carregue primeiro do localStorage para preservar as edições manuais
  const livrosJSON = localStorage.getItem(LIVROS_KEY);
  if (livrosJSON) {
    const parsed = JSON.parse(livrosJSON);
    livros = Array.isArray(parsed.livros) ? parsed.livros : [];
    console.log('Loaded books from localStorage:', livros.map(l => ({ nome: l.nome, subjects: l.subjects })));
  }

  // Mesclar com livrosIniciais somente se o livro não existir, sem sobrescrever subjects
  const initialBooks = window.livrosIniciais.livros || [];
  initialBooks.forEach(initialBook => {
    const exists = livros.find(l => l.id === initialBook.id);
    if (!exists) {
      console.log(`Adding initial book: ${initialBook.nome}`);
      livros.push(initialBook);
    }
  });

  // Verifica cache, evitando sobrescrever subjects padrão
  const cache = localStorage.getItem(CACHE_KEY);
  const now = new Date().getTime();
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (now - timestamp < CACHE_DURATION) {
      data.forEach(livro => {
        // Adicione apenas assuntos se não houver nenhum, respeitando as edições manuais
        if (!livro.subjects || livro.subjects.length === 0) {
          console.log(`Adding default subjects to cached book: ${livro.nome}`);
          livro.subjects = ["Fiction", "Nonfiction"];
        }
      });
      const newBooks = data.filter(apiBook => !livros.some(stored => stored.id === apiBook.id));
      livros = [...livros, ...newBooks];
      livros = removeDuplicates(livros);
      localStorage.setItem(LIVROS_KEY, JSON.stringify({ livros }));
      console.log('Final books after cache merge:', livros.map(l => ({ nome: l.nome, subjects: l.subjects })));
      return livros;
    }
  }

  try {
    const response = await fetch('https://openlibrary.org/search.json?q=popular+books&limit=10');
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    const apiLivros = data.docs.map(doc => {
      const inferredSubjects = doc.subject || [];
      const defaultSubjects = ["Fiction", "Nonfiction", "Fantasy", "Dystopia", "Adventure"];
      const subjects = inferredSubjects.length > 0 ? inferredSubjects : [defaultSubjects[Math.floor(Math.random() * defaultSubjects.length)]];
      console.log(`Assigning subjects to API book ${doc.title}: ${subjects}`);
      return {
        id: doc.key || window.generateUUID(),
        nome: doc.title || 'Desconhecido',
        ano: doc.publish_year ? doc.publish_year[0] : 'N/A',
        autor: doc.author_name ? doc.author_name[0] : 'Desconhecido',
        publicadora: doc.publisher ? doc.publisher[0] : 'Desconhecido',
        qtd: 1,
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
        subjects
      };
    });

    // Adicione apenas novos livros da API, preservando as edições existentes
    const newApiBooks = apiLivros.filter(apiBook => !livros.some(stored => stored.id === apiBook.id));
    livros = [...livros, ...newApiBooks];
    livros = removeDuplicates(livros);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: apiLivros, timestamp: now }));
    localStorage.setItem(LIVROS_KEY, JSON.stringify({ livros }));
    console.log('Final books after API merge:', livros.map(l => ({ nome: l.nome, subjects: l.subjects })));
  } catch (error) {
    console.error('Error fetching API data:', error);
  }

  return livros;
}

// Remove duplicadas baseado no ID
function removeDuplicates(livros) {
  const seen = new Map();
  livros.forEach(livro => {
    seen.set(livro.id, livro);
  });
  return Array.from(seen.values());
}

// Exibe livros em uma tabela com filtro de gênero
async function exibirLivros(tabelaId, filtro = '', isAdmin = false, genres = currentFilterGenres) {
  const tbody = document.getElementById(tabelaId);
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const livros = await carregarLivros();
  console.log('Books before filtering:', livros.map(l => ({ nome: l.nome, subjects: l.subjects })));
  const livrosArray = Array.isArray(livros) ? livros : [];
  
  const livrosFiltrados = livrosArray.filter(l => {
    const termo = filtro.toLowerCase();
    const genreMatch = !genres.length || (l.subjects && l.subjects.length > 0 && genres.some(g => 
      l.subjects.some(s => s.toLowerCase() === g.toLowerCase())
    ));
    if (!genreMatch && genres.length) {
      console.log(`Book ${l.nome} filtered out. Subjects: ${l.subjects}, Selected genres: ${genres}`);
    }
    return (
      genreMatch &&
      ((l.nome || '').toLowerCase().includes(termo) ||
       (l.autor || '').toLowerCase().includes(termo) ||
       (l.publicadora || '').toLowerCase().includes(termo))
    );
  });
  
  livrosFiltrados.forEach(livro => {
    const tr = document.createElement('tr');
    if (isAdmin) {
      tr.innerHTML = `
        <td>${livro.nome || 'Desconhecido'}</td>
        <td>${livro.ano || 'N/A'}</td>
        <td>${livro.autor || 'Desconhecido'}</td>
        <td>${livro.publicadora || 'Desconhecido'}</td>
        <td>${livro.qtd ?? '0'}</td>
        <td>
          <button class="btn btn-warning" onclick="prepararEditar('${livro.id}')">Editar</button>
          <button class="btn btn-danger" onclick="deletarLivro('${livro.id}')">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    } else {
      tr.innerHTML = `
        <td>${livro.nome || 'Desconhecido'}</td>
        <td>${livro.ano || 'N/A'}</td>
        <td>${livro.autor || 'Desconhecido'}</td>
        <td>${livro.publicadora || 'Desconhecido'}</td>
      `;
      const link = document.createElement('a');
      link.href = `/content/detalhes.html?id=${livro.id}`;
      link.className = 'livro-link';
      link.style.display = 'contents';
      link.appendChild(tr);
      tbody.appendChild(link);
    }
  });
}

// Aplica o filtro de gênero e atualiza a tabela
async function aplicarFiltroGenero(tabelaId, genres, isAdmin) {
  currentFilterGenres = genres;
  currentIsAdmin = isAdmin;
  await exibirLivros(tabelaId, currentSearchTerm, isAdmin, genres);
}

// Configura o evento de busca
function configurarBusca(inputId, tabelaId, isAdmin = false) {
  const searchInput = document.getElementById(inputId);
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearchTerm = searchInput.value;
      exibirLivros(tabelaId, currentSearchTerm, isAdmin, currentFilterGenres).catch(error => {
        console.error('Error in search:', error);
      });
    });
  }
}

// Exporta funções para uso em outros scripts
window.carregarLivros = carregarLivros;
window.exibirLivros = exibirLivros;
window.configurarBusca = configurarBusca;
window.aplicarFiltroGenero = aplicarFiltroGenero;
