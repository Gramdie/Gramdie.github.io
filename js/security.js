// js/security.js

// Função para abrir a verificação do VirusTotal
window.abrirVerificacaoVT = () => {
    const linkParaCopiar = linkDownloadAtual;

    if (!linkParaCopiar) {
        console.log("Erro: link de download não encontrado para copiar");
        return;
    }

    // Copia o link para a área de transferência
    navigator.clipboard.writeText(linkParaCopiar).then(() => {
        console.log("Link copiado com sucesso");
        
        // Verifica se o utilizador marcou para não mostrar o modal
        const esconderAviso = localStorage.getItem('gramdie_hide_vt_modal');

        if (esconderAviso === 'true') {
            direcionarParaVT();
        } else {
            exibirModalVT();
        }
    }).catch(err => {
        console.log("Erro ao copiar link");
    });
};

// Exibe o modal na tela
function exibirModalVT() {
    const modal = document.getElementById('vtModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Fecha o modal e salva preferência se necessário
window.fecharVTModal = () => {
    salvarPreferenciaUtilizador();
    const modal = document.getElementById('vtModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Abre o site do VirusTotal e fecha o modal
window.irParaVT = () => {
    salvarPreferenciaUtilizador();
    direcionarParaVT();
    const modal = document.getElementById('vtModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Redireciona para a página de URL do VirusTotal
function direcionarParaVT() {
    window.open('https://www.virustotal.com/gui/home/url', '_blank');
}

// Guarda no navegador se o utilizador não quer mais ver o popup
function salvarPreferenciaUtilizador() {
    const checkbox = document.getElementById('dontShowVT');
    if (checkbox && checkbox.checked) {
        localStorage.setItem('gramdie_hide_vt_modal', 'true');
        console.log("Preferência de ocultar modal guardada");
    }
}
