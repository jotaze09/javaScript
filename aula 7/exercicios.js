<!-- Exercício1 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 1</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 80px;
            background-color: #f5f5f5;
        }

        p {
            font-size: 1.2rem;
            color: #333;
            background-color: #e1f5fe;
            display: inline-block;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1rem;
            background-color: #0288d1;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0277bd;
        }
    </style>
</head>
<body>
    <p id="mensagem">Texto original.</p>
    <br>
    <button onclick="alterarTexto()">Clique aqui</button>

    <script>
        function alterarTexto() {
            document.getElementById("mensagem").innerText = "Texto alterado com sucesso!";
        }
    </script>
</body>
</html>

<!-- Exercicio2 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 2</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 60px;
            background-color: #f9f9f9;
        }

        ul {
            display: inline-block;
            text-align: left;
            padding: 20px;
            background-color: #e3f2fd;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        li {
            font-size: 1.1rem;
            margin: 6px 0;
            padding: 4px 8px;
            background-color: #ffffff;
            border-radius: 4px;
        }

        button {
            margin-top: 25px;
            padding: 10px 20px;
            font-size: 1rem;
            background-color: #039be5;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0288d1;
        }
    </style>
</head>
<body>
    <ul>
        <li class="item">Item A</li>
        <li class="item">Item B</li>
        <li class="item">Item C</li>
    </ul>
    <br>
    <button onclick="substituirLista()">Atualizar Lista</button>

    <script>
        function substituirLista() {
            const itens = document.querySelectorAll(".item");
            itens.forEach((item, index) => {
                item.innerText = "Item " + (index + 1);
            });
        }
    </script>
</body>
</html>

<!-- Exercicio3 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 3</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 80px;
            background-color: #f0f4f8;
        }

        #destaque {
            font-size: 18px;
            padding: 15px 20px;
            background-color: #ffffff;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: inline-block;
            transition: all 0.3s ease;
        }

        button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1rem;
            background-color: #1976d2;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #1565c0;
        }
    </style>
</head>
<body>
    <p id="destaque">Texto em destaque.</p>
    <br>
    <button onclick="estilizarParagrafo()">Estilizar</button>

    <script>
        function estilizarParagrafo() {
            const paragrafo = document.getElementById('destaque');
            paragrafo.style.color = '#00FFFF';
            paragrafo.style.fontFamily = 'Courier New, monospace';
            paragrafo.style.backgroundColor = 'black';

            const body = document.getElementsByTagName('body')[0];
            body.style.backgroundColor = 'black';
        }
    </script>
</body>
</html>

<!-- Exercicio4 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 4</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 80px;
            background-color: #f0f0f0;
        }

        a#meuLink {
            display: inline-block;
            margin-bottom: 20px;
            text-decoration: none;
            color: #0d47a1;
            font-size: 18px;
            padding: 10px 15px;
            border: 2px dashed #90caf9;
            border-radius: 8px;
            transition: background 0.3s, color 0.3s;
        }

        a#meuLink:hover {
            background-color: #e3f2fd;
            color: #1565c0;
        }

        button {
            padding: 10px 20px;
            font-size: 1rem;
            background-color: #1976d2;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #1565c0;
        }
    </style>
</head>
<body>
    <a id="meuLink">Clique aqui para saber mais</a>
    <br><br>
    <button onclick="definirLink()">Definir Link</button>

    <script>
        function definirLink() {
            const link = document.getElementById('meuLink');
            link.href = 'https://github.com/nicollas-provatti/JavaScript/blob/main/Aula%2007/Exerc%C3%ADcios.md';
            link.innerText = 'ir para o GitHub';
        }
    </script>
</body>
</html>

<!-- Exercicio5 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 5</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 80px;
            background-color: #f9f9f9;
        }

        #texto {
            font-size: 1.2rem;
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border: 2px solid #ddd;
            border-radius: 8px;
            transition: background-color 0.3s, font-weight 0.3s;
        }

        .destaque {
            background-color: yellow;
            font-weight: bold;
        }

        button {
            padding: 10px 20px;
            margin: 10px 5px;
            font-size: 1rem;
            background-color: #1976d2;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #1565c0;
        }
    </style>
</head>
<body>
    <p id="texto">Use os botões para adicionar e remover o destaque do texto.</p>
    <button onclick="destacarTexto()">Adicionar</button>
    <button onclick="removerDestaque()">Remover</button>

    <script>
        function destacarTexto() {
            const texto = document.getElementById('texto');
            texto.classList.add('destaque');
        }

        function removerDestaque() {
            const texto = document.getElementById('texto');
            texto.classList.remove('destaque');
        }
    </script>
</body>
</html>

<!-- Exercicio6 -->

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Exercício 6</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            transition: background-color 0.3s, color 0.3s;
            font-family: Arial, sans-serif;
        }

        .container {
            width: 100vw;
            height: 100vh;
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            background-color: #f0f0f0;
            color: #222;
            transition: background-color 0.3s, color 0.3s;
        }

        .escuro {
            background-color: #1e1e1e;
            color: #f9f9f9;
        }

        ul {
            padding-left: 20px;
        }

        li {
            margin-bottom: 8px;
            font-size: 1.1rem;
        }

        button {
            padding: 12px 24px;
            font-size: 16px;
            background-color: #1976d2;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bem-vindo ao Exercício de Tema</h1>
        <p>Este é um exemplo de página onde você pode alternar entre o tema claro e escuro.</p>

        <ul>
            <li>Item 1: Aprender HTML</li>
            <li>Item 2: Estilizar com CSS</li>
            <li>Item 3: Interagir com JavaScript</li>
        </ul>

        <button onclick="alternarTema()">Alternar Tema</button>
    </div>

    <script>
        function alternarTema() {
            const container = document.querySelector('.container');
            container.classList.toggle('escuro');
        }
    </script>
</body>
</html>
