const nomeInput = document.getElementById("nome");
const comecarBtn = document.getElementById("comecarBtn");
const jogoDiv = document.getElementById("jogo");
const inicioDiv = document.getElementById("inicio");
const fimDiv = document.getElementById("fim");
const boasVindas = document.getElementById("boasVindas");
const palpiteInput = document.getElementById("palpite");
const tentarBtn = document.getElementById("tentarBtn");
const mensagem = document.getElementById("mensagem");
const resultado = document.getElementById("resultado");
const jogarNovamenteBtn = document.getElementById("jogarNovamenteBtn");
const recordeTexto = document.getElementById("recorde");

let numeroSecreto;
let tentativas;
let nomeJogador;
let melhorJogador = "-";
let melhorTentativas = Infinity;

comecarBtn.addEventListener("click", () => {
  nomeJogador = nomeInput.value.trim();
  if (!nomeJogador) return;
  numeroSecreto = Math.ceil(Math.random() * 100);
  tentativas = 0;
  boasVindas.textContent = `Boa sorte, ${nomeJogador}!`;
  inicioDiv.classList.add("hidden");
  jogoDiv.classList.remove("hidden");
  mensagem.textContent = "";
  palpiteInput.value = "";
});

tentarBtn.addEventListener("click", () => {
  const palpite = Number(palpiteInput.value);
  if (!palpite || palpite < 1 || palpite > 100) {
    mensagem.textContent = "Digite um número válido entre 1 e 100.";
    return;
  }

  tentativas++;

  if (palpite < numeroSecreto) {
    mensagem.textContent = "🔼 Tente um número maior.";
  } else if (palpite > numeroSecreto) {
    mensagem.textContent = "🔽 Tente um número menor.";
  } else {
    let desempenho;
    if (tentativas < 3) {
      desempenho = "🧠 Gênio da adivinhação!";
    } else if (tentativas <= 6) {
      desempenho = "🚀 Muito bem!";
    } else {
      desempenho = "💪 Persistência é tudo!";
    }

    resultado.textContent = `Parabéns, ${nomeJogador}! Você acertou em ${tentativas} tentativa(s). ${desempenho}`;
    jogoDiv.classList.add("hidden");
    fimDiv.classList.remove("hidden");

    if (tentativas < melhorTentativas) {
      melhorTentativas = tentativas;
      melhorJogador = nomeJogador;
      recordeTexto.textContent = `🏅 Melhor jogador: ${melhorJogador} (${melhorTentativas} tentativa(s))`;
    }
  }

  palpiteInput.value = "";
});

jogarNovamenteBtn.addEventListener("click", () => {
  nomeInput.value = "";
  inicioDiv.classList.remove("hidden");
  jogoDiv.classList.add("hidden");
  fimDiv.classList.add("hidden");
});
