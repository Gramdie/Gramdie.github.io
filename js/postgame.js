import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurações do Supabase
const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Lista completa de Gêneros conforme solicitado
const listaGeneros = [
    // Iniciais
    "RPG", "Ação", "Esporte", "Corrida", "Simulação", "Plataforma", "Quebra-cabeça", "Erotic",
    // Populares
    "Mundo Aberto", "FPS", "Sobrevivência", "Terror", "Estratégia", "Luta", "Aventura", "Rogue-like", "Arcade", "MMO",
    // Menos usados
    "Point and Click", "Visual Novel", "Educativo", "Musical", "Texto"
];

const genreContainer = document.getElementById('genreContainer');
const btnPublish = document.getElementById('btnPublish');

// 1. Gerar a grade de gêneros dinamicamente
listaGeneros.forEach(genero => {
    const label = document.createElement('label');
    label.className = 'genre-option';
    label.innerHTML = `<input type="checkbox" class="genre-checkbox" value="${genero}"> ${genero}`;
    genreContainer.appendChild(label);
});

// 2. Trava de segurança: Máximo 4 gêneros
genreContainer.addEventListener('change', () => {
    const selecionados = document.querySelectorAll('.genre-checkbox:checked');
    if (selecionados.length > 4) {
        alert("Você só pode escolher até 4 gêneros!");
        event.target.checked = false; // Desmarca o último clicado
    }
});

// 3. Função para Publicar
btnPublish.onclick = async () => {
    const title = document.getElementById('gameTitle').value;
    const banner = document.getElementById('gameBanner').value;
    const description = document.getElementById('gameDesc').value;
    const mainLink = document.getElementById('gameLink').value;
    
    // Coletar gêneros marcados
    const selecionados = Array.from(document.querySelectorAll('.genre-checkbox:checked'))
                              .map(cb => cb.value);

    // Validação básica
    if (!title || !mainLink || selecionados.length === 0) {
        alert("Por favor, preencha o título, o link de download e ao menos 1 gênero.");
        return;
    }

    btnPublish.disabled = true;
    btnPublish.innerText = "Publicando...";

    // Enviar para o Supabase
    // Note: Não enviamos 'created_at' pois o banco gera o now() sozinho
    const { data, error } = await supabase
        .from('posts')
        .insert([
            { 
                title: title, 
                banner: banner, 
                description: description, 
                mainLink: mainLink,
                genres: selecionados.join(', ') // Salva como string "Ação, RPG, Terror"
            }
        ]);

    if (error) {
        alert("Erro ao publicar: " + error.message);
        btnPublish.disabled = false;
        btnPublish.innerText = "Publicar Jogo";
    } else {
        alert("Jogo postado com sucesso!");
        window.location.href = '../index.html';
    }
};
