const dado1 = Math.floor(Math.random() * 6) + 1;
const dado2 = Math.floor(Math.random() * 6) + 1;

const imagem1 = "imagens/dado" + dado1 + ".png";
const imagem2 = "imagens/dado" + dado2 + ".png";

document.querySelectorAll("img")[0].setAttribute("src", imagem1);
document.querySelectorAll("img")[1].setAttribute("src", imagem2);

if (dado1 > dado2) {
  document.querySelector("h1").textContent = "🚩 O Jogador 1 Venceu!";
} else if (dado2 > dado1) {
  document.querySelector("h1").textContent = "O Jogador 2 Venceu! 🚩";
} else {
  document.querySelector("h1").textContent = "Empate!";
}
