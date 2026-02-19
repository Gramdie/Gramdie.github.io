import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// CONFIGURAÇÃO
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; // URL das suas imagens
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // Substitua pela sua chave real
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Bloqueia o botão para evitar cliques duplos
        submitBtn.disabled = true;
        submitBtn.innerText = "Publicando...";

        // Captura os gêneros marcados
        const selectedGenres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        // Prepara os dados conforme as colunas da tabela
        const gameData = {
            title: document.getElementById('title').value,
            banner: document.getElementById('banner').value,
            description: document.getElementById('description').value,
            genres: selectedGenres,
            mainLink: document.getElementById('mainLink').value // Coluna que estava dando erro
        };

        const { error } = await supabase
            .from('posts')
            .insert([gameData]);

        if (error) {
            alert("Erro ao publicar: " + error.message);
            console.error(error);
            submitBtn.disabled = false;
            submitBtn.innerText = "Publicar Jogo";
        } else {
            alert("Jogo publicado com sucesso!");
            window.location.href = '../index.html'; // Volta para a home
        }
    };
}
