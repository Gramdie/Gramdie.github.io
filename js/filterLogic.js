document.getElementById('applyFilterBtn').onclick = () => {
    // Coleta os valores de todos os campos
    const filters = {
        title: document.getElementById('f-title').value.trim(),
        id: document.getElementById('f-id').value.trim(),
        date: document.getElementById('f-date').value.trim(),
        desc: document.getElementById('f-desc').value.trim(),
        url: document.getElementById('f-url').value.trim()
    };

    // Cria uma string de busca combinada
    // Vamos usar um formato que o searchlogic consiga interpretar
    // Ex: title:GTA|id:101|date:2026
    const queryString = Object.entries(filters)
        .filter(([_, value]) => value !== "")
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

    if (queryString !== "") {
        window.location.href = `search.html?adv=${encodeURIComponent(queryString)}`;
    } else {
        alert("Por favor, preencha pelo menos um campo para filtrar.");
    }
};
