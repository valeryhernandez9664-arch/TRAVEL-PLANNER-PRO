// src/script/weather.js

const WeatherAPI = {
  async fetchWeather(lat, lng) {
    const openMeteo = await this.fetchWeatherOpenMeteo(lat, lng);
    if (openMeteo) return openMeteo;
    return await this.fetchWeatherMetNo(lat, lng);
  },

  async fetchWeatherOpenMeteo(lat, lng) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al consultar Open-Meteo');
      const data = await response.json();

      if (!data.current_weather) return null;

      let humidity = null;
      if (data.hourly && Array.isArray(data.hourly.time) && Array.isArray(data.hourly.relativehumidity_2m)) {
        // Extraer la hora actual (sin minutos): "2026-06-13T12:45" → "2026-06-13T12:00"
        const currentHour = data.current_weather.time.substring(0, 13) + ':00';
        const index = data.hourly.time.indexOf(currentHour);
        if (index !== -1) {
          humidity = data.hourly.relativehumidity_2m[index];
        }
      }

      return {
        weather_code: data.current_weather.weathercode,
        temperature_2m: data.current_weather.temperature,
        relative_humidity_2m: humidity !== null ? humidity : 'N/A',
        wind_speed_10m: data.current_weather.windspeed,
      };
    } catch {
      return null;
    }
  },

  async fetchWeatherMetNo(lat, lng) {
    try {
      const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'travel.pro/1.0 (+https://localhost)',
        },
      });
      if (!response.ok) throw new Error('Error al consultar Met.no');
      const data = await response.json();

      const timeseries = data?.properties?.timeseries;
      if (!Array.isArray(timeseries) || timeseries.length === 0) return null;

      const instant = timeseries[0]?.data?.instant?.details;
      if (!instant) return null;

      const symbol = timeseries[0]?.data?.next_1_hours?.summary?.symbol_code ||
        timeseries[0]?.data?.next_6_hours?.summary?.symbol_code || '';
      const weatherCode = this.mapMetNoSymbolToWeatherCode(symbol, instant.cloud_area_fraction);

      return {
        weather_code: weatherCode,
        temperature_2m: instant.air_temperature,
        relative_humidity_2m: instant.relative_humidity,
        wind_speed_10m: instant.wind_speed * 3.6,
      };
    } catch {
      return null;
    }
  },

  mapMetNoSymbolToWeatherCode(symbol, cloudFraction) {
    if (!symbol) {
      if (cloudFraction >= 85) return 3;
      if (cloudFraction >= 40) return 2;
      return 0;
    }

    const lower = symbol.toLowerCase();
    if (lower.includes('clearsky') || lower.includes('fair')) return 0;
    if (lower.includes('partlycloudy') || lower.includes('cloudy')) return 2;
    if (lower.includes('rain') || lower.includes('sleet') || lower.includes('showers')) return 51;
    if (lower.includes('snow') || lower.includes('hail')) return 61;
    if (lower.includes('thunder')) return 95;
    if (lower.includes('fog') || lower.includes('mist')) return 45;
    return 2;
  },

  getWeatherDesc(code) {
    if (code === 0) return 'Despejado ☀️';
    if (code >= 1 && code <= 3) return 'Parcialmente Nublado ⛅';
    if (code >= 45 && code <= 48) return 'Niebla 🌫️';
    if (code >= 51 && code <= 67) return 'Lluvia Ligera 🌧️';
    if (code >= 80 && code <= 82) return 'Chubascos 🌦️';
    if (code >= 95 && code <= 99) return 'Tormenta ⚡';
    return 'Nublado ☁️';
  },

  render(data) {
    const container = document.getElementById('mod-weather');
    if (!container) return;

    if (!data) {
      container.innerHTML = `<h2>Clima Actual</h2><p>Datos climáticos no disponibles.</p>`;
      return;
    }

    container.innerHTML = `
      <h2>Clima Actual</h2>
      <div class="info-item"><span>Estado:</span> <span>${this.getWeatherDesc(data.weather_code)}</span></div>
      <div class="info-item"><span>Temperatura:</span> <span>${data.temperature_2m} °C</span></div>
      <div class="info-item"><span>Humedad:</span> <span>${data.relative_humidity_2m ?? 'N/A'} %</span></div>
      <div class="info-item"><span>Viento:</span> <span>${data.wind_speed_10m.toFixed ? data.wind_speed_10m.toFixed(1) : data.wind_speed_10m} km/h</span></div>
    `;
  },
};
