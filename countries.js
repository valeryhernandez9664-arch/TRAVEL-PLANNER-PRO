// src/script/countries.js

console.log('countries.js cargado');

const CountriesAPI = {
  countriesData: null,

  translateInput(input) {
    const dict = {
      corea: 'south korea',
      'corea del sur': 'south korea',
      'corea del norte': 'north korea',
      japon: 'japan',
      'japón': 'japan',
      alemania: 'germany',
      francia: 'france',
      españa: 'spain',
      italia: 'italy',
      'estados unidos': 'usa',
      inglaterra: 'united kingdom',
      'reino unido': 'united kingdom',
      rusia: 'russia',
      brasil: 'brazil',
      belgica: 'belgium',
    };

    return dict[input.toLowerCase().trim()] || input.trim();
  },

  normalizeText(text = '') {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  },

  getCountryFlagUrl(cca2) {
    if (!cca2) return '';
    return `https://flagcdn.com/w80/${cca2.toString().toLowerCase()}.png`;
  },

  async loadCountries() {
    if (this.countriesData) return this.countriesData;

    const url = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo cargar la base de datos de países.');
    }

    this.countriesData = await response.json();
    return this.countriesData;
  },

  normalizeRestCountry(country = {}) {
    const currencyKey = Object.keys(country.currencies || {})[0] || 'USD';
    const languageKey = Object.keys(country.languages || {})[0] || 'eng';
    const flag = country?.flags?.svg || country?.flags?.png || this.getCountryFlagUrl(country?.cca2) || country?.flag || country?.flagEmoji || '';

    return {
      name: country?.name?.common ?? 'N/A',
      officialName: country?.name?.official ?? 'N/A',
      flag,
      capital: Array.isArray(country?.capital) && country.capital.length ? country.capital[0] : 'N/A',
      population: country?.population ? country.population.toLocaleString() : 'N/A',
      region: country?.region ?? 'N/A',
      subregion: country?.subregion ?? 'N/A',
      currencyCode: currencyKey,
      currencyName: country?.currencies?.[currencyKey]?.name ?? currencyKey,
      language: country?.languages?.[languageKey] ?? 'N/A',
      latlng: Array.isArray(country?.latlng) && country.latlng.length ? country.latlng : [0, 0],
    };
  },

  async findCountry(queryName) {
    const countries = await this.loadCountries();
    const normalizedQuery = this.normalizeText(queryName);

    return countries.find((country) => {
      const values = [];

      if (country.name) {
        values.push(country.name.common, country.name.official);
        if (country.name.native) {
          Object.values(country.name.native).forEach((nativeData) => {
            values.push(nativeData.common, nativeData.official);
          });
        }
      }

      if (country.altSpellings) {
        values.push(...country.altSpellings);
      }

      if (country.translations) {
        Object.values(country.translations).forEach((translation) => {
          values.push(translation.common, translation.official);
        });
      }

      if (country.cca2) values.push(country.cca2);
      if (country.cca3) values.push(country.cca3);
      if (country.cioc) values.push(country.cioc);
      if (country.region) values.push(country.region);
      if (country.subregion) values.push(country.subregion);

      return values.some((value) => {
        if (!value) return false;
        const normalizedValue = this.normalizeText(value);
        return normalizedValue === normalizedQuery || normalizedValue.includes(normalizedQuery);
      });
    });
  },

  async fetchCountry(countryName) {
    const queryName = this.translateInput(countryName);

    try {
      const restUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(queryName)}?fullText=false`;
      const restResponse = await fetch(restUrl);
      if (restResponse.ok) {
        const restData = await restResponse.json();
        if (Array.isArray(restData) && restData.length) {
          return this.normalizeRestCountry(restData[0]);
        }
      }
    } catch (error) {
      console.warn('REST Countries API falló, usando fallback local.', error);
    }

    const country = await this.findCountry(queryName);
    if (!country) {
      throw new Error(`No se encontró información para "${countryName}". Intenta con otro país.`);
    }

    return this.normalizeRestCountry(country);
  },

  render(data) {
    const container = document.getElementById('mod-country');
    const hasFlagUrl = data?.flag && data.flag.toString().startsWith('http');
    const isEmojiFlag = data?.flag && !hasFlagUrl;
    const flagHtml = hasFlagUrl
      ? `<img src="${data.flag}" alt="Bandera de ${data.name}" class="flag-img" onerror="this.onerror=null;this.style.display='none';">`
      : isEmojiFlag
      ? `<div class="flag-emoji" aria-label="Bandera de ${data.name}">${data.flag}</div>`
      : '';

    container.innerHTML = `
      <div class="country-header">
        ${flagHtml}
        <div class="country-title">
          <h2>${data.name}</h2>
          <p>${data.region}${data.subregion ? ' • ' + data.subregion : ''}</p>
        </div>
      </div>
      <div class="divider"></div>
      <div class="info-item"><span>Nombre Oficial:</span> <span>${data.officialName}</span></div>
      <div class="info-item"><span>Capital:</span> <span>${data.capital}</span></div>
      <div class="info-item"><span>Población:</span> <span>${data.population}</span></div>
      <div class="info-item"><span>Región:</span> <span>${data.region}</span></div>
      <div class="info-item"><span>Idioma:</span> <span>${data.language}</span></div>
      <div class="info-item"><span>Moneda:</span> <span>${data.currencyName} (${data.currencyCode})</span></div>
      <button id="saveCountry" class="save-country-btn">⭐ Guardar Favorito</button>
    `;
  },
};

window.CountriesAPI = CountriesAPI;
