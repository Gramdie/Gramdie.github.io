import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. CONFIGURAÇÃO (Verifique se sua URL e Chave estão corretas)
const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'SUA_ANON_KEY_AQUI'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Bloqueia o botão para evitar múltiplos envios
        submitBtn.disabled = true;
        submitBtn.innerText = "Publicando no Servidor...";

        // Coleta todos os gêneros marcados nos checkboxes
        const selectedGenres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        // Organiza os dados para o banco
        const gameData = {
            title: document.getElementById('title').value,
            banner: document.getElementById('banner').value,
            description: document.getElementById('description').value,
            genres: selectedGenres,
            mainLink: document.getElementById('mainLink').value
        };

        try {
            // Envia para a tabela 'posts'
            const { data, error } = await supabase
                .from('posts')
                .insert([gameData])
                .select(); // O select() retorna os dados do post criado, incluindo o ID

            if (error) throw error;

            // --- LÓGICA DE NOTIFICAÇÃO E REDIRECIONAMENTO ---
            const novoPostId = data[0].id;
            
            // Notifica que terminou
            const irParaPost = confirm("Publicação concluída com sucesso!\n\nClique em OK para ver a página do jogo ou CANCELAR para voltar à tela inicial.");

            if (irParaPost) {
                // Direciona para a página do post/jogo
                window.location.href = `post.html?id=${novoPostId}`;
            } else {
                // Direciona para a tela inicial
                window.location.href = '../index.html';
            }

        } catch (error) {
            alert("Erro ao enviar para o servidor: " + error.message);
            console.error("Erro detalhado:", error);
            
            // Reativa o botão em caso de erro
            submitBtn.disabled = false;
            submitBtn.innerText = "Publicar Jogo";
        }
    };
}
