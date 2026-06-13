// src/script/app.js

document.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
  const themeBtn = document.getElementById("theme-toggle");

  themeBtn.addEventListener("click", toggleTheme);

  document
    .getElementById("register-form")
    .addEventListener("submit", saveRegistration);
  
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  
  searchBtn.addEventListener("click", startSearch);
  
  // Buscar al presionar Enter
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      startSearch();
    }
  });
});
// Cargar tema guardado al iniciar
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

// Cambiar tema
function toggleTheme() {
  document.body.classList.toggle("dark");

  const current = document.body.classList.contains("dark") ? "dark" : "light";

  localStorage.setItem("theme", current);
}

function checkUserSession() {
  const user = StorageManager.getUser();
  const modal = document.getElementById("register-modal");
  const welcome = document.getElementById("welcome-message");

  if (!user) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
    welcome.textContent = `Hola, ${user.name} ✨`; // Módulo 1 listo
  }
}

function saveRegistration(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const country = document.getElementById("reg-country").value.trim();

  if (name && email && country) {
    StorageManager.saveUser({ name, email, country });
    checkUserSession();
  }
}

async function startSearch() {
  const input = document.getElementById("search-input");
  const query = input.value.trim();
  const errorBox = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const results = document.getElementById("results-wrapper");

  if (!query) return;

  errorBox.classList.add("hidden");
  results.classList.add("hidden");
  loader.classList.remove("hidden"); // Activar Loader de carga obligado

  try {
    // Módulo 3: Buscar información general
    const countryData = await CountriesAPI.fetchCountry(query);
    CountriesAPI.render(countryData);

    // BOTÓN GUARDAR FAVORITO

    document.getElementById("saveCountry").addEventListener("click", () => {
      FavoritesManager.saveFavorite({
        name: countryData.name,

        flag: countryData.flag,
      });
    });
    // HISTORIAL

    HistoryManager.save(countryData.name);

    HistoryManager.render();
    // CLIMA

    const [lat, lng] = countryData.latlng;

    const weatherData = await WeatherAPI.fetchWeather(lat, lng);
    WeatherAPI.render(weatherData);

    // Módulo: Conversor de monedas
    const exchangeData = await CurrencyAPI.fetchConversion(
      countryData.currencyCode,
    );
    CurrencyAPI.render(exchangeData, countryData.currencyCode);

    // Módulo: Buscar Lugares Turísticos
    const attractions = await TourismAPI.fetchAttractions(countryData.name, countryData.latlng);
    TourismAPI.render(attractions);

    // Desactivar cargador y mostrar todo el panel de módulos
    loader.classList.add("hidden");
    results.classList.remove("hidden");
  } catch (err) {
    loader.classList.add("hidden");
    errorBox.textContent =
      err.message || "❌ Error al conectar con los servidores. Intenta con otro país.";
    errorBox.classList.remove("hidden");
    console.error("Error en búsqueda:", err);
  }
}
