// 1. CONFIGURAÇÃO DA API
// Substitua pelo link que você gerou no SheetDB.io
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Desativa o botão para evitar cliques duplos durante o envio
        submitBtn.disabled = true;
        submitBtn.innerText = "Enviando para o Servidor...";

        // Gera um ID único baseado no timestamp atual (Ex: 1740000000000)
        const uniqueId = Date.now().toString();

        // Coleta os gêneros selecionados no formulário
        const selectedGenres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        // Prepara o objeto seguindo EXATAMENTE as colunas da sua planilha
        const gameData = {
            data: [{
                id: uniqueId,
                title: document.getElementById('title').value,
                banner: document.getElementById('banner').value,
                description: document.getElementById('description').value,
                genres: selectedGenres,
                mainLink: document.getElementById('mainLink').value,
                date: new Date().toLocaleDateString('pt-BR') // Formato: DD/MM/AAAA
            }]
        };

        try {
            // Realiza a postagem para a Planilha Google via API
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });

            if (!response.ok) throw new Error("Erro ao conectar com o banco de dados.");

            // 2. NOTIFICAÇÃO E REDIRECIONAMENTO
            const msg = "Publicação concluída com sucesso!\n\nClique em OK para ver a página do jogo ou CANCELAR para voltar ao início.";
            
            if (confirm(msg)) {
                // Direciona para a página do post (na mesma pasta /pages/)
                // Passamos o ID na URL para que o post.html saiba o que carregar
                window.location.href = `post.html?id=${uniqueId}`;
            } else {
                // Direciona para a tela inicial (subindo um nível de pasta)
                window.location.href = '../index.html';
            }

        } catch (err) {
            console.error("Falha no envio:", err);
            
            // Tratamento de erro amigável para o usuário
            alert("Erro ao publicar o jogo: " + err.message + "\nVerifique sua conexão ou se a API do SheetDB está correta.");
            
            // Reativa o botão para o usuário tentar novamente
            submitBtn.disabled = false;
            submitBtn.innerText = "Publicar Jogo";
        }
    };
}
