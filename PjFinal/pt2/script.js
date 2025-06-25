// URL da API para buscar os 20 primeiros Pokémons
const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20';

// Seletores dos elementos principais da página
const gradeDePokemons = document.getElementById('pokemon-cards'); // Onde os cards dos Pokémons serão exibidos
const containerLista = document.getElementById('shopping-list');  // Onde a lista de compras será exibida
const seletorFiltroStatus = document.getElementById('filterStatus'); // Select para filtrar por status
const contadorResumo = document.getElementById('counter'); // Exibe o resumo de quantidades

// Função utilitária para deixar a primeira letra maiúscula
const AumentarLetraTexto = texto => texto.charAt(0).toUpperCase() + texto.slice(1);

// Funções para manipular o localStorage (salvar e obter a lista de compras)
const ObterItensSalvos = () => JSON.parse(localStorage.getItem('listaDeCompras') || '[]');
const SalvarItens = itens => localStorage.setItem('listaDeCompras', JSON.stringify(itens));

// Função assíncrona para buscar os Pokémons da API e renderizar os cards
async function CarregarPokemons() {
  const resposta = await fetch(API_URL); // Busca a lista de Pokémons
  const dados = await resposta.json(); // Converte a resposta em JSON

  // Para cada Pokémon, busca os detalhes (incluindo tipos e imagem)
  const promessas = [];
  dados.results.forEach(p => {
    promessas.push(fetch(p.url).then(r => r.json())); // Adiciona a promessa de buscar detalhes de cada Pokémon
  });

  // Aguarda todas as requisições terminarem
  const pokemonsDetalhados = await Promise.all(promessas); // Espera todas as promessas serem resolvidas
  RenderizarCartoesDePokemon(pokemonsDetalhados); // Chama a função para renderizar os cards
}

// Renderiza os cards dos Pokémons na tela
function RenderizarCartoesDePokemon(pokemons) {
  let html = '';
  pokemons.forEach(pokemon => {
    const tipos = [];
    pokemon.types.forEach(t => tipos.push(t.type.name)); // Monta uma lista com os tipos do Pokémon

    html += `
      <div class="pokemon-card">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${AumentarLetraTexto(pokemon.name)}</h3>
        <p>Tipo: ${tipos.join(', ')}</p>
        <button onclick='AdicionarItemNaLista("${pokemon.name}", "${pokemon.types[0].type.name}")'>Adicionar</button>
      </div>
    `;
  });
  gradeDePokemons.innerHTML = html; // Insere os cards no HTML
}

// Adiciona um Pokémon à lista de compras
function AdicionarItemNaLista(nome, categoria) {
  const quantidade = parseInt(prompt('Digite a quantidade:', 1), 10); // Pergunta a quantidade ao usuário
  if (!quantidade || quantidade < 1) return; // Se não for válido, sai da função

  const itens = ObterItensSalvos(); // Busca a lista atual no localStorage
  let existente = null;

  // Verifica se o Pokémon já está na lista (mesmo nome e categoria)
  itens.forEach(i => {
    if (i.nome === AumentarLetraTexto(nome) && i.categoria === categoria) {
      existente = i; // Se encontrar, guarda o item existente
    }
  });

  // Se já existe, soma a quantidade; senão, adiciona novo item
  if (existente) {
    existente.quantidade = parseInt(existente.quantidade, 10) + quantidade; // Soma a quantidade
  } else {
    itens.push({
      id: Date.now().toString(), // Gera um ID único
      nome: AumentarLetraTexto(nome),
      quantidade,
      categoria,
      status: 'Pendente' // Todo novo item começa como pendente
    });
  }

  SalvarItens(itens); // Salva a lista atualizada no localStorage
  RenderizarListaDeCompras(); // Atualiza a exibição da lista
}

// Alterna o status de um item entre "Pendente" e "Comprado"
function AlternarStatusDoItem(id) {
  const itens = ObterItensSalvos(); // Busca a lista atual
  itens.forEach(i => {
    if (i.id === id) {
      i.status = i.status === 'Pendente' ? 'Comprado' : 'Pendente'; // Troca o status
    }
  });
  SalvarItens(itens); // Salva a lista atualizada
  RenderizarListaDeCompras(); // Atualiza a exibição
}

