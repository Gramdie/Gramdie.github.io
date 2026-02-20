const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

// Seletores principais
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
// Aplica o tema salvo ao carregar
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fas fa-moon';
}

// --- LÓGICA DO BOTÃO ADICIONAR (CORRIGIDO) ---
if (addGameBtn) {
    addGameBtn.onclick = () => {
        // Redireciona para a página de criação de posts
        window.location.href = 'pages/creategame.html'; 
    };
}

// --- FUNÇÃO DE CARREGAMENTO DOS JOGOS ---
async function carregarJogos() {
    try {
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Erro na resposta da API");

        const gamesData = await response.json();

        // Limpa o estado de carregamento
        if (loadingTrigger) loadingTrigger.style.display = 'none';
        if (gamesGrid) gamesGrid.innerHTML = '';

        // Inverte a ordem para mostrar os mais recentes primeiro
        [...gamesData].reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Configura o clique para abrir o post com o ID correto
            card.onclick = () => {
                if (jogo.id) {
                    window.location.href = `pages/post.html?id=${jogo.id}`;
                } else {
                    console.log("Aviso: Jogo sem ID definido na planilha");
                }
            };

            const tagsGenero = jogo.genres 
                ? jogo.genres.split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('') 
                : '<span class="tag-genre">Geral</span>';

            const provider = jogo.mainLink?.includes('mediafire') ? 'Mediafire' : 'Cloud';

            card.innerHTML = `
                <img src="${jogo.banner}" alt="${jogo.title}" onerror="this.src='https://placehold.co/600x400?text=Erro+na+Imagem'">
                <div class="card-content">
                    <span class="post-date">${jogo.date || 'Disponível'}</span>
                    <h3 style="margin: 0; font-size: 18px;">${jogo.title}</h3>
                    <p class="card-desc">${jogo.description || 'Sem descrição disponível.'}</p>
                    <div class="genre-tags">${tagsGenero}</div>
                    <div class="provider-tags">
                        <span class="tag-provider"><i class="fas fa-cloud"></i> ${provider}</span>
                        <span class="tag-provider" style="color: #2ecc71;">● Online</span>
                    </div>
                    <span class="btn-download">Ver Detalhes</span>
                </div>
            `;
            gamesGrid.appendChild(card);
        });

    } catch (err) {
        console.log("Erro ao carregar os dados do SheetDB");
        if (loadingTrigger) loadingTrigger.innerHTML = "Erro ao conectar com o servidor";
    }
}

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', carregarJogos);
