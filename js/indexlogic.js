import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// --- FUNÇÕES DE COOKIE ---
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

// --- CONTROLE DE TEMA (COM PERSISTÊNCIA) ---
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

// Carregar preferência salva
const temaSalvo = getCookie('user-theme') || 'dark';
aplicarTema(temaSalvo);

themeBtn.onclick = () => {
    const novoTema = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    aplicarTema(novoTema);
    setCookie('user-theme', novoTema, 365);
};

// --- NAVEGAÇÃO ---
document.getElementById('addGameBtn').onclick = () => window.location.href = 'pages/creategame.html';

// --- CARREGAMENTO DE JOGOS ---
async function carregarJogos() {
    if (carregando) return;
    carregando = true;

    // Busca sem exigir created_at para evitar erro 42703
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro Supabase:", error.message);
        return;
    }

    if (data && data.length > 0) {
        renderizarCards(data);
        if (pagina === 0) setRandomPlaceholder(data);
        pagina++;
    }
    carregando = false;
}

function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    jogos.forEach(game => {
        const desc = game.description || "";
        const descExibida = desc.length > 90 ? desc.substring(0, 90) + "..." : desc;
        const tagsHtml = gerarTags(game.mainLink);

        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => window.location.href = `pages/post.html?id=${game.id}`;
        
        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}" alt="${game.title}">
            <div class="card-content">
                <h3 style="margin:0">${game.title}</h3>
                <p class="card-desc">${descExibida}</p>
                <div class="tags">${tagsHtml}</div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function gerarTags(link) {
    const hosts = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
    return hosts.filter(h => link.toLowerCase().includes(h))
                .map(h => `<span class="tag">${h}</span>`).join('');
}

// --- BUSCA DINÂMICA (MAX 12) ---
const searchInput = document.getElementById('searchInput');
const resultsBox = document.getElementById('searchResults');

searchInput.oninput = async () => {
    const termo = searchInput.value.toLowerCase();
    if (termo.length < 2) { resultsBox.style.display = 'none'; return; }

    const { data } = await supabase.from('posts').select('id, title, banner').ilike('title', `%${termo}%`).limit(12);

    if (data && data.length > 0) {
        resultsBox.innerHTML = data.map(j => `
            <div class="result-item" onclick="window.location.href='pages/post.html?id=${j.id}'">
                <img src="${j.banner}">
                <span>${j.title}</span>
            </div>
        `).join('');
        resultsBox.style.display = 'block';
    }
};

function setRandomPlaceholder(jogos) {
    const r = jogos[Math.floor(Math.random() * jogos.length)];
    if (r) searchInput.placeholder = `Ex: ${r.title}`;
}

// Scroll Infinito
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) carregarJogos();
});
observer.observe(document.getElementById('loading-trigger'));

carregarJogos();
