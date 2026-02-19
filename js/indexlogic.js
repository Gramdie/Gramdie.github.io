import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('https://vhybulaqcduktgwxqbzn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s');
let page = 0;
const perPage = 50;
let loading = false;

// --- TEMA E COOKIES ---
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.className = 'fas fa-moon';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.className = 'fas fa-sun';
    }
}

applyTheme(getCookie('theme') || 'dark');

themeToggle.onclick = () => {
    const isLight = document.body.classList.contains('light-mode');
    const nextTheme = isLight ? 'dark' : 'light';
    applyTheme(nextTheme);
    setCookie('theme', nextTheme);
};

// --- RENDERIZAÇÃO ---
async function fetchGames() {
    if (loading) return;
    loading = true;
    
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * perPage, (page + 1) * perPage - 1);

    if (data) {
        renderCards(data);
        if (page === 0) updatePlaceholder(data);
        page++;
    }
    loading = false;
}

function renderCards(games) {
    const grid = document.getElementById('games-grid');
    games.forEach(game => {
        const dateStr = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : '--/--/--';
        const shortDesc = (game.description || "").substring(0, 90) + (game.description?.length > 90 ? "..." : "");
        
        // Tags de Provedor
        const providers = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
        const providerTags = providers.filter(p => game.mainLink?.toLowerCase().includes(p))
                                      .map(p => `<span class="tag-provider">${p}</span>`).join('');

        const card = document.createElement('div');
        card.className = 'game-card';
        // CORREÇÃO: Passando o ID correto para evitar undefined
        card.onclick = () => window.location.href = `pages/post.html?id=${game.id}`;
        
        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}" alt="Banner">
            <div class="card-body">
                <div class="card-date">Postado em ${dateStr}</div>
                <h3 style="margin:0; font-size:18px;">${game.title}</h3>
                <p class="card-desc">${shortDesc}</p>
                <div class="tag-group">${(game.genres || "").split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('')}</div>
                <div class="tag-group">${providerTags}</div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- PESQUISA ---
const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('searchDropdown');

function updatePlaceholder(games) {
    const randomGame = games[Math.floor(Math.random() * games.length)];
    if (randomGame) searchInput.placeholder = `Ex: ${randomGame.title}`;
}

searchInput.oninput = async () => {
    const query = searchInput.value;
    if (query.length < 2) { dropdown.style.display = 'none'; return; }

    const { data } = await supabase.from('posts').select('id, title, banner').ilike('title', `%${query}%`).limit(12);

    if (data?.length) {
        dropdown.innerHTML = data.map(g => `
            <div class="search-item" onclick="location.href='pages/post.html?id=${g.id}'">
                <img src="${g.banner || 'img/placeholder.jpg'}">
                <span>${g.title}</span>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    }
};

// Fechar pesquisa ao clicar fora
document.onclick = (e) => { if (!e.target.closest('.search-area')) dropdown.style.display = 'none'; };

// --- INFINITE SCROLL ---
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) fetchGames();
}, { threshold: 1.0 });

observer.observe(document.getElementById('sentinel'));
