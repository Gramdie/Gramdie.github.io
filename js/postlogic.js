// 1. CONFIGURAÇÃO DA SUA API
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// 2. ELEMENTOS DO DOM (Certifique-se de que esses IDs existem no seu post.html)
const gameTitle = document.getElementById('gameTitle');
const gameBanner = document.getElementById('gameBanner');
const gameDescription = document.getElementById('gameDescription');
const gameGenres = document.getElementById('gameGenres');
const gameDate = document.getElementById('gameDate');
const downloadBtn = document.getElementById('downloadBtn');

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
        alert("Erro: ID do jogo não encontrado.");
        window.location.href = '../index.html';
        return;
    }

    try {
        // Faz a busca filtrando pelo ID na API do SheetDB
        const response = await fetch(`${SHEETDB_URL}/search?id=${gameId}`);
        const data = await response.json();

        if (data.length === 0) {
            alert("Jogo não encontrado no repositório.");
            window.location.href = '../index.html';
            return;
        }

        const jogo = data[0]; // Pega o primeiro resultado da busca

        // 3. PREENCHE OS DADOS NA TELA
        if (gameTitle) gameTitle.innerText = jogo.title;
        if (gameBanner) gameBanner.src = jogo.banner;
        if (gameDescription) gameDescription.innerText = jogo.description;
        if (gameDate) gameDate.innerText = `Publicado em: ${jogo.date}`;

        // Trata os géneros para criar tags individuais
        if (gameGenres && jogo.genres) {
            gameGenres.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="tag-genre" style="background:#333; padding:5px 10px; border-radius:5px; margin-right:5px; font-size:12px;">${g.trim()}</span>`)
                .join('');
        }

        // Configura o botão de download com o link da planilha
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                window.open(jogo.mainLink, '_blank');
            };
        }

    } catch (err) {
        console.error("Erro ao carregar o post:", err);
        alert("Ocorreu um erro ao ligar ao servidor.");
    }
}

// Inicia o carregamento quando a página abrir
document.addEventListener('DOMContentLoaded', carregarDetalhesDoJogo);
