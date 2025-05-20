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

function salvarEmprestimos(emprestimos) {
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
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

function formatarDataParaInput(isoString) {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  salvarEmprestimos(emprestimos);

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
  const devolverBtn = document.getElementById('devolverBtn');
  if (devolverBtn) {
    devolverBtn.disabled = true;
    devolverBtn.textContent = 'Devolvido';
  }
  const dataDevolucaoInput = document.getElementById('emprestimo-data-devolucao');
  if (dataDevolucaoInput) {
    dataDevolucaoInput.value = formatarDataParaInput(new Date().toISOString());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('emprestimo.js loaded');
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  console.log('DOMContentLoaded usuarioCorrente:', usuarioCorrenteJSON);
  const usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

  if (!usuarioCorrente || usuarioCorrente.tipoAcesso !== 'bibliotecaria') {
    alert('Acesso restrito a bibliotecárias.');
    window.location.href = usuarioCorrente && usuarioCorrente.tipoAcesso === 'cliente' ? '/content/cliente.html' : '/index.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const emprestimoIndex = parseInt(urlParams.get('index'));

  if (isNaN(emprestimoIndex)) {
    document.getElementById('emprestimo-detalhes').innerHTML = '<p>Reserva não encontrada.</p>';
    return;
  }

  const emprestimos = carregarEmprestimos();
  const emprestimo = emprestimos[emprestimoIndex];

  if (!emprestimo) {
    document.getElementById('emprestimo-detalhes').innerHTML = '<p>Reserva não encontrada.</p>';
    return;
  }

  const usuarios = carregarUsuarios();
  const livros = carregarLivros();
  const usuario = usuarios.find(u => u.id === emprestimo.usuarioId) || { nome: 'Desconhecido', email: 'N/A' };
  const livro = livros.find(l => l.id === emprestimo.livroId) || { nome: 'Desconhecido' };

  document.getElementById('emprestimo-nome').textContent = usuario.nome;
  document.getElementById('emprestimo-email').textContent = usuario.email;
  document.getElementById('emprestimo-livro').textContent = livro.nome;
  document.getElementById('emprestimo-data-reserva').textContent = formatarData(emprestimo.data);

  const dataDevolucaoInput = document.getElementById('emprestimo-data-devolucao');
  if (dataDevolucaoInput) {
    const returnDate = emprestimo.dataDevolucao || (emprestimo.ativo ? new Date(new Date(emprestimo.data).setUTCDate(new Date(emprestimo.data).getUTCDate() + 7)).toISOString() : emprestimo.data);
    dataDevolucaoInput.value = formatarDataParaInput(returnDate);
  } else {
    console.error('emprestimo-data-devolucao not found');
  }

  const salvarDataBtn = document.getElementById('salvarDataBtn');
  if (salvarDataBtn) {
    salvarDataBtn.addEventListener('click', () => {
      const newDate = dataDevolucaoInput.value;
      if (!newDate) {
        alert('Por favor, selecione uma data válida.');
        return;
      }
      const [year, month, day] = newDate.split('-').map(Number);
      const newDateUTC = new Date(Date.UTC(year, month - 1, day));
      const reservationDate = new Date(emprestimo.data);
      if (newDateUTC < reservationDate) {
        alert('A data de devolução não pode ser anterior à data da reserva.');
        return;
      }
      emprestimos[emprestimoIndex].dataDevolucao = newDateUTC.toISOString();
      salvarEmprestimos(emprestimos);
      alert('Data de devolução atualizada com sucesso!');
    });
  } else {
    console.error('salvarDataBtn not found');
  }

  const devolverBtn = document.getElementById('devolverBtn');
  if (devolverBtn) {
    if (!emprestimo.ativo) {
      devolverBtn.disabled = true;
      devolverBtn.textContent = 'Devolvido';
    } else {
      devolverBtn.addEventListener('click', () => {
        console.log('devolverBtn clicked');
        devolverLivro(emprestimoIndex);
      });
    }
  } else {
    console.error('devolverBtn not found');
  }
});