//exercicio 1
let anoAtual;
let anoNacimento;

anoAtual = prompt ("qual e o ano atual ?")
anoNacimento= prompt ("qual e o ano que vc nasceu ?")

let idade = ( anoAtual-anoNacimento);


if (idade>=18) {
    alert ("voce pode tirar habilitação")
} else {
    alert = ("vc não pode tirar a carteira")
}
