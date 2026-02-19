import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurações do Supabase
const supabase = createClient('https://vhybulaqcduktgwxqbzn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s');

let pagina = 0;
const limite = 50;
let carregando = false;

// --- 1. GESTÃO DE TEMA E COOKIES ---
function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/;max-age=31536000`; // 1 ano
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

// Inicialização segura dos botões (Corrige o erro de null)
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
});

// --- 2. CARREGAMENTO DE JOGOS (SCROLL INFINITO) ---
async function carregarJogos() {
    if (carregando) return;
    carregando = true;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pagina * limite, (pagina + 1) * limite - 1);

    if (error) {
        console.error("Erro ao buscar dados:", error.message);
    } else if (data) {
        renderizarCards(data);
        if (pagina === 0) setRandomPlaceholder(data);
        pagina++;
    }
    carregando = false;
}

function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    jogos.forEach(game => {
        // Detalhe: Limite de 90 caracteres na descrição
        const descOriginal = game.description || "";
        const descCurta = descOriginal.length > 90 ? descOriginal.substring(0, 90) + "..." : descOriginal;
        
        const dataPost = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "--/--/--";

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Detalhe: Clicar no post abre a página, clicar no botão download abre o link direto
        // CORREÇÃO: Passando o ID real do banco
        card.onclick = () => {
            if (game.id) window.location.href = `pages/post.html?id=${game.id}`;
        };

        card.innerHTML = `
            <img src="${game.banner || 'img/placeholder.jpg'}">
            <div class="card-content">
                <div class="post-date">Postado em ${dataPost}</div>
                <h3 style="margin: 5px 0">${game.title}</h3>
                <p class="card-desc">${descCurta}</p>
                <div class="tags-genero">
                    ${(game.genres || "").split(',').map(g => `<span class="tag-gray">${g.trim()}</span>`).join('')}
                </div>
                <div class="tags-providers">
                    ${verificarProvedores(game.mainLink)}
                </div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function verificarProvedores(link) {
    const hosts = ['mediafire', 'google', 'mega', 'pcloud', 'box', 'icloud'];
    if (!link) return "";
    return hosts.filter(h => link.toLowerCase().includes(h))
                .map(h => `<span class="tag-blue">${h.toUpperCase()}</span>`).join(' ');
}

// --- 3. SISTEMA DE BUSCA DINÂMICA ---
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function setRandomPlaceholder(jogos) {
    const random = jogos[Math.floor(Math.random() * jogos.length)];
    if (random && searchInput) searchInput.placeholder = `Ex: ${random.title}`;
}

if (searchInput) {
    searchInput.oninput = async () => {
        const termo = searchInput.value.trim();
        if (termo.length < 2) { 
            searchResults.style.display = 'none'; 
            return; 
        }

        const { data } = await supabase
            .from('posts')
            .select('id, title, banner')
            .ilike('title', `%${termo}%`)
            .limit(12); // Detalhe: Máximo 12 jogos na lista

        if (data && data.length > 0) {
            searchResults.innerHTML = data.map(jogo => `
                <div class="search-item" onclick="window.location.href='pages/post.html?id=${jogo.id}'">
                    <img src="${jogo.banner || 'img/placeholder.jpg'}">
                    <span>${jogo.title}</span>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        }
    };

    // Detalhe: Pesquisar ao apertar Enter
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            // Lógica para pesquisar (opcionalmente redirecionar para uma página de busca)
            searchResults.style.display = 'none';
        }
    };
}

// Fechar busca ao clicar fora
document.addEventListener('click', (e) => {
    if (searchResults && !e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

// --- 4. INFINITE SCROLL OBSERVER ---
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) carregarJogos();
});

const sentinel = document.getElementById('loading-trigger');
if (sentinel) observer.observe(sentinel);

// Carga Inicial
carregarJogos();
