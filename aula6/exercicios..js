//exercicio 1
function criarUsuario(nome, idade, email) {
  return {
    nome: nome,
    idade: idade,
    email: email
  };
}

const usuario = criarUsuario("Jorge", 17, "jorginho@hotmail.com");
console.log(usuario);

//exercicio 2
const usuario2 = {
  nome: "Jorge",
  idade: 17,
  email: "jorginho@hotmail.com"
};

function atualizarIdade(usuario, novaIdade) {
  usuario.idade = novaIdade;
  return usuario;
}
const usuarioNovo = atualizarIdade(usuario2, 18);
console.log(usuarioNovo.idade);



