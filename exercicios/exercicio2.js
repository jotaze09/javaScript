let valor;
let descontoAplicado;
valor = prompt ("qual o valor da sua compra ?");

if (descontoAplicado>=100) {
    descontoAplicado = 10
} else {
    descontoAplicado = 5
}
let total = (valor / 100 * descontoAplicado);
let valorFinal = (valor - total);
alert (valorFinal);



