// Substitua pelo seu link do SheetDB
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

// O ID correto conforme o seu HTML é 'games-grid'
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');

async function buscarJogos() {
    if (!gamesGrid) return;

    try {
        console.log("Conectando ao SheetDB...");
        const response = await fetch(SHEETDB_URL);
        
        if (!response.ok) throw new Error("Erro ao conectar à API");

        const jogos = await response.json();

        // Limpa a grade antes de mostrar os resultados
        gamesGrid.innerHTML = '';
        if (loadingTrigger) loadingTrigger.style.display = 'none';

        if (jogos.length === 0) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum jogo encontrado.</p>';
            return;
        }

        // Renderiza os jogos (mais recentes primeiro)
        jogos.reverse().forEach(jogo => {
            // Cria o elemento do card
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Configura o clique para a página do post
            card.onclick = () => {
                window.location.href = `pages/post.html?id=${jogo.id}`;
            };

            // Monta o HTML interno seguindo exatamente o seu estilo CSS
            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Recém postado'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || ''}</p>
                    <div class="genre-tags">
                        ${jogo.genres ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') : ''}
                    </div>
                    <div class="provider-tags">
                        <span class="tag-provider">Disponível Agora</span>
                    </div>
                    <a href="#" class="btn-download">Ver Detalhes</a>
                </div>
            `;
            
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar:", err);
        if (gamesGrid) {
            gamesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff4444;">
                Erro ao carregar repositório. Verifique sua conexão.
            </p>`;
        }
    }
}

// Inicia a busca
document.addEventListener('DOMContentLoaded', buscarJogos);
