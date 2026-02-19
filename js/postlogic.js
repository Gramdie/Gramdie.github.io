const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Elementos do DOM conforme o seu post.html
const loadingScreen = document.getElementById('loading');
const contentContainer = document.getElementById('content');
const gameLinkBtn = document.getElementById('gameLink');
const availabilityLabel = document.getElementById('availabilityLabel');

let linkFinal = "";

async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Se não houver ID, volta para a home
    if (!id) {
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.log("Jogo não encontrado no banco de dados");
            return;
        }

        const jogo = data[0];
        linkFinal = jogo.mainLink;

        // Preencher os dados básicos
        document.getElementById('gameTitle').innerText = jogo.title;
        document.getElementById('gameBanner').src = jogo.banner;
        document.getElementById('gameDesc').innerText = jogo.description;
        document.getElementById('postDate').innerText = jogo.date || "Recente";

        // Renderizar Gêneros como tags
        const genreContainer = document.getElementById('gameGenres');
        if (jogo.genres && genreContainer) {
            genreContainer.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`)
                .join('');
        }

        // Configurar o link de download direto
        if (gameLinkBtn) {
            gameLinkBtn.href = linkFinal;
            gameLinkBtn.target = "_blank";
        }

        // Verificar qual é o serviço de cloud
        atualizarStatusCloud(linkFinal);

        // Finalizar a exibição
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (contentContainer) contentContainer.style.display = 'block';

    } catch (err) {
        console.log("Erro ao ligar ao servidor de dados");
    }
}

/**
 * Identifica o provedor e atualiza o texto de status
 */
function atualizarStatusCloud(url) {
    if (!availabilityLabel) return;
    
    let provedor = "Serviço Cloud";
    if (url.includes("mediafire")) provedor = "Mediafire";
    else if (url.includes("mega.nz")) provedor = "Mega.nz";
    else if (url.includes("drive.google")) provedor = "Google Drive";
    else if (url.includes("dropbox")) provedor = "Dropbox";

    availabilityLabel.innerText = `${provedor}: Disponível`;
    availabilityLabel.style.color = "#2ecc71";
}

// Inicia o processo ao carregar a página
document.addEventListener('DOMContentLoaded', carregarPost);
