let currentIndex = 0;
let albums = [];
let currentSong = null;
let isPlaying = false;
let currentMusicList = [];
let audioElement = new Audio();
let isShuffled = false;
let repeatMode = 'none';
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
let lastVolume = 1;

// Funcionalidade de pesquisa
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchTimeout;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            // Buscar álbuns
            const albumsResponse = await fetch('http://localhost:3000/albums');
            const albums = await albumsResponse.json();

            // Buscar todas as músicas
            const musicasResponse = await fetch('http://localhost:3000/musicas');
            const musicas = await musicasResponse.json();

            // Filtrar resultados
            const filteredAlbums = albums.filter(album => 
                album.nome_album.toLowerCase().includes(query.toLowerCase()) ||
                album.nome_artista_album.toLowerCase().includes(query.toLowerCase()) ||
                album.genero_album.toLowerCase().includes(query.toLowerCase())
            );

            const filteredMusicas = musicas.filter(musica => 
                musica.nome_musica.toLowerCase().includes(query.toLowerCase()) ||
                musica.genero_musica.toLowerCase().includes(query.toLowerCase())
            );

            // Combinar e limitar resultados
            const results = [
                ...filteredAlbums.map(album => ({
                    type: 'album',
                    title: album.nome_album,
                    subtitle: album.nome_artista_album,
                    id: album.id_album
                })),
                ...filteredMusicas.map(musica => ({
                    type: 'musica',
                    title: musica.nome_musica,
                    subtitle: musica.nome_albumDaMusica,
                    id: musica.id_musica
                }))
            ].slice(0, 8);

            // Mostrar resultados
            if (results.length > 0) {
                searchResults.innerHTML = results.map(result => `
                    <div class="search-item" onclick="handleSearchResult('${result.type}', ${result.id})">
                        <img src="./asents/img/download (4).jpeg" alt="${result.title}">
                        <div class="search-item-info">
                            <div class="search-item-title">${result.title}</div>
                            <div class="search-item-subtitle">${result.subtitle}</div>
                        </div>
                        <span class="search-item-type">${result.type === 'album' ? 'Álbum' : 'Música'}</span>
                    </div>
                `).join('');
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = `
                    <div class="search-item">
                        <div class="search-item-info">
                            <div class="search-item-title">Nenhum resultado encontrado</div>
                        </div>
                    </div>
                `;
                searchResults.classList.add('active');
            }
        } catch (error) {
            searchResults.innerHTML = `
                <div class="search-item">
                    <div class="search-item-info">
                        <div class="search-item-title">Erro ao buscar resultados</div>
                    </div>
                </div>
            `;
            searchResults.classList.add('active');
        }
    }, 300);
});

// Fechar resultados ao clicar fora
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Lidar com seleção de resultado
async function handleSearchResult(type, id) {
    if (type === 'album') {
        // Encontrar o índice do álbum
        const albumIndex = albums.findIndex(album => album.id_album === id);
        if (albumIndex !== -1) {
            currentIndex = albumIndex;
            displayAlbum(currentIndex);
        }
    } else {
        // Carregar música diretamente
        try {
            const response = await fetch(`http://localhost:3000/musicas/${id}`);
            if (!response.ok) throw new Error('Erro ao buscar música');
            const musica = await response.json();
            if (musica) {
                loadSong(musica);
            }
        } catch (error) {
            console.error('Erro ao carregar música:', error);
        }
    }
    searchResults.classList.remove('active');
    searchInput.value = '';
}

async function fetchAlbums() {
    try {
        const response = await fetch('http://localhost:3000/albums');
        if (!response.ok) throw new Error('Erro ao buscar álbuns');
        albums = await response.json();
        if (albums.length > 0) {
            displayAlbum(currentIndex);
        } else {
            displayEmptyState();
        }
    } catch (error) {
        displayError();
    }
}

