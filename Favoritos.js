const FavoritesManager = {
  getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  },

  saveFavorite(country) {
    const favorites = this.getFavorites();

    const exists = favorites.some((item) => item.name === country.name);

    if (!exists) {
      favorites.push(country);

      localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    this.renderFavorites();
  },

  deleteFavorite(index) {
    const favorites = this.getFavorites();

    favorites.splice(index, 1);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    this.renderFavorites();
  },
  renderFavorites() {
    const container = document.getElementById("favorites");
    const favorites = this.getFavorites();

    container.innerHTML = `
      <h2>Destinos favoritos</h2>
      <div class="favorite-countries"></div>
    `;

    const listEl = container.querySelector('.favorite-countries');

    if (!favorites.length) {
      listEl.innerHTML = '<p class="muted">No hay destinos favoritos aún.</p>';
      return;
    }

    favorites.forEach((country, index) => {
      listEl.innerHTML += `
        <div class="fav-country card">
          <img src="${country.flag}" alt="${country.name}" class="fav-flag">
          <div class="fav-country-body">
            <h3>${country.name}</h3>
          </div>
          <div class="fav-actions">
            <button class="btn btn-delete" onclick="FavoritesManager.deleteFavorite(${index})">Eliminar</button>
          </div>
        </div>
      `;
    });
  },
};
