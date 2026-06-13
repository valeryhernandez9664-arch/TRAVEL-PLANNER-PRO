const HistoryManager = {
  save(country) {
    const history = JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
      country,
      date: new Date().toLocaleDateString(),
      hour: new Date().toLocaleTimeString(),
    });

    // mantener máximo 30 entradas
    if (history.length > 30) history.length = 30;

    localStorage.setItem("history", JSON.stringify(history));
  },

  deleteEntry(index) {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.splice(index, 1);
    localStorage.setItem("history", JSON.stringify(history));
    this.render();
  },

  clearAll() {
    localStorage.removeItem("history");
    this.render();
  },

  render() {
    const container = document.getElementById("history");
    const history = JSON.parse(localStorage.getItem("history")) || [];

    container.innerHTML = `
      <h2>Historial de búsquedas</h2>
      <div class="history-controls">
        <button class="btn btn-small btn-clear" onclick="HistoryManager.clearAll()">Borrar historial</button>
      </div>
      <div class="history-list"></div>
    `;

    const listEl = container.querySelector('.history-list');
    if (!history.length) {
      listEl.innerHTML = '<p class="muted">No hay búsquedas recientes.</p>';
      return;
    }

    history.forEach((item, idx) => {
      listEl.innerHTML += `
        <div class="history-item card">
          <div class="history-left">
            <strong>${item.country}</strong>
            <div class="history-meta">${item.date} • ${item.hour}</div>
          </div>
          <div class="history-actions">
            <button class="btn btn-small btn-delete" onclick="HistoryManager.deleteEntry(${idx})">Eliminar</button>
          </div>
        </div>
      `;
    });
  },
};