// Permite editar nome, quantidade e categoria de um item da lista
function EditarItemDaLista(id) {
  const itens = ObterItensSalvos(); // Busca a lista atual
  itens.forEach(i => {
    if (i.id === id) {
      const novoNome = prompt('Novo nome:', i.nome); // Pergunta novo nome
      const novaQtd = prompt('Nova quantidade:', i.quantidade); // Pergunta nova quantidade
      const novaCategoria = prompt('Nova categoria:', i.categoria); // Pergunta nova categoria

      // Só atualiza se todos os campos forem preenchidos
      if (novoNome && novaQtd && novaCategoria) {
        i.nome = novoNome;
        i.quantidade = novaQtd;
        i.categoria = novaCategoria;
      }
    }
  });
  SalvarItens(itens); // Salva a lista atualizada
  RenderizarListaDeCompras(); // Atualiza a exibição
}

// Remove um item da lista de compras
function ExcluirItemDaLista(id) {
  const itens = ObterItensSalvos().filter(i => i.id !== id); // Remove o item pelo id
  SalvarItens(itens); // Salva a lista atualizada
  RenderizarListaDeCompras(); // Atualiza a exibição
}

// Renderiza a lista de compras na tela, aplicando o filtro de status
function RenderizarListaDeCompras() {
  const itens = ObterItensSalvos(); // Busca a lista atual
  const statusSelecionado = seletorFiltroStatus.value; // Pega o status selecionado no filtro

  // Filtra os itens conforme o status selecionado no select
  const itensFiltrados = statusSelecionado === 'all'
    ? itens
    : itens.filter(i => i.status === statusSelecionado);

  let html = '';
  itensFiltrados.forEach(item => {
    html += `
      <div class="item-card">
        <h3>${item.nome}</h3>
        <p>Quantidade: ${item.quantidade}</p>
        <p>Categoria: ${item.categoria}</p>
        <p>Status: <span>${item.status}</span></p>
        <button onclick="AlternarStatusDoItem('${item.id}')">Marcar como ${item.status === 'Pendente' ? 'Comprado' : 'Pendente'}</button>
        <button onclick="EditarItemDaLista('${item.id}')">Editar</button>
        <button onclick="ExcluirItemDaLista('${item.id}')">Excluir</button>
      </div>
    `;
  });

  containerLista.innerHTML = html; // Atualiza o HTML da lista

  // Calcula e exibe o resumo de totais
  let pendentes = 0;
  let comprados = 0;
  itens.forEach(i => {
    if (i.status === 'Pendente') pendentes++; // Conta pendentes
    if (i.status === 'Comprado') comprados++; // Conta comprados
  });

  contadorResumo.textContent = `Total: ${itens.length} | Comprados: ${comprados} | Pendentes: ${pendentes}`; // Mostra o resumo
}

// Alterna o tema da página e salva a preferência no localStorage
function MudarTema() {
  document.body.classList.toggle('dark'); // Troca a classe do body
  const tema = document.body.classList.contains('dark') ? 'dark' : 'light'; // Define o tema atual
  localStorage.setItem('tema', tema); // Salva o tema no localStorage
  document.getElementById('toggleTheme').textContent = tema === 'dark' ? 'Modo Claro' : 'Modo Escuro'; // Atualiza o texto do botão
}

// Aplica o tema salvo ao carregar a página
function AplicarTemaSalvo() {
  const tema = localStorage.getItem('tema'); // Busca o tema salvo
  if (tema === 'dark') {
    document.body.classList.add('dark'); // Aplica o tema escuro
    document.getElementById('toggleTheme').textContent = 'Modo Claro';
  } else {
    document.body.classList.remove('dark'); // Aplica o tema claro
    document.getElementById('toggleTheme').textContent = 'Modo Escuro';
  }
}

// Eventos: filtro de status, botão de tema e carregamento inicial
seletorFiltroStatus.addEventListener('change', RenderizarListaDeCompras); // Atualiza a lista ao mudar o filtro
document.getElementById('toggleTheme').addEventListener('click', MudarTema); // Troca o tema ao clicar no botão
window.addEventListener('load', () => {
  AplicarTemaSalvo(); // Aplica o tema salvo ao carregar
  RenderizarListaDeCompras(); // Renderiza a lista ao carregar
});

// Inicia a busca dos Pokémons ao carregar a página
CarregarPokemons();
