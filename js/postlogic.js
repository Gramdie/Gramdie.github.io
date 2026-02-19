import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurações do Supabase
const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Verificar o Tema via Cookie (Mesma lógica da index)
const getCookie = (name) => {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
};

if (getCookie('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// 2. Capturar o ID do jogo na URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');

async function carregarJogo() {
    if (!gameId) {
        window.location.href = '../index.html';
        return;
    }

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', gameId)
        .single();

    if (error || !data) {
        console.error("Erro ao carregar post:", error);
        alert("Ocorreu um erro ou o jogo não existe mais.");
        window.location.href = '../index.html';
        return;
    }

    // 3. Preencher os dados na tela
    document.title = `${data.title} - Gramdie Games`;
    document.getElementById('gameTitle').innerText = data.title;
    document.getElementById('gameBanner').src = data.banner || '../img/placeholder.jpg';
    document.getElementById('gameDesc').innerText = data.description;
    document.getElementById('gameLink').href = data.mainLink;

    // Formatar a data (created_at automática do Supabase)
    const dataObj = new Date(data.created_at);
    document.getElementById('postDate').innerText = dataObj.toLocaleDateString('pt-BR');

    // Renderizar tags de gêneros (armazenados como "Ação, RPG")
    const genreContainer = document.getElementById('gameGenres');
    if (data.genres) {
        data.genres.split(',').forEach(g => {
            const span = document.createElement('span');
            span.className = 'genre-tag';
            span.innerText = g.trim();
            genreContainer.appendChild(span);
        });
    }

    // Finalizar carregamento
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

carregarJogo();
