// js/postlogic.js
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Declarar como global (sem const ou let dentro da função)
window.linkDownloadAtual = ""; 

async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return;

    try {
        const res = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await res.json();
        const jogo = data[0];

        if (jogo) {
            window.linkDownloadAtual = jogo.mainLink; // Atribui ao global

            document.getElementById('gameTitle').innerText = jogo.title;
            document.getElementById('gameBanner').src = jogo.banner;
            document.getElementById('gameDesc').innerText = jogo.description;
            document.getElementById('postDate').innerText = jogo.date;
            document.getElementById('gameLink').href = window.linkDownloadAtual;

            const genreContainer = document.getElementById('gameGenres');
            if (jogo.genres) {
                genreContainer.innerHTML = jogo.genres.split(',')
                    .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');
            }

            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        }
    } catch (e) {
        console.log("Erro ao carregar post");
    }
}

document.addEventListener('DOMContentLoaded', carregarPost);
