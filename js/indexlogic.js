import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurações do Supabase
const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// --- SISTEMA DE TEMA ---
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

themeBtn.onclick = () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
};

// --- CARREGAMENTO DE JOGOS (INFINITE SCROLL) ---
async function carregarJogos() {
    if (carregando) return;
    carregando = true;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .range(pagina * limite, (pagina + 1) * limite - 1)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao conectar com a nuvem:", error);
        return;
    }

    if (data.length > 0) {
        renderizarCards(data);
        if (pagina === 0) definirPlaceholderAleatorio(data);
        pagina++;
    }
    carregando = false;
}

function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    jogos.forEach(game => {
        // Limite de 90 caracteres na descrição
        const desc = game.description || "";
        const descCurta = desc.length > 90 ? desc.substring(0, 90) + "..." : desc;
        
        const tagsHtml = gerarTags(game.mainLink);

        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.banner || 'img/default.jpg'}" alt="${game.title}">
            <div class="card-content">
                <h3>${game.title}</h3>
                <p class="card-desc">${descCurta}</p>
                <div class="tags">${tagsHtml}</div>
            </div>
            <div class="download-overlay">
                <a href="${game.mainLink}" target="_blank" class="btn-download">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function gerarTags(link) {
    const provedores = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
    return provedores
        .filter(p => link.toLowerCase().includes(p))
        .map(p => `<span class="tag">${p.toUpperCase()}</span>`)
        .join('');
}

// --- SISTEMA DE BUSCA ---
const searchInput = document.getElementById('searchInput');
const resultsBox = document.getElementById('searchResults');
const btnSearch = document.getElementById('btnSearch');

searchInput.oninput = async () => {
    const termo = searchInput.value.toLowerCase();
    if (termo.length < 2) {
        resultsBox.style.display = 'none';
        return;
    }

    const { data } = await supabase
        .from('posts')
        .select('id, title, banner')
        .ilike('title', `%${termo}%`)
        .limit(12); // Máximo 12 resultados na lista

    if (data && data.length > 0) {
        resultsBox.innerHTML = data.map(j => `
            <div class="result-item" onclick="window.location.href='pages/post.html?id=${j.id}'">
                <img src="${j.banner}">
                <span>${j.title}</span>
            </div>
        `).join('');
        resultsBox.style.display = 'block';
    } else {
        resultsBox.style.display = 'none';
    }
};

// Pesquisa ao apertar Enter ou clicar na Lupa
const executarPesquisa = () => {
    if (searchInput.value) {
        window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
    }
};

searchInput.onkeydown = (e) => { if (e.key === 'Enter') executarPesquisa(); };
btnSearch.onclick = executarPesquisa;

function definirPlaceholderAleatorio(jogos) {
    const randomGame = jogos[Math.floor(Math.random() * jogos.length)];
    searchInput.placeholder = `Ex: ${randomGame.title}`;
}

// --- DETECTOR DE FINAL DE PÁGINA ---
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) carregarJogos();
}, { threshold: 1.0 });

observer.observe(document.getElementById('loading-trigger'));

// Início
carregarJogos();
