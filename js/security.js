// js/security.js

window.abrirVerificacaoVT = () => {
    // Tenta pegar o link da variável global
    const linkParaCopiar = window.linkDownloadAtual;

    if (!linkParaCopiar || linkParaCopiar === "") {
        alert("O link ainda está sendo carregado, por favor aguarde um instante");
        return;
    }

    // Processo de cópia
    navigator.clipboard.writeText(linkParaCopiar).then(() => {
        const devePular = localStorage.getItem('pularConfirmacaoVT');

        if (devePular === 'true') {
            window.open('https://www.virustotal.com/gui/home/url', '_blank');
        } else {
            const modal = document.getElementById('vtModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }
    }).catch(err => {
        console.log("Falha ao copiar o link");
    });
};

window.fecharVTModal = () => {
    salvarEscolhaPrivacidade();
    document.getElementById('vtModal').style.display = 'none';
};

window.irParaVT = () => {
    salvarEscolhaPrivacidade();
    window.open('https://www.virustotal.com/gui/home/url', '_blank');
    document.getElementById('vtModal').style.display = 'none';
};

function salvarEscolhaPrivacidade() {
    const checkbox = document.getElementById('dontShowVT');
    if (checkbox && checkbox.checked) {
        localStorage.setItem('pularConfirmacaoVT', 'true');
    }
}
