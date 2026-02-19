import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://vhybulaqcdunktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON_AQUI';
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
            const { data, error } = await supabase
                .from('posts')
                .insert([gameData])
                .select();

            if (error) throw error;

            // Lógica de notificação solicitada
            const postId = data[0].id;
            const msg = "Publicação concluída!\n\nOK: Ver a página do jogo\nCANCELAR: Voltar ao início";
            
            if (confirm(msg)) {
                window.location.href = `post.html?id=${postId}`;
            } else {
                window.location.href = '../index.html';
            }

        } catch (err) {
            // Captura o erro da linha 50
            console.error("Erro detalhado capturado:", err);
            
            if (err.message === "Failed to fetch") {
                alert("Erro de Conexão: O navegador não conseguiu falar com o servidor. Desative o 'Shield' do Brave (ícone do leão) para este site.");
            } else {
                alert("Erro ao publicar: " + err.message);
            }
            
            submitBtn.disabled = false;
            submitBtn.innerText = "Publicar Jogo";
        }
    };
}
