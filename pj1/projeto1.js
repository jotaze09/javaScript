alert("🎉 Bem-vindo ao Jogo da Adivinhação!");

const ranking = [];

let jogarNovamente = "sim";

while (jogarNovamente.toLowerCase() === "sim") {
  const nomeJogador = prompt("Qual o seu nome, jogador?");
  const dificuldade = prompt("Escolha a dificuldade: fácil (1-100) ou difícil (1-500)").toLowerCase();
  const maxNumero = dificuldade === "difícil" ? 500 : 100;
  const numeroSorteado = Math.ceil(Math.random() * maxNumero);

  alert(`Olá, ${nomeJogador}! Preparando o jogo...\nUm número de 1 a ${maxNumero} foi sorteado!`);

  let tentativas = 0;
  let acertou = false;

  while (!acertou && tentativas < 10) {
    const palpite = Number(prompt(`Tentativa ${tentativas + 1}/10: Digite seu palpite:`));
    tentativas++;

    if (isNaN(palpite) || palpite < 1 || palpite > maxNumero) {
      alert(`Digite um número válido entre 1 e ${maxNumero}.`);
      tentativas--; // ignora tentativa inválida
      continue;
    }

    if (palpite === numeroSorteado) {
      acertou = true;
    } else if (palpite < numeroSorteado) {
      alert("Tente um número MAIOR.");
    } else {
      alert("Tente um número MENOR.");
    }
  }

  if (acertou) {
    let mensagemFinal = `Parabéns, ${nomeJogador}! Você acertou em ${tentativas} tentativa(s).\n`;

    if (tentativas <= 3) {
      mensagemFinal += "Uau! Você é um gênio da adivinhação! 🧠";
    } else if (tentativas <= 6) {
      mensagemFinal += "Muito bem! Você foi rápido! 🚀";
    } else {
      mensagemFinal += "Conseguiu! Persistência é tudo! 💪";
    }

    alert(mensagemFinal);

    ranking.push({ nome: nomeJogador, tentativas });
    ranking.sort((a, b) => a.tentativas - b.tentativas);
    if (ranking.length > 3) ranking.pop();

    if (ranking[0].nome === nomeJogador && ranking[0].tentativas === tentativas) {
      alert(`🏆 Novo recorde! ${nomeJogador} é o melhor jogador com ${tentativas} tentativa(s).`);
    }
  } else {
    alert(`💥 Acabaram suas 10 tentativas! O número era: ${numeroSorteado}`);
  }

  jogarNovamente = prompt("Deseja jogar novamente? (sim/não)").toLowerCase();
}

if (ranking.length > 0) {
  let resumo = "🎮 Jogo encerrado!\n🏅 Ranking dos melhores jogadores:\n";
  ranking.forEach((jogador, i) => {
    resumo += `${i + 1}º - ${jogador.nome} (${jogador.tentativas} tentativa(s))\n`;
  });
  alert(resumo);
} else {
  alert("Até a próxima!");
}
