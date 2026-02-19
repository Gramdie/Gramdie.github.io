const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

document.addEventListener('DOMContentLoaded', () => {
    const gamesGrid = document.getElementById('games-grid');
    const loadingTrigger = document.getElementById('loading-trigger');
    const addGameBtn = document.getElementById('addGameBtn');

    // Botão de adicionar jogo
    if (addGameBtn) {
        addGameBtn.addEventListener('click', () => {
            window.location.href = 'pages/creategame.html';
        });
    }

    async function carregarJogos() {
        try {
            const response = await fetch(SHEETDB_URL);
            const gamesData = await response.json();

            if (loadingTrigger) loadingTrigger.style.display = 'none';
            if (gamesGrid) gamesGrid.innerHTML = '';

            gamesData.reverse().forEach(jogo => {
                const card = document.createElement('div');
                card.className = 'game-card';
                
                // O SEGREDO: O ID deve vir da sua planilha SheetDB
                card.onclick = () => {
                    if (jogo.id) {
                        window.location.href = `pages/post.html?id=${jogo.id}`;
                    } else {
                        console.log("Erro: Jogo sem ID na planilha");
                    }
                };

                const tagsGenero = jogo.genres 
                    ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') 
                    : '<span class="tag-genre">Geral</span>';

                card.innerHTML = `
                    <img src="${jogo.banner}" alt="${jogo.title}">
                    <div class="card-content">
                        <span class="post-date">${jogo.date || 'Recente'}</span>
                        <h3>${jogo.title}</h3>
                        <div class="genre-tags">${tagsGenero}</div>
                        <div class="provider-tags">
                            <span class="tag-provider"><i class="fas fa-cloud"></i> Cloud</span>
                        </div>
                    </div>
                `;
                gamesGrid.appendChild(card);
            });
        } catch (err) {
            console.log("Erro ao carregar banco de dados");
        }
    }
    carregarJogos();
});
