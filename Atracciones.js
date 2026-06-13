const AttractionManager = {
  getAttractions() {
    return JSON.parse(localStorage.getItem("favorite_attractions")) || [];
  },

  save(attraction) {
    const list = this.getAttractions();

    // evitar duplicados por nombre
    const exists = list.some((a) => a.name === attraction.name);
    if (!exists) {
      list.push(attraction);
      localStorage.setItem("favorite_attractions", JSON.stringify(list));
    }

    this.render();
  },

  deleteAttraction(index) {
    const list = this.getAttractions();
    list.splice(index, 1);
    localStorage.setItem("favorite_attractions", JSON.stringify(list));
    this.render();
  },

  render() {
    const container = document.getElementById("favorite-attractions");
    const data = this.getAttractions();

    // Mantener el título y renderizar la lista como grid
    container.innerHTML = `
      <h2>Atracciones favoritas</h2>
      <div class="favorite-list"></div>
    `;

    const listEl = container.querySelector('.favorite-list');

    if (!data.length) {
      listEl.innerHTML = '<p class="muted">No hay atracciones guardadas aún.</p>';
      return;
    }

    data.forEach((item, index) => {
      listEl.innerHTML += `
        <div class="fav-card card">
          <div class="fav-media">
            <img src="${item.image || 'https://picsum.photos/seed/fav' + index + '/200/120'}" alt="${item.name}" class="fav-img">
          </div>
          <div class="fav-body">
            <h4>${item.name}</h4>
            <p class="fav-cat">${item.category || ''}</p>
            <p class="fav-desc">${item.description || ''}</p>
          </div>
          <div class="fav-actions">
            <button class="btn btn-delete" onclick="AttractionManager.deleteAttraction(${index})">Eliminar</button>
          </div>
        </div>
      `;
    });
  },
};