function displayAlbum(index) {
    if (albums.length === 0) return;
    
    const album = albums[index];
    updateMusicList(album.id_album);
    
    document.getElementById('nome_album').innerHTML = `Nome do Álbum: <span>${album.nome_album}</span>`;
    document.getElementById('nome_artista').innerHTML = `Artista: <span>${album.nome_artista_album}</span>`;
    document.getElementById('genero').innerHTML = `Gênero: <span>${album.genero_album}</span>`;
    document.getElementById('duracao').innerHTML = `Duração: <span>Carregando...</span>`;
    document.getElementById('num_musicas').innerHTML = `Quantidade de músicas: <span>Carregando...</span>`;

    // Buscar músicas do álbum
    fetch(`http://localhost:3000/musicas/${album.id_album}`)
        .then(response => response.ok ? response.json() : [])
        .then(musicas => {
            // Atualizar número de músicas
            document.getElementById('num_musicas').innerHTML = `Quantidade de músicas: <span>${musicas.length}</span>`;

            // Calcular duração total
            if (musicas.length > 0) {
                const duracaoTotal = musicas.reduce((total, musica) => {
                    const [minutes, seconds] = musica.duracao_musica.split(':').map(Number);
                    return total + minutes * 60 + seconds;
                }, 0);

                const totalMinutes = Math.floor(duracaoTotal / 60);
                const totalSeconds = duracaoTotal % 60;
                const duracaoFormatada = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
                document.getElementById('duracao').innerHTML = `Duração: <span>${duracaoFormatada}</span>`;
            } else {
                document.getElementById('duracao').innerHTML = `Duração: <span>-</span>`;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar músicas:', error);
            document.getElementById('duracao').innerHTML = `Duração: <span>-</span>`;
            document.getElementById('num_musicas').innerHTML = `Quantidade de músicas: <span>-</span>`;
        });
}

function displayEmptyState() {
    const elements = ['nome_album', 'nome_artista', 'genero', 'duracao', 'num_musicas'];
    elements.forEach(id => {
        document.getElementById(id).innerHTML = `${document.getElementById(id).innerHTML.split(':')[0]}: <span>-</span>`;
    });
}

function displayError() {
    const elements = ['nome_album', 'nome_artista', 'genero', 'duracao', 'num_musicas'];
    elements.forEach(id => {
        document.getElementById(id).innerHTML = `${document.getElementById(id).innerHTML.split(':')[0]}: <span>Erro ao carregar</span>`;
    });
}

document.getElementById('anterior').addEventListener('click', () => {
    if (albums.length === 0) return;
    currentIndex = (currentIndex - 1 + albums.length) % albums.length;
    displayAlbum(currentIndex);
});

document.getElementById('proximo').addEventListener('click', () => {
    if (albums.length === 0) return;
    currentIndex = (currentIndex + 1) % albums.length;
    displayAlbum(currentIndex);
});

// Carregar álbuns ao iniciar
fetchAlbums();

function updatePlayerUI(song) {
    document.getElementById('current-song-name').textContent = song ? song.nome_musica : 'Selecione uma música';
    document.getElementById('current-song-artist').textContent = song ? albums[currentIndex].nome_artista_album : '-';
    document.getElementById('current-song-image').src = './asents/img/download (4).jpeg';
}

function togglePlayPause() {
    const playPauseButton = document.getElementById('play-pause');
    const icon = playPauseButton.querySelector('i');
    const currentSongDiv = document.querySelector('.current-song');

    if (!currentSong) return;

    if (isPlaying) {
        audioElement.pause();
        icon.className = 'fas fa-play';
        currentSongDiv.classList.remove('playing');
    } else {
        audioElement.play();
        icon.className = 'fas fa-pause';
        currentSongDiv.classList.add('playing');
    }
    
    isPlaying = !isPlaying;
}

function updateProgress() {
    const progress = document.querySelector('.progress');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    const progressBar = document.querySelector('.progress-bar');

    // Limpar listeners anteriores para evitar duplicação
    audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);

    function handleTimeUpdate() {
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progress.style.width = `${percent}%`;
            currentTime.textContent = formatTime(audioElement.currentTime);
        }
    }

    function handleLoadedMetadata() {
        totalTime.textContent = formatTime(audioElement.duration);
    }

    // Adicionar os novos listeners
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Permitir clique na barra de progresso para mudar a posição
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        if (audioElement.duration) {
            audioElement.currentTime = clickPosition * audioElement.duration;
        }
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function loadSong(song) {
    if (!song) return;
    currentSong = song;
    audioElement.src = `http://localhost:3000/musicas/play/${song.id_musica}`;
    updatePlayerUI(song);
    updateProgress();
    audioElement.volume = volumeSlider.value / 100;
    
    const currentSongDiv = document.querySelector('.current-song');
    if (isPlaying) {
        audioElement.play()
            .then(() => {
                currentSongDiv.classList.add('playing');
            })
            .catch(error => {
                isPlaying = false;
                currentSongDiv.classList.remove('playing');
                document.getElementById('play-pause').querySelector('i').className = 'fas fa-play';
            });
    } else {
        currentSongDiv.classList.remove('playing');
    }
}

