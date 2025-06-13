const botoes = document.querySelectorAll(".botao-bateria");

botoes.forEach(botao => {
  botao.addEventListener("click", function () {
    const tecla = this.innerText.toLowerCase();
    reproduzirSom(tecla);
    animarBotao(tecla);
  });
});

document.addEventListener("keydown", function (event) {
  const tecla = event.key.toLowerCase();
  reproduzirSom(tecla);
  animarBotao(tecla);
});

function reproduzirSom(tecla) {
  let audio;
  switch (tecla) {
    case "w":
      audio = new Audio("sons/tom-1.mp3");
      break;
    case "a":
      audio = new Audio("sons/tom-2.mp3");
      break;
    case "s":
      audio = new Audio("sons/tom-3.mp3");
      break;
    case "d":
      audio = new Audio("sons/tom-4.mp3");
      break;
    case "j":
      audio = new Audio("sons/caixa.mp3");
      break;
    case "k":
      audio = new Audio("sons/crash.mp3");
      break;
    case "l":
      audio = new Audio("sons/kick-bass.mp3");
      break;
    default:
      return;
  }
  audio.play();
}

function animarBotao(tecla) {
  const botaoAtivo = document.querySelector(`.${tecla}`);
  if (botaoAtivo) {
    botaoAtivo.classList.add("pressionado");
    setTimeout(() => {
      botaoAtivo.classList.remove("pressionado");
    }, 100);
  }
}
