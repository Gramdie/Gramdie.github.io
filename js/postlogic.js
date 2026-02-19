const SHEETDB_URL = "https://sheetdb.io/api/v1/9sv7pjhrhpwbq"; 

const form = document.getElementById('createGameForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerText = "Publicando...";

        const uniqueId = Date.now().toString();
        const selectedGenres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value).join(', ');

        const gameData = {
            data: [{
                id: uniqueId,
                title: document.getElementById('title').value,
                banner: document.getElementById('banner').value,
                description: document.getElementById('description').value,
                genres: selectedGenres,
                mainLink: document.getElementById('mainLink').value,
                date: new Date().toLocaleDateString('pt-BR')
            }]
        };

        try {
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameData)
            });

            if (!response.ok) throw new Error("Erro na API");

            if (confirm("Jogo publicado!\n\nOK: Ver Jogo\nCANCELAR: Início")) {
                window.location.href = `post.html?id=${uniqueId}`;
            } else {
                window.location.href = '../index.html';
            }
        } catch (err) {
            alert("Erro: " + err.message);
            submitBtn.disabled = false;
        }
    };
}
