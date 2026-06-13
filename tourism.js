// src/script/tourism.js

const TourismAPI = {
    apiKey: '123456789',

    async fetchAttractions(countryName, latlng = [0, 0]) {
        const seed = this.normalizeSeed(countryName);
        const [lat, lon] = Array.isArray(latlng) ? latlng : [0, 0];

        if (!this.apiKey || this.apiKey.includes('YOUR_')) {
            console.warn('OpenTripMap API key missing. Usando datos de respaldo.');
            return this.getFallbackAttractions(seed);
        }

        if (!lat || !lon) {
            return this.getFallbackAttractions(seed);
        }

        try {
            const radius = 40000;
            const listUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&limit=8&rate=2&kinds=interesting_places&format=json&apikey=${this.apiKey}`;
            const listResponse = await fetch(listUrl);
            if (!listResponse.ok) throw new Error('OpenTripMap no respondió la lista de lugares.');

            const listData = await listResponse.json();
            const places = Array.isArray(listData)
                ? listData
                : Array.isArray(listData.features)
                ? listData.features.map((item) => item.properties || item)
                : [];

            if (places.length === 0) {
                return this.getFallbackAttractions(seed);
            }

            const attractions = await Promise.all(
                places.slice(0, 5).map(async (place, index) => {
                    try {
                        const xid = place.xid || place.properties?.xid;
                        if (!xid) throw new Error('Identificador de lugar no disponible.');

                        const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${this.apiKey}`;
                        const detailResponse = await fetch(detailUrl);
                        if (!detailResponse.ok) throw new Error('No se pudo cargar detalle de lugar.');
                        const detail = await detailResponse.json();
                        return {
                            name: detail.name || place.name || `Lugar ${index + 1}`,
                            img: detail.preview?.source || `https://picsum.photos/seed/${seed}atraccion${index}/500/300`,
                            cat: detail.kinds ? detail.kinds.split(',')[0] : 'Atracción',
                            desc: detail.wikipedia_extracts?.text || detail.info?.descr || place.name || 'Lugar interesante para visitar.',
                        };
                    } catch (err) {
                        return {
                            name: place.name || `Lugar ${index + 1}`,
                            img: `https://picsum.photos/seed/${seed}atraccion${index}/500/300`,
                            cat: 'Atracción',
                            desc: 'Lugar interesante para visitar.',
                        };
                    }
                }),
            );

            const cleaned = attractions.filter(Boolean);
            if (cleaned.length >= 5) {
                return cleaned;
            }

            const missing = 5 - cleaned.length;
            return cleaned.concat(this.getFallbackAttractions(seed).slice(0, missing));
        } catch (error) {
            console.warn('Error OpenTripMap:', error);
            return this.getFallbackAttractions(seed);
        }
    },

    normalizeSeed(text) {
        return text.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    },

    getFallbackAttractions(seed) {
        return [
            { name: 'Palacio y Monumento Histórico', img: `https://picsum.photos/seed/${seed}palacio/500/300`, cat: 'Cultura', desc: 'Edificación emblemática con un alto valor patrimonial y arquitectónico.' },
            { name: 'Parque Nacional de la Reserva', img: `https://picsum.photos/seed/${seed}parque/500/300`, cat: 'Naturaleza', desc: 'Espacio natural protegido ideal para el ecoturismo y caminatas al aire libre.' },
            { name: 'Plaza Mayor y Distrito Histórico', img: `https://picsum.photos/seed/${seed}plaza/500/300`, cat: 'Público', desc: 'Punto de encuentro icónico de la ciudad rodeado de centros culturales y gastronomía.' },
            { name: 'Museo Central de Bellas Artes', img: `https://picsum.photos/seed/${seed}museo/500/300`, cat: 'Museo', desc: 'Galería que alberga las colecciones artísticas e históricas más importantes del país.' },
            { name: 'Santuario de la Catedral Vieja', img: `https://picsum.photos/seed/${seed}catedral/500/300`, cat: 'Arquitectura', desc: 'Templo religioso emblemático con imponentes decorados y siglos de antigüedad.' },
        ];
    },

    render(list) {
        const container = document.getElementById('mod-tourism');
        const items = Array.isArray(list) && list.length ? list : this.getFallbackAttractions('fallback');
        container.innerHTML = `
            <h2>Lugares Recomendados</h2>
            <div class="attractions-list">
                ${items
                    .map(
                        (item, idx) => `
                    <div class="attraction-item">
                        <img src="${item.img}" class="attraction-img" alt="${item.name}">
                        <div class="attraction-info">
                            <span class="category">${item.cat}</span>
                            <h4>${item.name}</h4>
                            <p>${item.desc}</p>
                            <div class="attraction-actions">
                                <button class="btn btn-small btn-save" 
                                    data-name="${encodeURIComponent(item.name)}" 
                                    data-cat="${encodeURIComponent(item.cat)}" 
                                    data-img="${encodeURIComponent(item.img)}" 
                                    data-desc="${encodeURIComponent(item.desc)}">
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                `,
                    )
                    .join('')}
            </div>
        `;

        // Vincular botones "Guardar" para agregar atracciones favoritas
        setTimeout(() => {
            const buttons = container.querySelectorAll('.btn-save');
            buttons.forEach((btn) => {
                btn.removeEventListener('click', btn._atClick);
                const handler = () => {
                    try {
                        AttractionManager.save({
                            name: decodeURIComponent(btn.dataset.name || ''),
                            category: decodeURIComponent(btn.dataset.cat || ''),
                            image: decodeURIComponent(btn.dataset.img || ''),
                            description: decodeURIComponent(btn.dataset.desc || ''),
                        });
                    } catch (e) {
                        console.error('Error guardando atracción:', e);
                    }
                };
                btn._atClick = handler;
                btn.addEventListener('click', handler);
            });
        }, 40);
    },
};