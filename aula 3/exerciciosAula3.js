//exercicio 1
let anoAtual;
let anoNacimento;

anoAtual = prompt ("qual e o ano atual ?")
anoNacimento= prompt ("qual e o ano que vc nasceu ?")

let idade = ( anoAtual-anoNacimento);


if (idade>=18) {
    alert ("voce pode tirar habilitação")
} else {
    alert ("vc não pode tirar a carteira")
}

//exercicio 2

let idade = parseInt(prompt("Qual a sua idade ?"));

if (idade >= 65) {
    console.log("Você é um idoso.");
} else if (idade >= 18) {
    console.log("Você é um adulto.");
} else if (idade >= 13) {
    console.log("Você é um adolescente.");
} else {
    console.log("Você é uma criança.");
}

//exercicio 3
let altura ; 
let peso ;

altura = prompt("qual a sua altura ? ")
peso = prompt("qual a seu peso ? ")
const IMC = peso / (altura * altura)
if (IMC<= 18.5) {
    alert ("seu IMC e " + IMC + ", ele está abaixo do normal")
} else if (IMC>=18.6 && IMC< 24.9) {
    alert ("seu IMC e " + IMC + ", ele está na faixa do normal")
} else if (IMC>=25 && IMC< 29.9) {
    alert ("seu IMC e " + IMC + ", ele está acima do normal")
} else if (IMC>=30 && IMC< 34.9) {
    alert ("seu IMC e " + IMC + ", ele está na faixa da obesidade grau 1")
} else if (IMC>=35 && IMC< 39.9) {
    alert ("seu IMC e " + IMC + ", ele está na faixa da obesidade grau 2")
} else {
    alert ("seu IMC e " + IMC + ", ele está na faixa da obesidade grau 3")
}
//exercicio 4
let n1, n2 , opcao;

n1 = Number(prompt(" digite o primeiro numero"))
n2 = Number(prompt(" digite o segundo numero"))

let soma = n1 + n2;
let subtração = n1 - n2;
let divisão = n1 / n2;
let multiplicação = n1 * n2;

console.log("----Operações----")
console.log("---1 - Adição---")
console.log("---2 - subtração---")
console.log("---3 - divisão---")
console.log("---4 - multiplicação---")

opcao = Number(prompt("Escolha uma opção: "));

switch (opcao) {
    case 1:
        alert (soma)
        break;
    case 2:
        alert (subtração)
    break;
    case 3:
        alert (divisão)
        break;
    case 4:
        alert (multiplicação)
        break;
    default: 
        alert ("opção ivalida")
        break;
}
//exercicio 5

let qntdNmeros1;
let qntdNmeros2;
qntdNmeros1 = Number(prompt ("digite um numero: "))
qntdNmeros2 = Number(prompt ("digite um numero: "))



for (let contador = qntdNmeros1; contador <=qntdNmeros2; contador++){
   console.log (contador)
}

// exercicio 6

let N = parseInt(prompt("Digite um número inteiro N: "));
let soma = 0;


for (let i = 1; i <= N; i++) {

    if (i % 2 === 0) { 
        soma += i; 
    }
}

console.log("A soma dos números pares de 1 até " + N + " é: " + soma);

//exercicio 7
let positivos = 0;
let negativos = 0;
let numero = 1;

while (numero !== 0) {
    numero = parseInt(prompt("Digite um número:"));

    if (numero > 0) {
        positivos++;
    } else if (numero < 0) {
        negativos++;
    }
}

console.log("Quantidade de números positivos: " + positivos);
console.log("Quantidade de números negativos: " + negativos);

//exercicio 8

const senhaCorreta = "1234";
let senhaDigitada;

do {
    senhaDigitada = prompt("Digite a senha:"); 
    if (senhaDigitada !== senhaCorreta) { 
        alert("Senha incorreta."); 
    } 
} while (senhaDigitada !== senhaCorreta); 
 
alert("Acesso liberado."); 
























