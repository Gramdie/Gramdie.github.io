import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'SUA_URL_DO_SUPABASE';
const SUPABASE_KEY = 'SUA_CHAVE_ANON_PUBLIC';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// --- TEMA ---
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

themeBtn.onclick = () => {
    document.body.classList.toggle('light-mode');
    themeIcon.className = document.body.classList.contains('light-mode') ? 'fas fa-moon' : 'fas fa-sun';
};

// --- CARREGAMENTO ---
async function carregarJogos() {
    if (carregando) return;
    carregando = true;

    // Sem order('created_at') para evitar erro 42703
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro na nuvem:", error.message);
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
        // Clique no card abre a página do post
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
    const subs = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
    return subs.filter(s => link.toLowerCase().includes(s))
               .map(s => `<span class="tag">${s}</span>`).join('');
}

// --- BUSCA (MAX 12) ---
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

searchInput.onkeydown = (e) => {
    if (e.key === 'Enter' && searchInput.value) {
        window.location.href = `index.html?q=${encodeURIComponent(searchInput.value)}`;
    }
};

function setRandomPlaceholder(jogos) {
    const r = jogos[Math.floor(Math.random() * jogos.length)];
    if (r) searchInput.placeholder = `Ex: ${r.title}`;
}

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) carregarJogos();
});
observer.observe(document.getElementById('loading-trigger'));

carregarJogos();
