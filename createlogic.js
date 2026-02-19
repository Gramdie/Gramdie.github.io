import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // Use sua chave real
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerText = "Publicando no Servidor...";

        const selectedGenres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        const gameData = {
            title: document.getElementById('title').value,
            banner: document.getElementById('banner').value,
            description: document.getElementById('description').value,
            genres: selectedGenres,
            mainLink: document.getElementById('mainLink').value
        };

        try {
            // Envia para o Supabase
            const { data, error } = await supabase
                .from('posts')
                .insert([gameData])
                .select();

            if (error) throw error;

            // Notificação de sucesso e escolha de destino
            const novoPostId = data[0].id;
            const msg = "Jogo publicado com sucesso!\n\nClique em OK para ver a página do jogo ou CANCELAR para voltar ao início.";
            
            if (confirm(msg)) {
                // Direciona para a página do post (ajuste o caminho se necessário)
                window.location.href = `post.html?id=${novoPostId}`;
            } else {
                window.location.href = '../index.html';
            }

        } catch (err) {
            console.error("Erro detalhado:", err);
            // Alerta específico para o erro de rede
            alert("Erro de conexão: O navegador não conseguiu alcançar o Supabase. Verifique sua internet ou tente desativar extensões de bloqueio.");
            
            submitBtn.disabled = false;
            submitBtn.innerText = "Publicar Jogo";
        }
    };
}
