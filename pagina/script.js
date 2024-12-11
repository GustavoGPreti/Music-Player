document.addEventListener("DOMContentLoaded", function () {
    const formTipo = document.getElementById("form-tipo");
    const forms = document.querySelectorAll(".formulario");

    function mostrarFormulario() {
        forms.forEach(form => form.style.display = "none");
        const formSelecionado = document.getElementById(formTipo.value);
        if (formSelecionado) {
            formSelecionado.style.display = "block";
        }
    }

    function blobToString(blob, callback) {
        const reader = new FileReader();
      
        reader.onload = function(event) {
          callback(event.target.result); // Retorna o conteúdo do blob como string
        };
      
        reader.onerror = function(error) {
          console.error('Erro ao ler o blob:', error);
        };
      
        reader.readAsText(blob); // Converte o blob para texto
      }

    formTipo.addEventListener("change", mostrarFormulario);
    mostrarFormulario(); // Exibir o formulário padrão ao carregar a página

    class Album {
        constructor(nome, data_lancamento, genero) {
            this.nome = nome;
            this.data_lancamento = data_lancamento;
            this.genero = genero;
        }
    }

    class Artista {
        constructor(nome, data_nasc) {
            this.nome = nome;
            this.data_nasc = data_nasc;
        }
    }

    class Musica {
        constructor(nome, duracao, genero, numero, album) {
            this.nome = nome;
            this.duracao = duracao;
            this.genero = genero;
            this.numero = numero;
            this.album = album;
        }
    }

    let lista_artista = [];
    let lista_album = [];
    let lista_musica = [];

    const selectArtista = document.querySelector("#artista-album");
    const nomeAlbumSelect = document.querySelector("#nome-album-da-musica");

    async function atualizarSelect(selectElement, lista, propriedade) {
        switch (selectElement) {
            case selectArtista: {
                selectArtista.innerHTML = "";
                const res = await fetch("http://localhost:3000/artistas").then((res) => res.ok ? res.json() : null);;
                let nome_artistas = res.map((valor) => valor.nome_artista);
                lista_artista = nome_artistas


                lista_artista.forEach((item, index) => {

                    const option = document.createElement("option");
                    option.value = index;
                    option.innerText = item;
                    selectArtista.appendChild(option);
                });

            }
            case nomeAlbumSelect: {
                nomeAlbumSelect.innerHTML = "";
                const res = await fetch("http://localhost:3000/albums").then((res) => res.ok ? res.json() : null);;

                let nome_albums = res.map((valor) => valor.nome_album);
                lista_album = nome_albums
                console.log(lista_album);

                lista_album.forEach((item, index) => {
                    console.log(item);
                    const option = document.createElement("option");
                    option.value = index;
                    option.innerText = item;
                    nomeAlbumSelect.appendChild(option);
                });
            }
            default:
                break;
        }
    }

    document.querySelector("#cadastro-artista input[type='button']").addEventListener("click", function () {
        const nomeArtista = document.querySelector("#nome-artista").value;
        const dataNascimento = document.querySelector("#data-nascimento").value;

        if (!nomeArtista || !dataNascimento) {
            alert("Por favor, preencha todos os campos do artista.");
            return;
        }

        const artista = new Artista(nomeArtista, dataNascimento);
        lista_artista.push(artista);

        fetch("http://localhost:3000/criar-artista", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nomeArtista,
                data_nascimento: dataNascimento
            })
        })
            .then(result => result.json())
            .then(data => console.log(data))
            .catch(error => console.error("Erro ao criar artista:", error));

        atualizarSelect(selectArtista, lista_artista, "nome");
    });

    document.querySelector("#cadastro-album input[type='button']").addEventListener("click", function () {
        const nomeAlbum = document.querySelector("#nome-album").value;
        const dataLancamento = document.querySelector("#data-lancamento").value;
        const generoAlbum = document.querySelector("#genero-album").value;

        const artistaIndex = parseInt(selectArtista.value);
        if (artistaIndex === "" || !lista_artista[artistaIndex]) {
            alert("Selecione um artista válido para o álbum.");
            return;
        }

        const artistaSelecionado = lista_artista[artistaIndex];
        const album = new Album(nomeAlbum, dataLancamento, generoAlbum);
        lista_album.push(album);

        fetch("http://localhost:3000/criar-album", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_album: nomeAlbum,
                data_lancamento: dataLancamento,
                genero_album: generoAlbum,
                nome_artista_album: artistaSelecionado.nome
            })
        })
            .then(result => result.json())
            .then(data => console.log(data))
            .catch(error => console.error("Erro ao criar álbum:", error));

        atualizarSelect(nomeAlbumSelect, lista_album, "nome");
    });

    document.querySelector("#cadastro-musica input[type='button']").addEventListener("click", async function () {
        const nomeMusica = document.querySelector("#nome-musica").value;
        const duracaoMusica = document.querySelector("#duracao").value;
        const generoMusica = document.querySelector("#genero-musica").value;
        const numeroMusica = document.querySelector("#numero-musica").value;
        let arquivoMusica = document.querySelector("#arquivo-musica").files[0];

        const albumIndex = parseInt(nomeAlbumSelect.value);
        if (albumIndex === "" || !lista_album[albumIndex]) {
            alert("Selecione um álbum válido para a música.");
            return;
        }

        const albumSelecionado = lista_album[albumIndex];
        const musica = new Musica(nomeMusica, duracaoMusica, generoMusica, numeroMusica, albumSelecionado.nome);
        lista_musica.push(musica);

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64String = event.target.result.split(',')[1]; // Converte para base64
            console.log(base64String);
            fetch("http://localhost:3000/criar-musica", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome_musica: nomeMusica,
                    duracao_musica: duracaoMusica,
                    genero_musica: generoMusica,
                    numero_musica: numeroMusica,
                    nome_albumDaMusica: albumSelecionado.nome,
                    musica_arquivo: base64String
                })
            })
                .then(result => result.json())
                .then(data => console.log(data))
                .catch(error => console.error("Erro ao criar música:", error));
        };
        reader.readAsDataURL(arquivoMusica); // Lê o arquivo como Data URL
    });
    atualizarSelect(selectArtista, [], "nome");
});
