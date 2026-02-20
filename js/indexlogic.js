const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Seletores do DOM
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const themeBtn = document.getElementById('themeBtn');
const addGameBtn = document.getElementById('addGameBtn');

// --- LÓGICA DO TEMA ---
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fas fa-moon';
}

// --- LÓGICA DO BOTÃO ADICIONAR (BUG RESOLVIDO) ---
if (addGameBtn) {
    addGameBtn.onclick = () => {
        // Redireciona para a página de criação na pasta pages
        window.location.href = 'pages/creategame.html'; 
    };
}

// --- FUNÇÃO DE CARREGAMENTO DOS JOGOS ---
async function carregarJogos() {
    try {
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Erro de conexão");

        const data = await response.json();

        if (loadingTrigger) loadingTrigger.style.display = 'none';
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        [...data].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Redirecionamento para o post com ID
            card.onclick = () => {
                window.location.href = `pages/post.html?id=${jogo.id}`;
            };

            // Lógica para descrição e tags (Fallback se a coluna não existir)
            const descPost = jogo.description || "Descrição ainda não adicionada na planilha.";
            const generosRaw = jogo.genres || "Geral";
            
            const tagsHTML = generosRaw.split(',')
                .map(g => `<span class="tag-genre">${g.trim()}</span>`)
                .join('');

            // Identificação do provedor
            const link = jogo.mainLink || "";
            const providerName = link.includes('mediafire') ? 'Mediafire' : 'Cloud Store';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Imagem+Indisponivel'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Disponível'}</span>
                    <h3 class="game-title">${jogo.title || 'Sem Título'}</h3>
                    <p class="card-desc">${descPost}</p>
                    <div class="genre-tags">${tagsHTML}</div>
                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${providerName}</span>
                        <span class="status-online">● Online</span>
                    </div>
                    <div class="btn-download">Ver Detalhes</div>
                </div>
            `;
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao listar jogos:", err);
        if (loadingTrigger) loadingTrigger.innerHTML = "Erro ao carregar o catálogo.";
    }
}

document.addEventListener('DOMContentLoaded', carregarJogos);
