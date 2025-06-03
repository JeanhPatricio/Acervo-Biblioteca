const LIVROS_KEY = 'livros';
const CACHE_KEY = 'apiCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours em milesegundos

// Carrega livros do localStorage e API
async function carregarLivros() {
  let livros = [];
  const livrosJSON = localStorage.getItem(LIVROS_KEY);
  if (livrosJSON) {
    const parsed = JSON.parse(livrosJSON);
    livros = Array.isArray(parsed.livros) ? parsed.livros : [];
  }

  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY);
  const now = new Date().getTime();
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (now - timestamp < CACHE_DURATION) {
      livros = [...livros, ...data];
      return removeDuplicates(livros);
    }
  }

  try {
    // Buscar na API da Open Library com uma pesquisa padrão (por exemplo, livros populares)
    const response = await fetch('https://openlibrary.org/search.json?q=popular+books&limit=10');
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    const apiLivros = data.docs.map(doc => ({
      id: doc.key || window.generateUUID(),
      nome: doc.title || 'Desconhecido',
      ano: doc.publish_year ? doc.publish_year[0] : 'N/A',
      autor: doc.author_name ? doc.author_name[0] : 'Desconhecido',
      publicadora: doc.publisher ? doc.publisher[0] : 'Desconhecido',
      qtd: 1, // Default quantity since API doesn't provide it
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : ''
    }));

    // Mesclar livros de API com livros locais
    livros = [...livros, ...apiLivros];
    livros = removeDuplicates(livros);

    // Armazenar em cache os resultados da API
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: apiLivros, timestamp: now }));
  } catch (error) {
    console.error('Error fetching API data:', error);
    // Voltar apenas para dados locais
  }

  // Salvar dados mesclados em localStorage
  localStorage.setItem(LIVROS_KEY, JSON.stringify({ livros }));
  return livros; // Sempre retorna em array
}

// Remove duplicadas baseado no ID
function removeDuplicates(livros) {
  const seen = new Set();
  return livros.filter(livro => {
    const duplicate = seen.has(livro.id);
    seen.add(livro.id);
    return !duplicate;
  });
}

// Exibe livros em uma tabela
async function exibirLivros(tabelaId, filtro = '', isAdmin = false) {
  const tbody = document.getElementById(tabelaId);
  if (!tbody) return;
  tbody.innerHTML = '';
  
  // Aguarde os dados assíncronos para carregarLivros
  const livros = await carregarLivros();
  
  // Garante que livros seja um array antes de ser filtrado
  const livrosArray = Array.isArray(livros) ? livros : [];
  
  // Filtra livros por nome, autor ou publicadora com verificação de null/undefined
  const livrosFiltrados = livrosArray.filter(l => {
    const termo = filtro.toLowerCase();
    return (
      (l.nome || '').toLowerCase().includes(termo) ||
      (l.autor || '').toLowerCase().includes(termo) ||
      (l.publicadora || '').toLowerCase().includes(termo)
    );
  });
  
  livrosFiltrados.forEach(livro => {
    const tr = document.createElement('tr');
    if (isAdmin) {
      // Visualização do Admin: todas as colunas, incluindo qtd e ações
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
      // Visão não administrativa: apenas quatro colunas, encapsuladas em um link
      tr.innerHTML = `
        <td>${livro.nome || 'Desconhecido'}</td>
        <td>${livro.ano || 'N/A'}</td>
        <td>${livro.autor || 'Desconhecido'}</td>
        <td>${livro.publicadora || 'Desconhecido'}</td>
      `;
      const link = document.createElement('a');
      link.href = `/content/detalhes.html?id=${livro.id}`;
      link.className = 'livro-link';
      link.style.display = 'contents'; // Preserva o estilo da linha na tabela
      link.appendChild(tr);
      tbody.appendChild(link);
    }
  });
}

// Configura o evento de busca
function configurarBusca(inputId, tabelaId, isAdmin = false) {
  const searchInput = document.getElementById(inputId);
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const termo = searchInput.value;
      // Como exibirLivros é assíncrono, trate-o com .then()
      exibirLivros(tabelaId, termo, isAdmin).catch(error => {
        console.error('Error in search:', error);
      });
    });
  }
}

// Exporta funções para uso em outros scripts
window.carregarLivros = carregarLivros;
window.exibirLivros = exibirLivros;
window.configurarBusca = configurarBusca;
