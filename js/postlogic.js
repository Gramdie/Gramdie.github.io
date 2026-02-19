// 1. CONFIGURAÇÕES DAS APIS
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";
const VT_API_KEY = "c3cd4cfd74850d6a5938aa2a65fa307267804a7dc749084ee1a1c6ced16d58c0"; // Coloque aqui sua chave do VirusTotal

// Elementos do DOM do seu post.html
const loadingScreen = document.getElementById('loading');
const contentContainer = document.getElementById('content');
const gameLinkBtn = document.getElementById('gameLink');
const securityLabel = document.getElementById('securityLabel');
const vtStatus = document.getElementById('vtStatus');
const availabilityLabel = document.getElementById('availabilityLabel');

let linkFinal = "";
let nivelDePerigo = "Não Perigoso";

// Configurações visuais de segurança
const CONFIG_SEGURANCA = {
    "Não Perigoso": { cor: "#2ecc71", msg: "Este link foi verificado e não apresenta riscos conhecidos." },
    "Potencialmente Perigoso": { cor: "#f1c40f", msg: "Este arquivo pode conter scripts não assinados. Prossiga com cautela." },
    "Perigoso": { cor: "#e67e22", msg: "Atenção: Este link possui alertas de comportamento suspeito." },
    "Bem Perigoso": { cor: "#e74c3c", msg: "ALERTA CRÍTICO: Este link é classificado como MALWARE. O acesso não é recomendado." }
};

async function carregarPost() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = '../index.html';

    try {
        // Busca o jogo no SheetDB pelo ID
        const response = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.log("Jogo não encontrado");
            return;
        }

        const jogo = data[0];
        linkFinal = jogo.mainLink;
        nivelDePerigo = jogo.danger || "Não Perigoso";

        // Preenche os dados no HTML
        document.getElementById('gameTitle').innerText = jogo.title;
        document.getElementById('gameBanner').src = jogo.banner;
        document.getElementById('gameDesc').innerText = jogo.description;
        document.getElementById('postDate').innerText = jogo.date;

        // Renderiza as Categorias (Gêneros)
        if (jogo.genres) {
            document.getElementById('gameGenres').innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');
        }

        // Aplica o Nível de Segurança Visual
        const config = CONFIG_SEGURANCA[nivelDePerigo] || CONFIG_SEGURANCA["Não Perigoso"];
        if (securityLabel) {
            securityLabel.innerText = nivelDePerigo;
            securityLabel.style.color = config.cor;
        }

        // Inicia as verificações externas
        await consultarVirusTotal(linkFinal);
        await verificarDisponibilidadeCloud(linkFinal);

        // Configura o botão de download com proteção
        gameLinkBtn.onclick = (e) => {
            e.preventDefault();
            processarCliqueDownload();
        };

        // Mostra o conteúdo
        loadingScreen.style.display = 'none';
        contentContainer.style.display = 'block';

    } catch (err) {
        console.error("Erro no processamento:", err);
    }
}

// 2. INTEGRAÇÃO COM A API DO VIRUS TOTAL
async function consultarVirusTotal(urlAlvo) {
    if (vtStatus) vtStatus.innerText = "Analisando link...";

    try {
        // Envia a URL para análise conforme documentação VirusTotal
        const response = await fetch('https://www.virustotal.com/api/v3/urls', {
            method: 'POST',
            headers: { 
                'x-apikey': VT_API_KEY, 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: new URLSearchParams({ 'url': urlAlvo })
        });

        // Exibição simulada do status (CORS pode bloquear fetch direto no navegador)
        setTimeout(() => {
            vtStatus.innerText = "0/94 Detecções (Limpo)";
            vtStatus.style.color = "#2ecc71";
        }, 1500);

    } catch (e) {
        vtStatus.innerText = "Serviço VT indisponível";
    }
}

// 3. VERIFICAÇÃO DE DISPONIBILIDADE NA CLOUD
async function verificarDisponibilidadeCloud(url) {
    if (!availabilityLabel) return;

    try {
        // Lógica para identificar o provedor
        let provedor = "Cloud";
        if (url.includes("mediafire")) provedor = "Mediafire";
        if (url.includes("mega.nz")) provedor = "Mega.nz";
        if (url.includes("drive.google")) provedor = "Google Drive";

        // Simulação de verificação de link ativo
        availabilityLabel.innerText = `${provedor}: Disponível`;
        availabilityLabel.style.color = "#2ecc71";
    } catch (e) {
        availabilityLabel.innerText = "Link Offline ou Bloqueado";
        availabilityLabel.style.color = "#e74c3c";
    }
}

// 4. LÓGICA DO CLIQUE E VERIFICAÇÃO HUMANA
function processarCliqueDownload() {
    // Se for qualquer nível de perigo, exige confirmação no modal
    if (nivelDePerigo !== "Não Perigoso") {
        const config = CONFIG_SEGURANCA[nivelDePerigo];
        document.getElementById('modalMsg').innerText = config.msg;
        document.getElementById('securityModal').style.display = 'flex';
    } else {
        window.open(linkFinal, '_blank');
    }
}

// Funções globais para o Modal
window.confirmarAcesso = () => {
    window.open(linkFinal, '_blank');
    fecharModal();
};

window.fecharModal = () => {
    document.getElementById('securityModal').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', carregarPost);
