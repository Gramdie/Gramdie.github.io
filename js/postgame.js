import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurações do Supabase (Substitua pelas suas chaves)
const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Persistência de Tema via Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

if (getCookie('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// 2. Captura do ID da URL
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');

async function carregarDetalhesDoJogo() {
    // Proteção contra ID inexistente ou 'undefined'
    if (!gameId || gameId === "undefined") {
        console.error("ID inválido detectado na URL.");
        alert("Ocorreu um erro ou o jogo não existe mais.");
        window.location.href = '../index.html';
        return;
    }

    // 3. Busca no Banco de Dados
    // Usamos aspas em "mainLink" para bater com o nome exato na tabela
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', gameId)
        .single();

    if (error || !data) {
        console.error("Erro Supabase:", error?.message);
        alert("Não foi possível encontrar este jogo no repositório.");
        window.location.href = '../index.html';
        return;
    }

    // 4. Preenchimento Dinâmico da Página
    document.title = `${data.title} - Gramdie Games`;
    
    const bannerImg = document.getElementById('gameBanner');
    if (bannerImg) bannerImg.src = data.banner || '../img/placeholder.jpg';
    
    document.getElementById('gameTitle').innerText = data.title;
    document.getElementById('gameDesc').innerText = data.description || "Sem descrição disponível.";
    
    const downloadBtn = document.getElementById('gameLink');
    if (downloadBtn) downloadBtn.href = data.mainLink;

    // 5. Exibição da Data (Acima da descrição)
    if (data.created_at) {
        const dataFormatada = new Date(data.created_at).toLocaleDateString('pt-BR');
        const dateElement = document.getElementById('postDate');
        if (dateElement) dateElement.innerText = dataFormatada;
    }

    // 6. Renderização das Tags de Gênero (Cinza)
    const genreContainer = document.getElementById('gameGenres');
    if (genreContainer && data.genres) {
        genreContainer.innerHTML = ''; // Limpa antes de preencher
        data.genres.split(',').forEach(genero => {
            const span = document.createElement('span');
            span.className = 'tag-genre'; // Mesma classe usada na index para manter o padrão cinza
            span.style.cssText = "background: #333; color: #bbb; padding: 4px 10px; border-radius: 5px; font-size: 12px; margin-right: 5px;";
            span.innerText = genero.trim();
            genreContainer.appendChild(span);
        });
    }

    // Esconde o carregamento e mostra o conteúdo
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('content');
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (contentDiv) contentDiv.style.display = 'block';
}

// Inicializa a função
carregarDetalhesDoJogo();
