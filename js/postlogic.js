const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";

// Elementos do DOM
const loadingScreen = document.getElementById('loading');
const contentContainer = document.getElementById('content');
const gameLinkBtn = document.getElementById('gameLink');
const securityLabel = document.getElementById('securityLabel');
const availabilityLabel = document.getElementById('availabilityLabel');

let linkFinal = "";
let nivelDePerigo = "Não Perigoso";

// Configurações de cores e mensagens por nível
const CONFIG_SEGURANCA = {
    "Não Perigoso": { cor: "#2ecc71", msg: "Este link foi verificado pela nossa equipa." },
    "Potencialmente Perigoso": { cor: "#f1c40f", msg: "Atenção: Este ficheiro pode conter scripts não verificados." },
    "Perigoso": { cor: "#e67e22", msg: "Cuidado: Este link possui alertas de comportamento suspeito." },
    "Bem Perigoso": { cor: "#e74c3c", msg: "ALERTA CRÍTICO: Malware detetado. O acesso não é recomendado." }
};

async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return window.location.href = '../index.html';

    try {
        const response = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) return;

        const jogo = data[0];
        linkFinal = jogo.mainLink;
        nivelDePerigo = jogo.danger || "Não Perigoso";

        // Preencher dados no HTML
        document.getElementById('gameTitle').innerText = jogo.title;
        document.getElementById('gameBanner').src = jogo.banner;
        document.getElementById('gameDesc').innerText = jogo.description;
        document.getElementById('postDate').innerText = jogo.date;

        // Renderizar Gêneros
        if (jogo.genres && document.getElementById('gameGenres')) {
            document.getElementById('gameGenres').innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');
        }

        // Aplicar Status de Segurança Visual
        const config = CONFIG_SEGURANCA[nivelDePerigo] || CONFIG_SEGURANCA["Não Perigoso"];
        if (securityLabel) {
            securityLabel.innerText = nivelDePerigo;
            securityLabel.style.color = config.cor;
        }

        // Verificar o Provedor Cloud
        verificarCloud(linkFinal);

        // Configurar o clique do botão com proteção
        if (gameLinkBtn) {
            gameLinkBtn.onclick = (e) => {
                e.preventDefault();
                validarAcesso();
            };
        }

        // Finalizar carregamento
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (contentContainer) contentContainer.style.display = 'block';

    } catch (err) {
        console.log("Erro ao carregar dados do servidor");
    }
}

function verificarCloud(url) {
    if (!availabilityLabel) return;
    let provedor = "Cloud Service";
    if (url.includes("mediafire")) provedor = "Mediafire";
    if (url.includes("mega.nz")) provedor = "Mega.nz";
    if (url.includes("drive.google")) provedor = "Google Drive";

    availabilityLabel.innerText = `${provedor}: Disponível`;
    availabilityLabel.style.color = "#2ecc71";
}

function validarAcesso() {
    if (nivelDePerigo !== "Não Perigoso") {
        const modal = document.getElementById('securityModal');
        const msg = document.getElementById('modalMsg');
        if (msg) msg.innerText = CONFIG_SEGURANCA[nivelDePerigo].msg;
        if (modal) modal.style.display = 'flex';
    } else {
        window.open(linkFinal, '_blank');
    }
}

// Funções globais do Modal
window.confirmarAcesso = () => {
    window.open(linkFinal, '_blank');
    fecharModal();
};

window.fecharModal = () => {
    const modal = document.getElementById('securityModal');
    if (modal) modal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', carregarPost);
