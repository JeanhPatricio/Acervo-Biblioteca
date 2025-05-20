window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'in', url, 'at line', lineNo, ':', columnNo, error);
  return false;
};

function carregarUsuarios() {
  const usuariosJSON = localStorage.getItem('db_usuarios');
  if (!usuariosJSON) {
    console.warn('db_usuarios not found in localStorage');
    return [];
  }
  try {
    const parsed = JSON.parse(usuariosJSON);
    if (parsed && Array.isArray(parsed.usuarios)) {
      return parsed.usuarios;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing db_usuarios:', e);
    return [];
  }
}

function carregarEmprestimos() {
  const emprestimosJSON = localStorage.getItem('emprestimos');
  if (!emprestimosJSON) {
    console.warn('emprestimos not found in localStorage');
    return [];
  }
  try {
    return JSON.parse(emprestimosJSON);
  } catch (e) {
    console.error('Error parsing emprestimos:', e);
    return [];
  }
}

function formatarData(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function calcularDataDevolucao(reservationDate) {
  const date = new Date(reservationDate);
  date.setUTCDate(date.getUTCDate() + 7);
  return formatarData(date.toISOString());
}

function isOverdue(loan) {
  const now = new Date();
  if (loan.dataDevolucao) {
    return new Date(loan.dataDevolucao) < now;
  }
  const loanDate = new Date(loan.data);
  const deadline = new Date(loanDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return now > deadline;
}

function devolverLivro(emprestimoIndex) {
  let emprestimos = carregarEmprestimos();
  const emprestimo = emprestimos[emprestimoIndex];
  if (!emprestimo.ativo) {
    alert('Este livro já foi devolvido.');
    return;
  }

  const now = new Date();
  emprestimos[emprestimoIndex].ativo = false;
  emprestimos[emprestimoIndex].dataDevolucao = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));

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
  exibirEmprestimos(document.getElementById('search')?.value || '');
}

function exibirEmprestimos(termoBusca = '') {
  const tbody = document.getElementById('emprestimos-tbody');
  if (!tbody) {
    console.error('emprestimos-tbody not found');
    return;
  }

  tbody.innerHTML = '';
  const emprestimos = carregarEmprestimos();
  const usuarios = carregarUsuarios();
  const livros = carregarLivros();

  console.log('Usuarios:', usuarios);
  console.log('Livros:', livros);
  console.log('Emprestimos:', emprestimos);

  const emprestimosFiltrados = emprestimos.filter((emprestimo, index) => {
    const usuario = Array.isArray(usuarios) ? usuarios.find(u => u.id === emprestimo.usuarioId) || { nome: 'Desconhecido', email: 'N/A' } : { nome: 'Desconhecido', email: 'N/A' };
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido' } : { nome: 'Desconhecido' };
    const termoLower = termoBusca.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(termoLower) ||
      usuario.email.toLowerCase().includes(termoLower) ||
      livro.nome.toLowerCase().includes(termoLower)
    );
  });

  emprestimosFiltrados.forEach((emprestimo, index) => {
    const usuario = Array.isArray(usuarios) ? usuarios.find(u => u.id === emprestimo.usuarioId) || { nome: 'Desconhecido', email: 'N/A' } : { nome: 'Desconhecido', email: 'N/A' };
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido' } : { nome: 'Desconhecido' };
    const isLoanOverdue = emprestimo.ativo && isOverdue(emprestimo);
    const status = emprestimo.ativo ? (isLoanOverdue ? 'Pendente' : 'Ativo') : 'Devolvido';
    const returnDate = emprestimo.dataDevolucao ? formatarData(emprestimo.dataDevolucao) : (emprestimo.ativo ? calcularDataDevolucao(emprestimo.data) : formatarData(emprestimo.data));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${usuario.nome}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${usuario.email}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${livro.nome}</a></td>
      <td><a href="emprestimo.html?index=${index}" class="cell-link">${formatarData(emprestimo.data)}</a></td>
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('historicobibliotecaria.js loaded');

  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON);
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

  if (!usuarioCorrente || usuarioCorrente.tipoAcesso !== 'bibliotecaria') {
    alert('Acesso restrito a bibliotecárias.');
    window.location.href = usuarioCorrente && usuarioCorrente.tipoAcesso === 'cliente' ? '/content/cliente.html' : '/index.html';
    return;
  }

  exibirEmprestimos();

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      console.log('Search input:', searchInput.value);
      exibirEmprestimos(searchInput.value);
    });
  } else {
    console.error('search input not found');
  }
});