function toggleShuffle() {
    const shuffleButton = document.getElementById('shuffle');
    isShuffled = !isShuffled;
    shuffleButton.classList.toggle('active', isShuffled);
}

function toggleRepeat() {
    const repeatButton = document.getElementById('repeat');
    switch (repeatMode) {
        case 'none':
            repeatMode = 'one';
            repeatButton.classList.add('active');
            break;
        case 'one':
            repeatMode = 'all';
            repeatButton.classList.add('active');
            break;
        case 'all':
            repeatMode = 'none';
            repeatButton.classList.remove('active');
            break;
    }
}

function playNextSong() {
    if (!currentMusicList.length) return;

    let nextIndex;
    if (isShuffled) {
        nextIndex = Math.floor(Math.random() * currentMusicList.length);
    } else {
        nextIndex = currentMusicList.indexOf(currentSong) + 1;
        if (nextIndex >= currentMusicList.length) {
            nextIndex = 0;
        }
    }

    loadSong(currentMusicList[nextIndex]);
}

function playPreviousSong() {
    if (!currentMusicList.length) return;

    let prevIndex = currentMusicList.indexOf(currentSong) - 1;
    if (prevIndex < 0) {
        prevIndex = currentMusicList.length - 1;
    }

    loadSong(currentMusicList[prevIndex]);
}

// Event Listeners
document.getElementById('play-pause').addEventListener('click', togglePlayPause);
document.getElementById('next-song').addEventListener('click', playNextSong);
document.getElementById('previous-song').addEventListener('click', playPreviousSong);
document.getElementById('shuffle').addEventListener('click', toggleShuffle);
document.getElementById('repeat').addEventListener('click', toggleRepeat);

// Remover o listener antigo do progress-bar
document.querySelector('.progress-bar').removeEventListener('click', null);

audioElement.addEventListener('ended', () => {
    switch (repeatMode) {
        case 'one':
            audioElement.play();
            break;
        case 'all':
            playNextSong();
            break;
        default:
            if (currentMusicList.indexOf(currentSong) === currentMusicList.length - 1) {
                isPlaying = false;
                document.getElementById('play-pause').querySelector('i').className = 'fas fa-play';
            } else {
                playNextSong();
            }
    }
});

// Atualizar a lista de músicas quando um álbum é selecionado
async function updateMusicList(albumId) {
    try {
        const response = await fetch(`http://localhost:3000/musicas/${albumId}`);
        if (!response.ok) throw new Error('Erro ao buscar músicas');
        currentMusicList = await response.json();
        
        if (currentMusicList.length > 0) {
            loadSong(currentMusicList[0]);
        }
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
    }
}

function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute volume-icon';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down volume-icon';
    } else {
        volumeIcon.className = 'fas fa-volume-up volume-icon';
    }
}

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audioElement.volume = volume;
    lastVolume = volume;
    updateVolumeIcon(volume);
});

volumeIcon.addEventListener('click', () => {
    if (audioElement.volume > 0) {
        audioElement.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
    } else {
        audioElement.volume = lastVolume;
        volumeSlider.value = lastVolume * 100;
        updateVolumeIcon(lastVolume);
    }
});

// Adicionar listener para atualizar o tempo total quando o áudio estiver pronto
audioElement.addEventListener('canplay', () => {
    document.getElementById('total-time').textContent = formatTime(audioElement.duration);
});

// Atualizar o tempo atual continuamente
audioElement.addEventListener('timeupdate', () => {
    document.getElementById('current-time').textContent = formatTime(audioElement.currentTime);
});

// Atualizar o tempo total quando os metadados estiverem carregados
audioElement.addEventListener('loadedmetadata', () => {
    document.getElementById('total-time').textContent = formatTime(audioElement.duration);
});

// Adicionar atalhos de teclado
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
        playPreviousSong();
    } else if (e.code === 'ArrowRight') {
        playNextSong();
    } else if (e.code === 'ArrowUp') {
        const newVolume = Math.min(1, audioElement.volume + 0.1);
        audioElement.volume = newVolume;
        volumeSlider.value = newVolume * 100;
        updateVolumeIcon(newVolume);
    } else if (e.code === 'ArrowDown') {
        const newVolume = Math.max(0, audioElement.volume - 0.1);
        audioElement.volume = newVolume;
        volumeSlider.value = newVolume * 100;
        updateVolumeIcon(newVolume);
    }
});
