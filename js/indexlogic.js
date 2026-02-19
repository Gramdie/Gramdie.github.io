import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configuração (Verifique se não há espaços extras na URL)
const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pagina = 0;
const limite = 50;
let carregando = false;

// 2. Funções Auxiliares
const setCookie = (n, v) => document.cookie = `${n}=${v};path=/;max-age=31536000`;
const getCookie = (n) => document.cookie.match('(^|;) ?' + n + '=([^;]*)(;|$)')?.[2];

function aplicarTema(tema) {
    const icon = document.getElementById('themeIcon');
    const isLight = tema === 'light';
    document.body.classList.toggle('light-mode', isLight);
    if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
}

// 3. Renderização e Busca
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

        if (data) {
            const grid = document.getElementById('games-grid');
            data.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                // Evita erro de id=undefined
                card.onclick = () => { if (game.id) window.location.href = `pages/post.html?id=${game.id}`; };

                const desc = game.description || "";
                const descCurta = desc.length > 90 ? desc.substring(0, 90) + "..." : desc;

                card.innerHTML = `
                    <img src="${game.banner || ''}">
                    <div class="card-content">
                        <div class="post-date">Postado em ${new Date(game.created_at).toLocaleDateString('pt-BR')}</div>
                        <h3 style="margin:0;">${game.title}</h3>
                        <p class="card-desc">${descCurta}</p>
                        <div class="genre-tags">
                            ${(game.genres || "").split(',').map(g => `<span class="tag-genre">${g.trim()}</span>`).join('')}
                        </div>
                        <a href="${game.mainLink}" target="_blank" class="btn-download" onclick="event.stopPropagation()">Download</a>
                    </div>`;
                grid.appendChild(card);
            });
            pagina++;
        }
    } catch (err) {
        console.error("Erro ao carregar jogos:", err.message);
    } finally {
        carregando = false;
    }
}

// 4. Inicialização Segura (Resolve o erro de NULL)
document.addEventListener('DOMContentLoaded', () => {
    aplicarTema(getCookie('theme') || 'dark');

    // Configuração dos Botões
    const addBtn = document.getElementById('addGameBtn');
    if (addBtn) addBtn.onclick = () => window.location.href = 'pages/creategame.html';

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const novo = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            aplicarTema(novo);
            setCookie('theme', novo);
        };
    }

    // Scroll Infinito
    const sentinel = document.getElementById('loading-trigger');
    if (sentinel) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) buscarJogos();
        });
        obs.observe(sentinel);
    }

    buscarJogos();
});
