window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'in', url, 'at line', lineNo, ':', columnNo, error);
  return false;
};

function devolverLivro(emprestimoIndex) {
  let emprestimos = window.carregarEmprestimos();
  const emprestimo = emprestimos[emprestimoIndex];
  if (!emprestimo.ativo) {
    alert('Este livro já foi devolvido.');
    return;
  }

  const now = new Date();
  emprestimos[emprestimoIndex].ativo = false;
  emprestimos[emprestimoIndex].dataDevolucao = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  window.salvarEmprestimos(emprestimos);

  const livrosJSON = localStorage.getItem('livros');
  if (livrosJSON) {
    try {
      const livrosData = JSON.parse(livrosJSON);
      const livros = livrosData.livros || [];
      const livro = livros.find(l => l.id === emprestimo.livroId);
      if (livro) {
        livro.qtd = (parseInt(livro.qtd) || 0) + 1;
        localStorage.setItem('livros', JSON.stringify(livrosData));
      }
    } catch (e) {
      console.error('Error updating livro.qtd:', e);
    }
  }

  alert('Livro devolvido com sucesso!');
  exibirEmprestimos(document.getElementById('search')?.value || '').catch(error => {
    console.error('Error updating display after return:', error);
  });
}

async function exibirEmprestimos(termoBusca = '') {
  const tbody = document.getElementById('emprestimos-tbody');
  if (!tbody) {
    console.error('emprestimos-tbody not found');
    return;
  }

  tbody.innerHTML = '';
  const emprestimos = window.carregarEmprestimos();
  const usuarios = window.carregarUsuarios();
  const livros = await window.carregarLivros();

  console.log('Usuarios:', usuarios);
  console.log('Livros:', livros);
  console.log('Emprestimos:', emprestimos);
  console.log('Termo de busca:', termoBusca);

  const emprestimosFiltrados = emprestimos.filter((emprestimo, index) => {
    const usuario = Array.isArray(usuarios) ? usuarios.find(u => u.id === emprestimo.usuarioId) || { nome: 'Desconhecido', email: 'N/A' } : { nome: 'Desconhecido', email: 'N/A' };
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido' } : { nome: 'Desconhecido' };
    const termoLower = termoBusca.toLowerCase();
    const matchesSearch = !termoBusca || // Show all if no search term
      (usuario.nome || '').toLowerCase().includes(termoLower) ||
      (usuario.email || '').toLowerCase().includes(termoLower) ||
      (livro.nome || '').toLowerCase().includes(termoLower);
    console.log(`Filter check for emprestimo ${index}: usuario=${usuario.nome}, livro=${livro.nome}, matches=${matchesSearch}`);
    return matchesSearch;
  });

  emprestimosFiltrados.forEach((emprestimo, index) => {
    const usuario = Array.isArray(usuarios) ? usuarios.find(u => u.id === emprestimo.usuarioId) || { nome: 'Desconhecido', email: 'N/A' } : { nome: 'Desconhecido', email: 'N/A' };
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido' } : { nome: 'Desconhecido' };
    const isLoanOverdue = emprestimo.ativo && window.isOverdue(emprestimo);
    const status = emprestimo.ativo ? (isLoanOverdue ? 'Pendente' : 'Ativo') : 'Devolvido';
    const returnDate = emprestimo.dataDevolucao ? window.formatarData(emprestimo.dataDevolucao) : (emprestimo.ativo ? window.calcularDataDevolucao(emprestimo.data) : window.formatarData(emprestimo.data));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${usuario.nome}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${usuario.email}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${livro.nome}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${window.formatarData(emprestimo.data)}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${returnDate}</a></td>
      <td>
        <span class="${status === 'Pendente' ? 'status-pendente' : ''}">${status}</span>
        ${emprestimo.ativo ? `<button class="btn btn-primary" onclick="event.stopPropagation(); devolverLivro(${index});">Devolver</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (emprestimosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhuma reserva encontrada.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('historicobibliotecaria.js loaded');
  window.initLivrosApp(); // Ensure initial books are loaded

  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON);
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

  if (!usuarioCorrente || usuarioCorrente.tipoAcesso !== 'bibliotecaria') {
    alert('Acesso restrito a bibliotecárias.');
    window.location.href = usuarioCorrente && usuarioCorrente.tipoAcesso === 'cliente' ? '/content/cliente.html' : '/index.html';
    return;
  }

  await exibirEmprestimos();

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      console.log('Search input:', searchInput.value);
      exibirEmprestimos(searchInput.value).catch(error => {
        console.error('Error in search:', error);
      });
    });
  } else {
    console.error('search input not found');
  }
});
