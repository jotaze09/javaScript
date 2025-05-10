let estoque;
let remover;
estoque = prompt ('qual seu estoque? ');
remover = prompt ('quanto vai tirar do estoque? ');
estoqueAtual = (estoque - remover)
if (estoqueAtual<=0) {
    alert ('estoque insuficiente')
} else {
    alert ('seu estoque agora e: ' +estoqueAtual)
}
