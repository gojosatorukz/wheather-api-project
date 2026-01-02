// Инициализация карты (Leaflet)
const map = L.map('map').setView([20, 0], 2); // Центр мира
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = []; // Храним метки на карте, чтобы удалять старые

// 1. Функция загрузки всех городов
async function loadWeather() {
    const response = await fetch('/api/weather');
    const cities = await response.json();
    
    const container = document.getElementById('weatherContainer');
    container.innerHTML = ''; // Очищаем старое

    // Удаляем старые метки с карты
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    cities.forEach(data => {
        // Добавляем карточку погоды
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteCity('${data.city}')">X</button>
            <h3>${data.city}, ${data.country || 'N/A'}</h3>
            <img src="${data.weather.icon}" alt="icon">
            <h1>${Math.round(data.weather.temp)}°C</h1>
            <p>${data.weather.description}</p>
            <p>💨 Wind: ${data.weather.wind_speed} m/s</p>
            <p>💧 Rain (3h): ${data.weather.rain_3h} mm</p>
        `;
        container.appendChild(card);

        // Добавляем метку на карту (Requirement 1)
        if (data.coordinates) {
            const marker = L.marker([data.coordinates.lat, data.coordinates.lon])
                .addTo(map)
                .bindPopup(`<b>${data.city}</b><br>${data.weather.temp}°C`);
            markers.push(marker);
        }
    });
}

// 2. Функция добавления города
async function addCity() {
    const input = document.getElementById('cityInput');
    const city = input.value;
    if (!city) return alert('Please enter a city name');

    const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
    });

    if (res.ok) {
        input.value = ''; // Очистить поле
        loadWeather();    // Обновить список
    } else {
        alert('Error adding city. Check name or API key.');
    }
}

// 3. Функция удаления города
async function deleteCity(city) {
    await fetch(`/api/weather/${city}`, { method: 'DELETE' });
    loadWeather();
}

// 4. Функция подписки (Email)
async function subscribe() {
    const email = document.getElementById('emailInput').value;
    const city = document.getElementById('subCityInput').value;
    
    if (!email || !city) return alert('Fill all fields');

    const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city })
    });
    
    const data = await res.json();
    alert(data.message || 'Subscribed!');
}

// Загружаем данные при старте страницы
loadWeather();