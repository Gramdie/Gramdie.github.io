const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

async function executarPesquisa() {
    // 1. Pega o termo da pesquisa na URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryOriginal = urlParams.get('query') || "";
    const query = queryOriginal.toLowerCase().trim();

    // 2. Atualiza o texto na interface
    const displayTermo = document.getElementById('searchTermDisplay');
    if (displayTermo) displayTermo.innerText = queryOriginal;

    const grid = document.getElementById('search-results');
    if (!grid) return;

    try {
        const response = await fetch(SHEETDB_URL);
        if (!response.ok) throw new Error("Erro ao aceder à base de dados");

        const data = await response.json();

        // 3. Lógica de Filtragem (Título, #Tag, ID ou URL)
        const resultados = data.filter(jogo => {
            const titulo = (jogo.title || "").toLowerCase();
            const id = (jogo.id || "").toString().toLowerCase();
            const generos = (jogo.genres || "").toLowerCase();
            const link = (jogo.mainLink || "").toLowerCase();

            // Pesquisa por Tag (se começar com #)
            if (query.startsWith('#')) {
                const tagParaProcurar = query.replace('#', '').trim();
                return generos.includes(tagParaProcurar);
            }

            // Pesquisa Geral (Título, ID exato ou parte da URL)
            return titulo.includes(query) || id === query || link.includes(query);
        });

        // 4. Renderiza os resultados
        renderizarResultados(resultados, grid);

    } catch (error) {
        console.error("Erro na busca:", error);
        grid.innerHTML = `<p class="no-results">Erro ao carregar dados. Tente novamente.</p>`;
    }
}

function renderizarResultados(lista, container) {
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search-minus"></i>
                <p>Nenhum jogo encontrado para esta busca.</p>
            </div>`;
        return;
    }

    // Inverte para mostrar os mais recentes primeiro
    [...lista].reverse().forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Link para a página do post (ajuste o caminho se necessário)
        card.onclick = () => {
            window.location.href = `post.html?id=${jogo.id}`;
        };

        const tags = (jogo.genres || "Geral").split(',')
            .map(t => `<span class="tag-genre">${t.trim()}</span>`).join('');

        card.innerHTML = `
            <img src="${jogo.banner}" onerror="this.src='https://placehold.co/600x400?text=Sem+Imagem'">
            <div class="card-content">
                <span class="game-id">ID: ${jogo.id}</span>
                <h3 class="game-title">${jogo.title}</h3>
                <div class="genre-tags">${tags}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Inicia quando a página carregar
document.addEventListener('DOMContentLoaded', executarPesquisa);
