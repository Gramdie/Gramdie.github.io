const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Variavel global para armazenar o link com seguranca
window.linkDownloadAtual = "";

async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Se nao houver ID na URL, volta para a home
    if (!id) {
        window.location.href = '../index.html';
        return;
    }

    try {
        const res = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await res.json();
        
        if (!data || data.length === 0) {
            console.log("Jogo nao encontrado no banco de dados");
            return;
        }

        const jogo = data[0];
        
        // Define o link global assim que os dados chegam
        window.linkDownloadAtual = jogo.mainLink || "";

        // Elementos do DOM
        const titulo = document.getElementById('gameTitle');
        const banner = document.getElementById('gameBanner');
        const desc = document.getElementById('gameDesc');
        const dataPost = document.getElementById('postDate');
        const linkBtn = document.getElementById('gameLink');
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');

        // Preenchimento com verificacao para evitar erro 'null' ou 'undefined'
        if (titulo) titulo.innerText = jogo.title || "Titulo indisponivel";
        if (banner) banner.src = jogo.banner || "";
        if (desc) desc.innerText = jogo.description || "Sem descricao disponivel";
        if (dataPost) dataPost.innerText = jogo.date || "Data nao informada";
        
        if (linkBtn) {
            linkBtn.href = window.linkDownloadAtual;
        }

        // Renderizacao de generos
        const genreBox = document.getElementById('gameGenres');
        if (genreBox && jogo.genres) {
            genreBox.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`)
                .join('');
        }

        // Finaliza o loading e mostra o conteudo
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

    } catch (e) {
        console.log("Erro ao conectar com a API do SheetDB");
    }
}

// Inicia a execucao apenas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarPost);
