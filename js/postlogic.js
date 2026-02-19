// 1. CONFIGURAÇÃO DA SUA API
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// 2. ELEMENTOS DO DOM (IDs corrigidos para bater com o post.html)
const gameTitle = document.getElementById('gameTitle');
const gameBanner = document.getElementById('gameBanner');
const gameDesc = document.getElementById('gameDesc'); // Era gameDescription
const gameGenres = document.getElementById('gameGenres');
const postDate = document.getElementById('postDate'); // Era gameDate
const gameLink = document.getElementById('gameLink'); // Era downloadBtn
const loading = document.getElementById('loading');
const content = document.getElementById('content');

/**
 * Obtém o ID do jogo a partir da URL da página
 */
function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Procura os dados do jogo na API e preenche a página
 */
async function carregarDetalhesDoJogo() {
    const gameId = getGameIdFromURL();

    if (!gameId) {
        console.error("ID do jogo não encontrado na URL");
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch(`${SHEETDB_URL}/search?id=${gameId}`);
        const data = await response.json();

        if (data.length === 0) {
            console.error("Jogo não encontrado no repositório");
            window.location.href = '../index.html';
            return;
        }

        const jogo = data[0];

        // 3. PREENCHE OS DADOS NA TELA
        if (gameTitle) gameTitle.innerText = jogo.title;
        if (gameBanner) gameBanner.src = jogo.banner;
        if (gameDesc) gameDesc.innerText = jogo.description;
        if (postDate) postDate.innerText = jogo.date;

        if (gameGenres && jogo.genres) {
            gameGenres.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`)
                .join('');
        }

        if (gameLink) {
            gameLink.href = jogo.mainLink;
        }

        // 4. EXIBE O CONTEÚDO E ESCONDE O LOADING
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

    } catch (err) {
        console.error("Erro ao carregar o post:", err);
    }
}

document.addEventListener('DOMContentLoaded', carregarDetalhesDoJogo);
