import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; // URL extraída das suas imagens
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// 2. GESTÃO DE TEMA E COOKIES
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

// 3. RENDERIZAÇÃO DOS CARDS
function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    jogos.forEach(game => {
        // Detalhe: Descrição limitada a 90 caracteres
        const descOriginal = game.description || "";
        const descCurta = descOriginal.length > 90 ? descOriginal.substring(0, 90) + "..." : descOriginal;
        
        const dataFormatada = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "";

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Detalhe: Clicar no card abre a página do post (usando ID real)
        card.onclick = () => {
            if (game.id) window.location.href = `pages/post.html?id=${game.id}`;
        };

        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}" alt="Banner">
            <div class="card-content">
                <div class="post-date">Postado em ${dataFormatada}</div>
                <h3 style="margin:0; font-size:18px;">${game.title}</h3>
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
                .map(h => `<span class="tag-provider">${h}</span>`).join(' ');
}

// 4. BUSCA DINÂMICA
async function iniciarBusca() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput) return;

    searchInput.oninput = async () => {
        const termo = searchInput.value.trim();
        if (termo.length < 2) { searchResults.style.display = 'none'; return; }

        // Detalhe: Máximo de 12 jogos na lista da pesquisa
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

    // Detalhe: Pesquisar ao apertar Enter
    searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') searchResults.style.display = 'none';
    };
}

// 5. CARREGAMENTO INICIAL E SCROLL INFINITO
async function buscarJogos() {
    if (carregando) return;
    carregando = true;

    // Detalhe: Carrega de 50 em 50 jogos
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro ao carregar:", error.message);
    } else if (data) {
        renderizarCards(data);
        if (pagina === 0) {
            // Detalhe: Placeholder aleatório na primeira carga
            const rand = data[Math.floor(Math.random() * data.length)];
            if (rand) document.getElementById('searchInput').placeholder = `Ex: ${rand.title}`;
        }
        pagina++;
    }
    carregando = false;
}

// 6. INICIALIZAÇÃO SEGURA (CORRIGE ERRO DE NULL)
document.addEventListener('DOMContentLoaded', () => {
    aplicarTema(getCookie('theme') || 'dark');

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const novoTema = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            aplicarTema(novoTema);
            setCookie('theme', novoTema);
        };
    }

    const addBtn = document.getElementById('addGameBtn');
    if (addBtn) {
        addBtn.onclick = () => window.location.href = 'pages/creategame.html';
    }

    iniciarBusca();

    // Scroll Infinito usando o sentinel do HTML
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) buscarJogos();
    });
    
    const sentinel = document.getElementById('loading-trigger');
    if (sentinel) observer.observe(sentinel);

    buscarJogos();
});

// Fechar resultados ao clicar fora
document.addEventListener('click', (e) => {
    const results = document.getElementById('searchResults');
    if (results && !e.target.closest('.search-container')) {
        results.style.display = 'none';
    }
});
