window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'in', url, 'at line', lineNo, ':', columnNo, error);
  return false;
};

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

function exibirEmprestimos(termoBusca = '') {
  const tbody = document.getElementById('emprestimos-tbody');
  if (!tbody) {
    console.error('emprestimos-tbody not found');
    return;
  }

  tbody.innerHTML = '';
  const emprestimos = carregarEmprestimos();
  const livros = carregarLivros();
  const usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente') || '{}');

  if (!usuarioCorrente.id) {
    tbody.innerHTML = '<tr><td colspan="6">Usuário não autenticado.</td></tr>';
    return;
  }

  const emprestimosFiltrados = emprestimos.filter(emprestimo => {
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido', ano: 'Desconhecido', autor: 'Desconhecido' } : { nome: 'Desconhecido', ano: 'Desconhecido', autor: 'Desconhecido' };
    const termoLower = termoBusca.toLowerCase();
    return (
      emprestimo.usuarioId === usuarioCorrente.id &&
      livro.nome.toLowerCase().includes(termoLower)
    );
  });

  emprestimosFiltrados.forEach((emprestimo, index) => {
    const livro = Array.isArray(livros) ? livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido', ano: 'Desconhecido', autor: 'Desconhecido' } : { nome: 'Desconhecido', ano: 'Desconhecido', autor: 'Desconhecido' };
    const isLoanOverdue = emprestimo.ativo && isOverdue(emprestimo);
    const status = emprestimo.ativo ? (isLoanOverdue ? 'Pendente' : 'Ativo') : 'Devolvido';
    const returnDate = emprestimo.dataDevolucao ? formatarData(emprestimo.dataDevolucao) : (emprestimo.ativo ? calcularDataDevolucao(emprestimo.data) : formatarData(emprestimo.data));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${livro.nome}</td>
      <td>${livro.ano}</td>
      <td>${livro.autor}</td>
      <td>${formatarData(emprestimo.data)}</td>
      <td>${returnDate}</td>
      <td><span class="${status === 'Pendente' ? 'status-pendente' : ''}">${status}</span></td>
    `;
    tbody.appendChild(tr);
  });

  if (emprestimosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhuma reserva encontrada.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('historicocliente.js loaded');

  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON);
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

  if (!usuarioCorrente || usuarioCorrente.tipoAcesso !== 'cliente') {
    alert('Acesso restrito a clientes.');
    window.location.href = usuarioCorrente && usuarioCorrente.tipoAcesso === 'bibliotecaria' ? '/content/bibliotecaria.html' : '/index.html';
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

  const buscaBtn = document.getElementById('buscaBtn');
  if (buscaBtn) {
    buscaBtn.addEventListener('click', () => {
      console.log('Busca button clicked:', searchInput?.value);
      exibirEmprestimos(searchInput?.value || '');
    });
  } else {
    console.error('buscaBtn not found');
  }
});