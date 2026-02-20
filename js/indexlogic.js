const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Seletores de Elementos
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const themeBtn = document.getElementById('themeBtn');
const addGameBtn = document.getElementById('addGameBtn');
const searchInput = document.getElementById('searchInput');

// --- 1. SISTEMA DE TEMA ---
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}

// Aplica tema salvo ao iniciar
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fas fa-moon';
}

// --- 2. LÓGICA DA BARRA DE PESQUISA (Enter para Search.html) ---
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query !== "") {
                // Redireciona para a pasta pages com o termo da busca
                window.location.href = `pages/search.html?query=${encodeURIComponent(query)}`;
            }
        }
    });
}

// --- 3. BOTÃO ADICIONAR JOGO ---
if (addGameBtn) {
    addGameBtn.onclick = () => {
        window.location.href = 'pages/creategame.html';
    };
}

// --- 4. CARREGAMENTO E RENDERIZAÇÃO DOS JOGOS ---
async function carregarJogos() {
    try {
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Falha ao conectar com a API");

        const data = await response.json();

        // Remove o sinal de carregamento
        if (loadingTrigger) loadingTrigger.style.display = 'none';
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        // Exibe do mais novo para o mais antigo
        [...data].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Redireciona para a página do post usando o ID
            card.onclick = () => {
                window.location.href = `pages/post.html?id=${jogo.id}`;
            };

            // Trata descrição e gêneros (Fallbacks caso as colunas estejam vazias)
            const descricao = jogo.description || "Nenhuma descrição disponível no momento.";
            const generosRaw = jogo.genres || "Geral";
            
            const tagsHTML = generosRaw.split(',')
                .map(g => `<span class="tag-genre">${g.trim()}</span>`)
                .join('');

            // Define o provedor baseado no link
            const linkDownload = (jogo.mainLink || "").toLowerCase();
            const provedor = linkDownload.includes('mediafire') ? 'Mediafire' : 'Cloud Store';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Imagem+Indisponível'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Recente'}</span>
                    <h3 class="game-title">${jogo.title || 'Título Indisponível'}</h3>
                    <p class="card-desc">${descricao}</p>
                    <div class="genre-tags">${tagsHTML}</div>
                    <div class="provider-tags">
                        <span class="tag-provider">
                            <i class="fas fa-cloud"></i> ${provedor}
                        </span>
                        <span class="tag-provider" style="color: #2ecc71;">
                            <i class="fas fa-check-circle"></i> Online
                        </span>
                    </div>
                    <div class="btn-details">Ver Detalhes</div>
                </div>
            `;
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro crítico:", err);
        if (loadingTrigger) {
            loadingTrigger.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ff4757;"></i>
                <p>Erro ao carregar catálogo. Tente atualizar a página.</p>
            `;
        }
    }
}

// Inicia o carregamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarJogos);
