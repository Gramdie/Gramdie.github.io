import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. CONFIGURAÇÃO (Certifique-se de que a URL está exatamente assim)
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// 2. GESTÃO DE TEMA (COOKIES)
const setCookie = (n, v) => document.cookie = `${n}=${v};path=/;max-age=31536000`;
const getCookie = (n) => document.cookie.match('(^|;) ?' + n + '=([^;]*)(;|$)')?.[2];

function aplicarTema(tema) {
    const isLight = tema === 'light';
    document.body.classList.toggle('light-mode', isLight);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
}

// 3. RENDERIZAÇÃO DOS CARDS (Com verificação de ID)
function renderizarCards(jogos) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    jogos.forEach(game => {
        const desc = game.description || "";
        const descCurta = desc.length > 90 ? desc.substring(0, 90) + "..." : desc;
        const dataF = game.created_at ? new Date(game.created_at).toLocaleDateString('pt-BR') : "";

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // CORREÇÃO: Só redireciona se o ID existir no banco
        card.onclick = () => {
            if (game.id) window.location.href = `pages/post.html?id=${game.id}`;
        };

        card.innerHTML = `
            <img src="${game.banner || ''}" onerror="this.src='img/placeholder.jpg'">
            <div class="card-content">
                <div class="post-date">Postado em ${dataF}</div>
                <h3 style="margin:0;">${game.title}</h3>
                <p class="card-desc">${descCurta}</p>
                <div class="genre-tags">
                    ${(game.genres || "").split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('')}
                </div>
                <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
            </div>`;
        grid.appendChild(card);
    });
}

// 4. CARREGAMENTO DOS DADOS (Com tratamento de erro de rede)
async function buscarJogos() {
    if (carregando) return;
    carregando = true;

    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .range(pagina * limite, (pagina + 1) * limite - 1);

        if (error) throw error;

        if (data && data.length > 0) {
            renderizarCards(data);
            pagina++;
        }
    } catch (err) {
        console.warn("Aguardando conexão com Supabase...");
    } finally {
        carregando = false;
    }
}

// 5. INICIALIZAÇÃO "BLINDADA" (CORRIGE ERRO DE NULL)
// Esta função garante que o JS só mexe nos botões após o HTML carregar
const inicializar = () => {
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

    // Observer para Scroll Infinito
    const sentinel = document.getElementById('loading-trigger');
    if (sentinel) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) buscarJogos();
        });
        obs.observe(sentinel);
    }

    buscarJogos();
};

// Executa a inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
