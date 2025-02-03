function updateStatus() {
    const statusElement = document.getElementById('status');
    if (navigator.onLine) {
      statusElement.textContent = 'Você está online!';
      statusElement.style.color = 'green';
    } else {
      statusElement.textContent = 'Você está offline!';
      statusElement.style.color = 'red';
    }
  }
  
  // Atualiza o status quando a página é carregada
  updateStatus();
  
  // Escuta mudanças no estado de conexão
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  