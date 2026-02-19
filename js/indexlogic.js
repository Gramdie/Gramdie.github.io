import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// --- COOKIES E TEMA ---
function setCookie(name, value) {
    const d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function aplicarTema(tema) {
    if (tema === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.className = 'fas fa-moon';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.className = 'fas fa-sun';
    }
}

aplicarTema(getCookie('theme') || 'dark');

themeBtn.onclick = () => {
    const novoTema = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    aplicarTema(novoTema);
    setCookie('theme', novoTema);
};

// --- NAVEGAÇÃO ---
document.getElementById('addGameBtn').onclick = () => window.location.href = 'pages/creategame.html';

// --- CARREGAMENTO ---
async function carregarJogos() {
    if (carregando) return;
    carregando = true;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (!error && data) {
        renderizarCards(data);
        if (pagina === 0) setPlaceholder(data);
        pagina++;
    }
    carregando = false;
}

function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    jogos.forEach(game => {
        const desc = (game.description || "").substring(0, 90) + (game.description?.length > 90 ? "..." : "");
        const dataPost = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "--/--/--";
        
        // Tags de gênero (Cinza)
        const generosHtml = (game.genres || "").split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('');
        
        // Tags de provedor (Azul)
        const hosts = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
        const providersHtml = hosts.filter(h => game.mainLink?.toLowerCase().includes(h))
                                   .map(h => `<span class="tag-provider">${h}</span>`).join('');

        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => window.location.href = `pages/post.html?id=${game.id}`;
        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}">
            <div class="card-content">
                <div class="post-date">Postado em ${dataPost}</div>
                <h3 style="margin:0">${game.title}</h3>
                <p class="card-desc">${desc}</p>
                <div class="genre-tags">${generosHtml}</div>
                <div class="provider-tags">${providersHtml}</div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- BUSCA ---
const searchInput = document.getElementById('searchInput');
const resultsBox = document.getElementById('searchResults');

searchInput.oninput = async () => {
    const termo = searchInput.value.toLowerCase();
    if (termo.length < 2) { resultsBox.style.display = 'none'; return; }

    const { data } = await supabase.from('posts').select('id, title, banner').ilike('title', `%${termo}%`).limit(12);

    if (data?.length > 0) {
        resultsBox.innerHTML = data.map(j => `
            <div class="result-item" onclick="window.location.href='pages/post.html?id=${j.id}'">
                <img src="${j.banner}">
                <span>${j.title}</span>
            </div>
        `).join('');
        resultsBox.style.display = 'block';
    }
};

function setPlaceholder(jogos) {
    const r = jogos[Math.floor(Math.random() * jogos.length)];
    if (r) searchInput.placeholder = `Ex: ${r.title}`;
}

const observer = new IntersectionObserver(e => e[0].isIntersecting && carregarJogos());
observer.observe(document.getElementById('loading-trigger'));
carregarJogos();
