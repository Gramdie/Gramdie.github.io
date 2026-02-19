// js/security.js

window.abrirVerificacaoVT = () => {
    // Busca a variável global definida no outro arquivo
    const link = window.linkDownloadAtual;

    if (!link || link === "") {
        console.log("Aguardando carregamento do link de download");
        return;
    }

    // Copia para a área de transferência
    navigator.clipboard.writeText(link).then(() => {
        const ocultar = localStorage.getItem('pularAvisoVT');
        
        if (ocultar === 'true') {
            window.open('https://www.virustotal.com/gui/home/url', '_blank');
        } else {
            const modal = document.getElementById('vtModal');
            if (modal) modal.style.display = 'flex';
        }
    });
};

window.fecharVTModal = () => {
    salvarEscolha();
    const modal = document.getElementById('vtModal');
    if (modal) modal.style.display = 'none';
};

window.irParaVT = () => {
    salvarEscolha();
    window.open('https://www.virustotal.com/gui/home/url', '_blank');
    const modal = document.getElementById('vtModal');
    if (modal) modal.style.display = 'none';
};

function salvarEscolha() {
    const check = document.getElementById('dontShowVT');
    if (check && check.checked) {
        localStorage.setItem('pularAvisoVT', 'true');
    }
}
