const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

// Seletores
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let gamesData = []; 

// --- LÓGICA DOS BOTÕES (TEMA E ADICIONAR) ---
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        document.getElementById('themeIcon').className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

// --- FUNÇÃO DE CARREGAMENTO CORRIGIDA ---
async function carregarJogos() {
    console.log("Iniciando busca de dados...");
    
    // Forçar o sumiço do loading após 5 segundos caso a rede trave
    setTimeout(() => {
        if (loadingTrigger && loadingTrigger.style.display !== 'none') {
            loadingTrigger.innerHTML = "Tempo de resposta excedido. Tente atualizar.";
        }
    }, 5000);

    try {
        const response = await fetch(SHEETDB_URL);
        
        // Se a resposta demorar ou falhar silenciosamente
        if (!response.ok) throw new Error("Falha na resposta da API");

        gamesData = await response.json();
        console.log("Dados recebidos:", gamesData);

        // LIMPEZA OBRIGATÓRIA
        if (loadingTrigger) loadingTrigger.style.display = 'none';
        if (gamesGrid) gamesGrid.innerHTML = '';

        if (!gamesData || gamesData.length === 0) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum jogo encontrado na planilha.</p>';
            return;
        }

        // Renderização dos cards
        [...gamesData].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;

            // Tags de Categoria e Provedor
            const tagsGenero = jogo.genres 
                ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') 
                : '<span class="tag-genre">Geral</span>';

            const provider = jogo.mainLink?.includes('mediafire') ? 'Mediafire' : 'Cloud';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Erro+na+Imagem'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Disponível'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || 'Sem descrição.'}</p>
                    <div class="genre-tags">${tagsGenero}</div>
                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${provider}</span>
                        <span class="tag-provider" style="color: #2ecc71;">● Online</span>
                    </div>
                    <a href="#" class="btn-download">Ver Detalhes</a>
                </div>
            `;
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar jogos:", err);
        if (loadingTrigger) loadingTrigger.innerHTML = "Erro ao conectar com o servidor.";
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarJogos);
