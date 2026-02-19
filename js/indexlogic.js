// 1. CONFIGURAÇÃO DA API
const SHEETDB_URL = "https://sheetdb.io/api/v1/SUA_ID_AQUI"; 

// 2. ELEMENTOS DO DOM
const gamesGrid = document.getElementById('games-grid');
const loadingTrigger = document.getElementById('loading-trigger');
const addGameBtn = document.getElementById('addGameBtn');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

// --- LÓGICA DOS BOTÕES DA DIREITA ---

// Botão Adicionar Jogo (+)
if (addGameBtn) {
    addGameBtn.onclick = () => {
        // Redireciona para a página de criação dentro da pasta pages
        window.location.href = 'pages/creategame.html';
    };
}

// Botão de Tema (Sol/Lua)
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        
        // Troca o ícone entre sol e lua
        if (document.body.classList.contains('light-mode')) {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
        
        // Salva a preferência do usuário
        const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', mode);
    };
}

// Carregar tema salvo ao abrir a página
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
}

// --- LÓGICA DE CARREGAMENTO DOS JOGOS (SheetDB) ---

async function buscarJogos() {
    if (!gamesGrid) return;

    try {
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Erro na API");

        const jogos = await response.json();
        
        gamesGrid.innerHTML = '';
        if (loadingTrigger) loadingTrigger.style.display = 'none';

        if (jogos.length === 0) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum jogo encontrado.</p>';
            return;
        }

        jogos.reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Ao clicar no card, vai para o post
            card.onclick = () => {
                window.location.href = `pages/post.html?id=${jogo.id}`;
            };

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Erro+na+Imagem'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Disponível'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || 'Sem descrição disponível.'}</p>
                    <div class="genre-tags">
                        ${jogo.genres ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') : ''}
                    </div>
                    <div class="provider-tags">
                        <span class="tag-provider">Original</span>
                    </div>
                    <a href="#" class="btn-download">Ver Detalhes</a>
                </div>
            `;
            
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro:", err);
        if (gamesGrid) gamesGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Erro ao conectar com o servidor.</p>';
    }
}

document.addEventListener('DOMContentLoaded', buscarJogos);
