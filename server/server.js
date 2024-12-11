const express = require('express');
const Conexao = require('./conexao.js');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração simples do Multer
const upload = multer({ storage: multer.memoryStorage() });

// Rota de criação de artista
app.post('/criar-artista', async (req, res) => {
    try {
        const { nome, data_nascimento } = req.body;
        const conn = new Conexao();
        const resultados = await conn.executarQuery(
            "INSERT INTO artista (nome_artista, data_nascimento) VALUES (?, ?);",
            [nome, data_nascimento]
        );
        res.status(200).send({ message: "Artista criado com sucesso", resultados });
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao criar artista" });
    }
});

// Rota de criação de álbum
app.post('/criar-album', async (req, res) => {
    const conn = new Conexao();
    try {
        const { nome_album, data_lancamento, genero_album, nome_artista_album } = req.body;
        if (!nome_album || !data_lancamento || !genero_album || !nome_artista_album) {
            throw new Error('Todos os campos são obrigatórios');
        }
        const resultadoAlbum = await conn.executarQuery(
            "INSERT INTO album (nome_album, data_lancamento, genero_album, nome_artista_album) VALUES (?, ?, ?, ?)",
            [nome_album, data_lancamento, genero_album, nome_artista_album]
        );
        const id_album = resultadoAlbum.insertId;
        res.status(200).send({ 
            message: "Álbum criado com sucesso", 
            album: {
                id_album,
                nome_album,
                data_lancamento,
                genero_album,
                nome_artista_album
            }
        });
    } catch (error) {
        res.status(500).send({ error: "Erro ao criar álbum" });
    } finally {
        await conn.fecharConexao();
    }
});

app.post('/criar-musica', upload.single('musica_arquivo'), async (req, res) => {
    try {
        const { nome_musica, duracao_musica, genero_musica, numero_musica, nome_albumDaMusica } = req.body;
        if (!req.file) {
            throw new Error('Nenhum arquivo de música foi enviado');
        }
        const conn = new Conexao();
        const [album] = await conn.executarQuery(
            "SELECT id_album FROM album WHERE nome_album = ?",
            [nome_albumDaMusica]
        );
        if (!album) {
            throw new Error('Álbum não encontrado');
        }
        const resultados = await conn.executarQuery(
            `INSERT INTO musica (nome_musica, duracao_musica, genero_musica, numero_musica, id_album, musica_arquivo, nome_albumDaMusica) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nome_musica, duracao_musica, genero_musica, numero_musica, album.id_album, req.file.buffer, nome_albumDaMusica]
        );
        res.status(200).send({ message: "Música criada com sucesso", resultados });
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao criar música" });
    }
});

// Rota para listar artistas
app.get('/artistas', async (req, res) => {
    try {
        const conn = new Conexao();
        const resultados = await conn.executarQuery("SELECT * FROM artista;");
        res.status(200).send(resultados);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar artistas" });
    }
});

// Rota para listar álbuns
app.get('/albums', async (req, res) => {
    try {
        const conn = new Conexao();
        const resultados = await conn.executarQuery("SELECT * FROM album ORDER BY id_album DESC");
        res.status(200).send(resultados);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar álbuns" });
    }
});

// Rota para listar músicas
app.get('/musicas', async (req, res) => {
    try {
        const conn = new Conexao();
        const resultados = await conn.executarQuery("SELECT * FROM musica;");
        res.status(200).send(resultados);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar músicas" });
    }
});

// Rota para buscar um álbum específico
app.get('/albums/:id', async (req, res) => {
    try {
        const conn = new Conexao();
        const resultados = await conn.executarQuery(
            "SELECT * FROM album WHERE id_album = ?",
            [req.params.id]
        );
        if (resultados.length === 0) {
            res.status(404).send({ error: "Álbum não encontrado" });
            return;
        }
        res.status(200).send(resultados[0]);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar álbum" });
    }
});

// Rota para buscar músicas de um álbum
app.get('/musicas/:albumId', async (req, res) => {
    try {
        const conn = new Conexao();
        const resultados = await conn.executarQuery(
            "SELECT * FROM musica WHERE id_album = ? ORDER BY numero_musica",
            [req.params.albumId]
        );
        res.status(200).send(resultados);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar músicas" });
    }
});

// Rota para tocar música
app.get('/musicas/play/:id', async (req, res) => {
    try {
        const conn = new Conexao();
        const [musica] = await conn.executarQuery(
            "SELECT musica_arquivo FROM musica WHERE id_musica = ?",
            [req.params.id]
        );
        if (!musica || !musica.musica_arquivo) {
            res.status(404).send({ error: "Música não encontrada" });
            return;
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(musica.musica_arquivo);
        await conn.fecharConexao();
    } catch (error) {
        res.status(500).send({ error: "Erro ao buscar música" });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
