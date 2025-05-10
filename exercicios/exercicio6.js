let nome ;
let peso ;
let altura ;

nome = prompt("seu nome: ");
peso = prompt ("seu peso: ");
altura = prompt("sua altura: ");

imc = Math.round (peso / (altura*altura));

alert ('seu IMC e: ' +imc)