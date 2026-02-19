import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- CONFIGURAÇÃO ---
// ATENÇÃO: Verifique se esta URL está correta conforme a sua imagem
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // Substitua pela sua chave real
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// --- GESTÃO DE TEMA (COOKIES) ---
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

// --- CARREGAMENTO DE DADOS ---
async function buscarJogos() {
    if (carregando) return;
    carregando = true;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro ao carregar jogos:", error.message);
    } else if (data) {
        renderizarCards(data);
        if (pagina === 0) configurarPlaceholder(data);
        pagina++;
    }
    carregando = false;
}

function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    jogos.forEach(game => {
        // Regra de 90 caracteres para descrição
        const descOriginal = game.description || "";
        const descCurta = descOriginal.length > 90 ? descOriginal.substring(0, 90) + "..." : descOriginal;
        
        const dataFormatada = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "";

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // CORREÇÃO: Redireciona para o post apenas se o ID existir
        card.onclick = () => {
            if (game.id) {
                window.location.href = `pages/post.html?id=${game.id}`;
            } else {
                console.error("Este item não possui um ID válido no banco.");
            }
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

// --- BUSCA DINÂMICA ---
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function configurarPlaceholder(jogos) {
    const rand = jogos[Math.floor(Math.random() * jogos.length)];
    if (rand && searchInput) searchInput.placeholder = `Ex: ${rand.title}`;
}

if (searchInput) {
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
    
    // Pesquisa ao apertar Enter
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') searchResults.style.display = 'none';
    };
}

// --- INICIALIZAÇÃO SEGURA (Corrige Erro de Null) ---
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

    // Scroll Infinito (50 em 50)
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) buscarJogos();
    }, { threshold: 0.1 });

    const sentinel = document.getElementById('loading-trigger');
    if (sentinel) observer.observe(sentinel);

    buscarJogos();
});

// Fechar busca ao clicar fora
document.addEventListener('click', (e) => {
    if (searchResults && !e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});
