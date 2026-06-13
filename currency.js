// src/script/currency.js

const CurrencyAPI = {
  async fetchConversion(targetCurrency) {
    try {
      const url = `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(targetCurrency)}&to=USD,EUR,GBP`;
      const response = await fetch(url);

      if (!response.ok) return null;
      const data = await response.json();
      if (!data.rates) return null;
      return data;
    } catch {
      return null;
    }
  },

  render(exchangeData, targetCurrency) {
    const container = document.getElementById('mod-currency');
    if (!container) return;

    const currencyTargets = ['USD', 'EUR', 'GBP'];
    const sameCurrencyRate = 1;
    const rates = exchangeData?.rates || {};

    const formatValue = (value) => (value === null ? 'N/A' : value.toFixed(2));
    const rows = currencyTargets.map((code) => {
      const rate = code === targetCurrency ? sameCurrencyRate : rates[code] ?? null;
      const displayValue = rate !== null ? formatValue(100 * rate) : 'N/A';
      return `
        <div class="info-item">
          <span>100 ${targetCurrency} equivalen a:</span>
          <span>${displayValue} ${code}</span>
        </div>`;
    });

    if (!exchangeData || Object.keys(rates).length === 0) {
      container.innerHTML = `
        <h2>Conversión Monetaria</h2>
        <div style="background: #fefce8; border: 1px dashed #fbbf24; padding: 15px; border-radius: 8px; color: #92400e; font-size: 0.9rem;">
          No se pudo obtener cotización en tiempo real para <b>${targetCurrency}</b>. Mostrando equivalencias de respaldo.
        </div>
        ${rows.join('')}
      `;
      return;
    }

    container.innerHTML = `
      <h2>Conversión Monetaria</h2>
      ${rows.join('')}
    `;
  },
};
