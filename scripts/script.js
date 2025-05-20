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