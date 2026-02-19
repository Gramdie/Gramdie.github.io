// 1. CONFIGURAÇÃO DA API (SheetDB)
const SHEETDB_URL = "https://sheetdb.io/api/v1/SUA_ID_AQUI"; 

// 2. SELETORES DO DOM (Baseados no seu index (1).html)
const gamesGrid = document.getElementById('games-grid'); // ID Correto
const loadingTrigger = document.getElementById('loading-trigger');
const addGameBtn = document.getElementById('addGameBtn');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let gamesData = []; // Armazena os jogos para a busca

// --- LÓGICA DOS BOTÕES (Cabeçalho) ---

// Botão Adicionar Jogo (+)
if (addGameBtn) {
    addGameBtn.onclick = () => {
        window.location.href = 'pages/creategame.html';
    };
}

// Botão de Tema (Alternar Sol/Lua)
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        
        // Atualiza o ícone visualmente
        if (document.body.classList.contains('light-mode')) {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
        
        // Salva a preferência para não perder ao recarregar
        const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme-preference', currentMode);
    };
}

// Aplicar tema salvo ao carregar a página
if (localStorage.getItem('theme-preference') === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
}

// --- LÓGICA DE BUSCA (Pesquisa) ---

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
    if (lista.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    lista.slice(0, 5).forEach(jogo => {
        const item = document.createElement('div');
        item.className = 'result-item'; // Classe do seu CSS
        item.innerHTML = `
            <img src="${jogo.banner}">
            <span>${jogo.title}</span>
        `;
        item.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;
        searchResults.appendChild(item);
    });
    searchResults.style.display = 'block';
}

// --- LÓGICA DE CARREGAMENTO DOS JOGOS ---

async function carregarJogos() {
    if (!gamesGrid) return;

    try {
        console.log("Conectando ao SheetDB...");
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Erro ao carregar API");

        gamesData = await response.json();
        
        // Limpa a grade e remove o aviso de carregando
        gamesGrid.innerHTML = '';
        if (loadingTrigger) loadingTrigger.style.display = 'none';

        if (gamesData.length === 0) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum jogo encontrado.</p>';
            return;
        }

        // Mostra os jogos (Invertido para os novos ficarem no topo)
        [...gamesData].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card'; // Classe do seu CSS
            card.onclick = () => window.location.href = `pages/post.html?id=${jogo.id}`;

            // Estrutura compatível com as classes: .post-date, .card-desc, .genre-tags
            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Recente'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || ''}</p>
                    <div class="genre-tags">
                        ${jogo.genres ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') : ''}
                    </div>
                    <div class="provider-tags">
                        <span class="tag-provider">Disponível</span>
                    </div>
                    <a href="#" class="btn-download">Ver Detalhes</a>
                </div>
            `;
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Erro fatal:", err);
        if (gamesGrid) gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Erro de conexão.</p>';
    }
}

// Inicia o processo
document.addEventListener('DOMContentLoaded', carregarJogos);
