// 1. CONFIGURAÇÃO DA API
// Substitua pelo link que você gerou no SheetDB
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

const gamesContainer = document.getElementById('gamesContainer');

/**
 * Função principal para buscar os jogos na Planilha Google via SheetDB
 */
async function buscarJogos() {
    try {
        console.log("Conectando ao SheetDB...");
        
        // Faz a chamada para a API
        const response = await fetch(SHEETDB_URL);
        
        if (!response.ok) throw new Error("Não foi possível conectar à base de dados.");

        const jogos = await response.json();

        // Limpa o container (remove o texto "Carregando...")
        gamesContainer.innerHTML = '';

        if (jogos.length === 0) {
            gamesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p style="color: #888;">Nenhum jogo postado no repositório ainda.</p>
                </div>`;
            return;
        }

        // 2. RENDERIZAÇÃO DOS CARDS
        // .reverse() serve para que o jogo mais recente (última linha da planilha) apareça primeiro
        jogos.reverse().forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Configura o clique para ir à página do post com o ID da planilha
            card.onclick = () => {
                window.location.href = `pages/post.html?id=${jogo.id}`;
            };

            // Monta a estrutura visual do card usando os nomes das colunas que você criou
            card.innerHTML = `
                <div class="banner-wrapper">
                    <img src="${jogo.banner}" alt="${jogo.title}" class="game-banner" onerror="this.src='https://placehold.co/600x400?text=Sem+Imagem'">
                </div>
                <div class="game-details">
                    <h3 class="game-title">${jogo.title}</h3>
                    <p class="game-genres">
                        <i class="fas fa-tags" style="font-size: 10px; color: #1e90ff;"></i> 
                        ${jogo.genres}
                    </p>
                    <div class="game-footer">
                        <span class="game-date">${jogo.date || 'Recém postado'}</span>
                    </div>
                </div>
            `;
            
            gamesContainer.appendChild(card);
        });

    } catch (err) {
        console.error("Erro na lógica do index:", err);
        
        // Feedback visual de erro para o usuário
        gamesContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; border: 1px dashed #444; border-radius: 10px;">
                <i class="fas fa-exclamation-triangle" style="color: #ff4444; font-size: 30px; margin-bottom: 10px;"></i>
                <p>Erro ao carregar repositório.</p>
                <p style="font-size: 12px; color: #888;">Verifique se o seu DNS ou navegador está bloqueando a API.</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #1e90ff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Inicializa a função ao carregar a página
document.addEventListener('DOMContentLoaded', buscarJogos);
