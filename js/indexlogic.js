import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// IMPORTANTE: Use a URL exatamente como aparece no seu painel
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // Coloque sua chave real aqui
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// 1. Funções de Tema e Cookies
function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
}

function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function aplicarTema(tema) {
    const themeIcon = document.getElementById('themeIcon');
    if (tema === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    } else {
        document.body.classList.remove('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
}

// 2. Renderização de Cards
function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    jogos.forEach(game => {
        const desc = game.description || "";
        const descCurta = desc.length > 90 ? desc.substring(0, 90) + "..." : desc;
        const dataFormatada = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "";

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // CORREÇÃO: Redireciona usando o ID gerado pelo banco
        card.onclick = () => {
            if (game.id) window.location.href = `pages/post.html?id=${game.id}`;
        };

        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}">
            <div class="card-content">
                <div class="post-date">Postado em ${dataFormatada}</div>
                <h3 style="margin:0;">${game.title}</h3>
                <p class="card-desc">${descCurta}</p>
                <div class="genre-tags">
                    ${(game.genres || "").split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('')}
                </div>
                <div class="provider-tags">
                    ${detectarProvedores(game.mainLink)}
                </div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function detectarProvedores(link) {
    if (!link) return "";
    const hosts = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
    return hosts.filter(h => link.toLowerCase().includes(h))
                .map(h => `<span class="tag-provider">${h.toUpperCase()}</span>`).join(' ');
}

// 3. Busca Dinâmica (Máximo 12 resultados)
async function setupBusca() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput) return;

    searchInput.oninput = async () => {
        const termo = searchInput.value.trim();
        if (termo.length < 2) { searchResults.style.display = 'none'; return; }

        const { data } = await supabase
            .from('posts')
            .select('id, title, banner')
            .ilike('title', `%${termo}%`)
            .limit(12);

        if (data && data.length > 0) {
            searchResults.innerHTML = data.map(j => `
                <div class="result-item" onclick="window.location.href='pages/post.html?id=${j.id}'">
                    <img src="${j.banner || 'img/placeholder.jpg'}">
                    <span>${j.title}</span>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        }
    };
}

// 4. Carregamento e Scroll Infinito
async function buscarJogos() {
    if (carregando) return;
    carregando = true;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro Supabase:", error.message);
    } else if (data) {
        renderizarCards(data);
        pagina++;
    }
    carregando = false;
}

// 5. Inicialização Segura (Resolve o erro de Null)
document.addEventListener('DOMContentLoaded', () => {
    aplicarTema(getCookie('theme') || 'dark');

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const novo = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            aplicarTema(novo);
            setCookie('theme', novo);
        };
    }

    const addBtn = document.getElementById('addGameBtn');
    if (addBtn) {
        addBtn.onclick = () => window.location.href = 'pages/creategame.html';
    }

    setupBusca();

    const sentinel = document.getElementById('loading-trigger');
    if (sentinel) {
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) buscarJogos();
        }).observe(sentinel);
    }

    buscarJogos();
});
