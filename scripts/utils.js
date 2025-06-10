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

function salvarEmprestimos(emprestimos) {
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
}

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

function formatarDataParaInput(isoString) {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Exporta funções para uso global
window.carregarEmprestimos = carregarEmprestimos;
window.salvarEmprestimos = salvarEmprestimos;
window.carregarUsuarios = carregarUsuarios;
window.formatarData = formatarData;
window.calcularDataDevolucao = calcularDataDevolucao;
window.isOverdue = isOverdue;
window.formatarDataParaInput = formatarDataParaInput;
