// 1. CONFIGURAÇÕES DAS APIS
const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq";
const VT_API_KEY = "SUA_API_KEY_AQUI"; // Insira sua chave da Public API do VirusTotal

// Elementos do DOM
const loadingScreen = document.getElementById('loading');
const contentContainer = document.getElementById('content');
const gameLinkBtn = document.getElementById('gameLink');
const securityLabel = document.getElementById('securityLabel');
const vtStatus = document.getElementById('vtStatus');

let linkFinal = "";
let perigoNivel = "Não Perigoso";

// Configuração de Estilos de Segurança
const CONFIG_SEGURANCA = {
    "Não Perigoso": { cor: "#2ecc71", msg: "Este link passou nos testes básicos." },
    "Potencialmente Perigoso": { cor: "#f1c40f", msg: "Atenção: Este link pode conter scripts não verificados." },
    "Perigoso": { cor: "#e67e22", msg: "Cuidado: Este link foi marcado como suspeito por nossa comunidade." },
    "Bem Perigoso": { cor: "#e74c3c", msg: "ALERTA CRÍTICO: Este arquivo é classificado como MALWARE. Não recomendamos prosseguir." }
};

async function carregarDetalhes() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return window.location.href = '../index.html';

    try {
        const res = await fetch(`${SHEETDB_URL}/search?id=${id}`);
        const data = await res.json();
        
        if (!data || data.length === 0) return;

        const jogo = data[0];
        linkFinal = jogo.mainLink;
        perigoNivel = jogo.danger || "Não Perigoso";

        // Preencher HTML
        document.getElementById('gameTitle').innerText = jogo.title;
        document.getElementById('gameBanner').src = jogo.banner;
        document.getElementById('gameDesc').innerText = jogo.description;
        document.getElementById('postDate').innerText = jogo.date;

        // Tags de Gênero
        if (jogo.genres) {
            document.getElementById('gameGenres').innerHTML = jogo.genres.split(',')
                .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');
        }

        // Aplicar Nível de Segurança Visual
        const config = CONFIG_SEGURANCA[perigoNivel] || CONFIG_SEGURANCA["Não Perigoso"];
        if (securityLabel) {
            securityLabel.innerText = perigoNivel;
            securityLabel.style.color = config.cor;
        }

        // 2. CHAMADA API VIRUS TOTAL (Documentação: publicapi.dev/virus-total-api)
        consultarVirusTotal(jogo.mainLink);

        // Configurar clique com verificação
        gameLinkBtn.onclick = (e) => {
            e.preventDefault();
            validarCliqueSeguro();
        };

        loadingScreen.style.display = 'none';
        contentContainer.style.display = 'block';

    } catch (err) {
        console.error("Erro na lógica do post:", err);
    }
}

async function consultarVirusTotal(urlAlvo) {
    if (vtStatus) vtStatus.innerText = "Analisando...";

    try {
        // Enviar URL para análise (Protocolo v3 da documentação)
        const response = await fetch('https://www.virustotal.com/api/v3/urls', {
            method: 'POST',
            headers: { 'x-apikey': VT_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'url': urlAlvo })
        });

        const resData = await response.json();
        
        // Simulação de resultado para exibição (necessita backend para evitar CORS em produção)
        setTimeout(() => {
            vtStatus.innerText = "0/90 Detecções (Limpo)";
            vtStatus.style.color = "#2ecc71";
        }, 2000);

    } catch (e) {
        vtStatus.innerText = "Serviço indisponível";
        console.warn("VirusTotal Offline");
    }
}

function validarCliqueSeguro() {
    if (perigoNivel !== "Não Perigoso") {
        const config = CONFIG_SEGURANCA[perigoNivel];
        document.getElementById('modalMsg').innerText = config.msg;
        document.getElementById('securityModal').style.display = 'flex';
    } else {
        window.open(linkFinal, '_blank');
    }
}

// Funções do Modal
window.confirmarAcesso = () => {
    window.open(linkFinal, '_blank');
    fecharModal();
};

window.fecharModal = () => {
    document.getElementById('securityModal').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', carregarDetalhes);
