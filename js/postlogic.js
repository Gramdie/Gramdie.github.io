// 1. CONFIGURAÇÃO DA SUA API
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// 2. ELEMENTOS DO DOM (Ajustados para o seu HTML)
const loadingScreen = document.getElementById('loading');
const contentContainer = document.getElementById('content');

const gameTitle = document.getElementById('gameTitle');
const gameBanner = document.getElementById('gameBanner');
const gameDesc = document.getElementById('gameDesc'); // ID corrigido
const gameGenres = document.getElementById('gameGenres');
const postDate = document.getElementById('postDate'); // ID corrigido
const gameLink = document.getElementById('gameLink'); // ID corrigido

function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function carregarDetalhesDoJogo() {
    const gameId = getGameIdFromURL();

    if (!gameId) {
        alert("ID do jogo não encontrado.");
        window.location.href = '../index.html';
        return;
    }

    try {
        // Busca filtrada por ID
        const response = await fetch(`${SHEETDB_URL}/search?id=${gameId}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            alert("Jogo não encontrado.");
            window.location.href = '../index.html';
            return;
        }

        const jogo = data[0];

        // 3. PREENCHE OS DADOS
        document.title = `${jogo.title} - Gramdie Games`;
        if (gameTitle) gameTitle.innerText = jogo.title;
        if (gameBanner) gameBanner.src = jogo.banner;
        if (gameDesc) gameDesc.innerText = jogo.description;
        if (postDate) postDate.innerText = jogo.date || "Data não disponível";

        // Gerencia os Gêneros
        if (gameGenres && jogo.genres) {
            gameGenres.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`)
                .join('');
        }

        // Configura o Link de Download
        if (gameLink) {
            gameLink.href = jogo.mainLink;
        }

        // 4. FINALIZA O CARREGAMENTO
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (contentContainer) contentContainer.style.display = 'block';

    } catch (err) {
        console.error("Erro ao carregar:", err);
        if (loadingScreen) {
            loadingScreen.innerHTML = "<h2>Erro ao conectar com o repositório.</h2>";
        }
    }
}

// Inicia ao carregar
document.addEventListener('DOMContentLoaded', carregarDetalhesDoJogo);
