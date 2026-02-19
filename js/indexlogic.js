// 1. CONFIGURAÇÃO DA API
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

const gamesGrid = document.getElementById('games-grid'); //
const loadingTrigger = document.getElementById('loading-trigger');
const addGameBtn = document.getElementById('addGameBtn');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let gamesData = []; 

// --- LÓGICA DE TEMA E BOTÕES ---
if (addGameBtn) addGameBtn.onclick = () => window.location.href = 'pages/creategame.html';

if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
}

// --- CARREGAMENTO E SISTEMA DE TAGS ---
async function carregarJogos() {
    if (!gamesGrid) return;
    try {
        const response = await fetch(SHEETDB_URL);
        gamesData = await response.json();
        
        gamesGrid.innerHTML = '';
        if (loadingTrigger) loadingTrigger.style.display = 'none';

        [...gamesData].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card'; //
            card.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;

            // Lógica para as Categorias (Gêneros)
            const tagsGenero = jogo.genres 
                ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') 
                : '<span class="tag-genre">Geral</span>';

            // Lógica para as Tags de Serviço/Cloud (Provider)
            // Aqui definimos o provedor baseado no link ou um padrão "Cloud"
            const providerName = jogo.mainLink.includes('mediafire') ? 'Mediafire' : 
                                 jogo.mainLink.includes('mega') ? 'Mega.nz' : 'Cloud Service';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Recém postado'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || 'Sem descrição.'}</p>
                    
                    <div class="genre-tags">
                        ${tagsGenero}
                    </div>

                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${providerName}</span>
                        <span class="tag-provider" style="color: #2ecc71;">● Online</span>
                    </div>

                    <a href="#" class="btn-download">Ver Detalhes</a>
                </div>
            `;
            gamesGrid.appendChild(card);
        });
    } catch (err) {
        console.error("Erro na API:", err);
        if (gamesGrid) gamesGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Erro ao carregar banco de dados.</p>';
    }
}

// --- BUSCA ---
if (searchInput) {
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length > 0) {
            const filtered = gamesData.filter(g => g.title.toLowerCase().includes(term));
            exibirResultadosBusca(filtered);
        } else {
            searchResults.style.display = 'none';
        }
    };
}

function exibirResultadosBusca(lista) {
    searchResults.innerHTML = '';
    if (lista.length === 0) { searchResults.style.display = 'none'; return; }
    lista.slice(0, 5).forEach(jogo => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `<img src="${jogo.banner}"><span>${jogo.title}</span>`;
        item.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;
        searchResults.appendChild(item);
    });
    searchResults.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', carregarJogos);
