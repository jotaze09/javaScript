let n1, n2 , opcao;

n1 = Number(prompt(" digite o primeiro numero"))
n2 = Number(prompt(" digite o segundo numero"))

let soma ;
let subtração;
let divisão;
let multiplicação;

console.log("----Operações----")
console.log("---1 - Adição---")
console.log("---2 - subtração---")
console.log("---3 - divisão---")
console.log("---4 - multiplicação---")

opcao = Number(prompt("Escolha uma opção: "));

switch (opcao) {
    case 1:
        alert (n1+n2)
        break;
    case 2:
        alert (n1-n2)
    break;
    case 3:
        alert (n1/n2)
        break;
    case 4:
        alert (n1*n2)
        break;
    default: 
        alert ("opção ivalida")
        break;
}





