create database conexao;
use conexao;

CREATE TABLE album (
    id_album INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    nome_album VARCHAR(100) NOT NULL,
    data_lancamento DATE NOT NULL,
    genero_album VARCHAR(30) NOT NULL,
    nome_artista_album VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_album)
);

drop table album;
truncate table album;


CREATE INDEX album_index_0 ON album (id_album);

CREATE TABLE musica (
    id_musica INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    nome_musica VARCHAR(100) NOT NULL,
    duracao_musica TIME NOT NULL,
    genero_musica VARCHAR(30) NOT NULL,
    numero_musica INTEGER NOT NULL,
    nome_albumDaMusica varchar(30) NOT NULL,
    musica_arquivo longblob NOT NULL,
    id_album INTEGER,
    PRIMARY KEY (id_musica),
    FOREIGN KEY (id_album) REFERENCES album(id_album)
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

drop table musica;
truncate table musica;


CREATE TABLE artista (
    id_artista INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    nome_artista VARCHAR(50),
    data_nascimento DATE,
    PRIMARY KEY (id_artista)
);

drop table artista;
truncate table artista;


CREATE TABLE album_artista (
    id_album_artista INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    id_album INT NOT NULL,
    id_artista INTEGER NOT NULL,
    PRIMARY KEY (id_album_artista),
    FOREIGN KEY (id_album) REFERENCES album(id_album)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

drop table album_artista;
truncate table album_artista;


select * from album;
select * from musica;
select * from artista;