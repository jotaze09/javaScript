function pegarLista() {
  return JSON.parse(localStorage.getItem('compras') || '[]');
}

function salvarLista(lista) {
  localStorage.setItem('compras', JSON.stringify(lista));
}

function mostrarLista() {
  const lista = pegarLista();
  const container = document.getElementById('lista');
  let html = '';

  lista.forEach(function(item) {
    html += `
      <p>
        ${item.nome} - ${item.quantidade}
        <button onclick="editar('${item.id}')">Editar</button>
        <button onclick="excluir('${item.id}')">Excluir</button>
      </p>
    `;
  });

  container.innerHTML = html;
}

function adicionar() {
  const nome = document.getElementById('nome').value;
  const quantidade = document.getElementById('quantidade').value;

  if (nome && quantidade) {
    const lista = pegarLista();
    lista.push({
      id: Date.now().toString(),
      nome: nome,
      quantidade: quantidade
    });

    salvarLista(lista);
    mostrarLista();

    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '';
  }
}

function editar(id) {
  const lista = pegarLista();
  const item = lista.find(i => i.id === id);

  const novoNome = prompt('Novo nome:', item.nome);
  const novaQtd = prompt('Nova quantidade:', item.quantidade);

  if (novoNome && novaQtd) {
    item.nome = novoNome;
    item.quantidade = novaQtd;
    salvarLista(lista);
    mostrarLista();
  }
}

function excluir(id) {
  const novaLista = pegarLista().filter(i => i.id !== id);
  salvarLista(novaLista);
  mostrarLista();
}

mostrarLista();
