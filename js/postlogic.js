const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";
const HYBRID_API_KEY = "ns9puf6u57179f9b9qbo8ojx6753e2b5txut93ja83b2aee3rkn20zsp3b84c09b"; // Insira sua chave do Hybrid Analysis aqui

// Lista de domínios confiáveis que NÃO serão verificados
const ALLOWED_DOMAINS = [
    'mediafire.com', 'pcloud.com', 'dropbox.com', 
    'onedrive.live.com', 'mega.nz', 'drive.google.com', 'icloud.com'
];

async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = '../index.html';
        return;
    }

    try {
        const res = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await res.json();
        
        if (!data || data.length === 0) return;

        const jogo = data[0];
        
        // --- LÓGICA DE EXIBIÇÃO ---
        document.getElementById('gameTitle').innerText = jogo.title || "Sem título";
        document.getElementById('gameBanner').src = jogo.banner || "";
        document.getElementById('gameDesc').innerText = jogo.description || "Sem descrição";
        document.getElementById('postDate').innerText = jogo.date || "Data não informada";
        
        const linkBtn = document.getElementById('gameLink');
        if (linkBtn) linkBtn.href = jogo.mainLink || "#";

        // --- VERIFICAÇÃO DE STATUS SUSPEITO (Vindo do Banco de Dados) ---
        // Se a coluna 'suspicious' na planilha for "true" ou "1"
        if (jogo.suspicious === "true" || jogo.suspicious === "1") {
            const aviso = document.createElement('div');
            aviso.style = "background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; color: #ff4757; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-weight: bold; display: flex; align-items: center; gap: 10px;";
            aviso.innerHTML = `<i class="fas fa-biohazard"></i> AVISO: Este arquivo foi marcado como suspeito pelo sistema de análise.`;
            document.getElementById('content').prepend(aviso);
        }

        // Renderização de gêneros
        const genreBox = document.getElementById('gameGenres');
        if (genreBox && jogo.genres) {
            genreBox.innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`)
                .join('');
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

    } catch (e) {
        console.error("Erro ao carregar post:", e);
    }
}

// --- FUNÇÃO PARA USAR NO MOMENTO DA CRIAÇÃO (creategame.html) ---
// Esta função verifica o link e retorna se ele é suspeito ou não
async function verificarSegurancaLink(url) {
    // 1. Verifica se o domínio está na lista de permitidos (Ignora verificação)
    const isAllowed = ALLOWED_DOMAINS.some(domain => url.toLowerCase().includes(domain));
    
    if (isAllowed) {
        console.log("Domínio confiável. Verificação ignorada.");
        return false; // Não é suspeito
    }

    try {
        // 2. Envia para o Hybrid Analysis (Quick Scan API)
        const response = await fetch('https://www.hybrid-analysis.com/api/v2/quick-scan/url', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': HYBRID_API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded',
                'user-agent': 'Falcon Sandbox'
            },
            body: new URLSearchParams({ 'url': url })
        });

        const result = await response.json();
        
        // 3. Define como suspeito se o veredito for 'malicious' ou 'suspicious'
        const verdict = result.verdict;
        return (verdict === 'malicious' || verdict === 'suspicious');

    } catch (err) {
        console.error("Erro na API de segurança:", err);
        return false; 
    }
}

document.addEventListener('DOMContentLoaded', carregarPost);
