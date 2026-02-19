import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://vhybulaqcduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const btn = document.getElementById('btnSubmit');
const statusDiv = document.getElementById('status');

btn.onclick = async () => {
    // Coleta os dados dos campos do HTML
    const title = document.getElementById('title').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const banner = document.getElementById('banner').value.trim();
    const mainLink = document.getElementById('mainLink').value.trim();
    const authorInput = document.getElementById('author').value.trim();

    // Validação básica
    if (!title || !mainLink) {
        alert("Erro: O título e o link de download são obrigatórios!");
        return;
    }

    // Anonimato: Gera ID aleatório de 9 dígitos se o autor estiver vazio
    const author = authorInput || Math.floor(100000000 + Math.random() * 900000000).toString();

    // Feedback visual de carregamento
    btn.disabled = true;
    btn.innerText = "Publicando...";
    statusDiv.style.display = "block";
    statusDiv.innerText = "Salvando no banco de dados...";

    try {
        // Envia os dados para a tabela 'posts' no Supabase
        const { data, error } = await supabase
            .from('posts')
            .insert([
                { 
                    title: title, 
                    description: desc, 
                    banner: banner, 
                    mainLink: mainLink, 
                    author: author 
                }
            ])
            .select(); // O .select() retorna os dados inseridos, incluindo o ID gerado automaticamente

        if (error) throw error;

        // 1. Notifica o usuário que foi postado
        alert("Sucesso! Seu jogo foi postado no Gramdie.");

        // 2. Pergunta se ele quer ir para o post
        const postID = data[0].id; // Pega o ID único gerado pelo banco
        const querVerPost = confirm("Deseja visualizar o post agora?");

        if (querVerPost) {
            // Direciona para a página específica do post (ex: post.html?id=...)
            window.location.href = `../pages/post.html?id=${postID}`;
        } else {
            // Direciona para a tela inicial
            window.location.href = '../index.html';
        }

    } catch (err) {
        console.error("Erro no Supabase:", err);
        alert("Erro ao publicar: " + err.message);
        btn.disabled = false;
        btn.innerText = "Tentar Novamente";
        statusDiv.style.color = "#FF4444";
        statusDiv.innerText = "Falha no envio.";
    }
};
