const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Elementos do DOM
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const addGameBtn = document.getElementById('addGameBtn');
const searchInput = document.getElementById('searchInput');

// --- TEMA ---
function aplicarTema() {
    const salvo = localStorage.getItem('theme');
    if (salvo === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
}

if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (themeIcon) themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    };
}

// --- BUSCA ---
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const valor = searchInput.value.trim();
            if (valor) {
                window.location.href = `pages/search.html?query=${encodeURIComponent(valor)}`;
            }
        }
    });
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

            const desc = jogo.description || "Descrição ainda não adicionada na planilha.";
            const generos = jogo.genres || "Geral";
            
            const tagsHTML = generos.split(',')
                .map(g => `<span class="tag-genre">${g.trim()}</span>`)
                .join('');

            const linkLower = (jogo.mainLink || "").toLowerCase();
            let provider = 'Cloud Store';
            if (linkLower.includes('mediafire')) provider = 'Mediafire';
            else if (linkLower.includes('mega.nz')) provider = 'Mega.nz';
            else if (linkLower.includes('drive.google')) provider = 'Google Drive';

            // --- PARTE ADICIONADA: TAG SUSPICIOUS ---
            let tagSuspiciousHTML = '';
            if (jogo.suspicious === "true" || jogo.suspicious === "1") {
                tagSuspiciousHTML = `
                    <span style="background: #ff4757; color: white; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px; margin-left: 10px;">
                        <i class="fas fa-exclamation-triangle"></i> SUSPICIOUS
                    </span>
                `;
            }

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Sem+Imagem'">
                <div class="card-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <span class="post-date">${jogo.date || 'Recente'}</span>
                        ${tagSuspiciousHTML}
                    </div>
                    <h3 class="game-title">${jogo.title || 'Título Indisponível'}</h3>
                    <p class="card-desc">${desc}</p>
                    <div class="genre-tags">${tagsHTML}</div>
                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${provider}</span>
                        <span style="font-size: 11px; color: #2ecc71; font-weight: bold;">● Online</span>
                    </div>
                    <div class="btn-details">Ver Detalhes</div>
                </div>
            `;
            gamesGrid.appendChild(card);
        });
    } catch (err) {
        if (loadingTrigger) {
            loadingTrigger.innerHTML = `<i class="fas fa-exclamation-circle"></i><p>Erro ao conectar com o banco de dados.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarTema();
    carregarJogos();
});
