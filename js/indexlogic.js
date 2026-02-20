const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const themeBtn = document.getElementById('themeBtn');
const addGameBtn = document.getElementById('addGameBtn');

// --- TEMA ---
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

// --- BOTÃO ADICIONAR ---
if (addGameBtn) {
    addGameBtn.onclick = () => {
        window.location.href = 'pages/creategame.html'; 
    };
}

// --- RENDERIZAÇÃO ---
async function carregarJogos() {
    try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();

        if (loadingTrigger) loadingTrigger.style.display = 'none';
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        [...data].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;

            // Fallback para colunas que faltam na planilha
            const desc = jogo.description || "Descrição ainda não adicionada na planilha.";
            const generos = jogo.genres || "Geral";
            
            const tagsHTML = generos.split(',')
                .map(g => `<span class="tag-genre">${g.trim()}</span>`)
                .join('');

            const provider = (jogo.mainLink || "").includes('mediafire') ? 'Mediafire' : 'Cloud Store';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Sem+Imagem'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Recente'}</span>
                    <h3 class="game-title">${jogo.title || 'Título Indisponível'}</h3>
                    <p class="card-desc">${desc}</p>
                    <div class="genre-tags">${tagsHTML}</div>
                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${provider}</span>
                        <span class="status-online">● Online</span>
                    </div>
                    <div class="btn-download">Ver Detalhes</div>
                </div>
            `;
            gamesGrid.appendChild(card);
        });
    } catch (err) {
        if (loadingTrigger) loadingTrigger.innerHTML = "Erro ao conectar com o banco de dados.";
    }
}

document.addEventListener('DOMContentLoaded', carregarJogos);
