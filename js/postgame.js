import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Verifique se não há espaços antes ou depois da URL
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Desativa o botão para evitar envios duplicados
        submitBtn.disabled = true;
        submitBtn.innerText = "Conectando ao servidor...";

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
            // Tentativa de inserção com timeout manual se necessário
            const { data, error } = await supabase
                .from('posts')
                .insert([gameData])
                .select();

            if (error) throw error;

            // Sucesso! Notifica o usuário
            const novoPostId = data[0].id;
            const mensagem = "Jogo publicado com sucesso!\n\nOK: Ver a página do jogo\nCANCELAR: Voltar para o início";
            
            if (confirm(mensagem)) {
                // Direciona para a página do post (ajuste o caminho se necessário)
                window.location.href = `post.html?id=${novoPostId}`;
            } else {
                window.location.href = '../index.html';
            }

        } catch (err) {
            // Tratamento específico para o erro de rede da imagem
            console.error("Erro de conexão:", err);
            alert("Erro de Rede: Não foi possível alcançar o servidor. Verifique se o seu antivírus está bloqueando o Supabase ou se a URL está correta.");
            
            submitBtn.disabled = false;
            submitBtn.innerText = "Tentar Publicar Novamente";
        }
    };
}
