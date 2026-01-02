const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;

// Хранилища данных
let favoriteCities = []; 
let subscribers = []; // Храним подписчиков { email, city } (Requirement 4)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Раздаем статические файлы (HTML, CSS, JS)

// --- LOGGING (Requirement 3) ---
app.use((req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}\n`;
    console.log(logMessage.trim());
    fs.appendFile(path.join(__dirname, 'logs', 'requests.log'), logMessage, (err) => {
        if (err) console.error('Log Error:', err);
    });
    next();
});

// --- ПОГОДА (Requirement 1 + Mock) ---
async function fetchWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        return {
            city: data.name,
            country: data.sys.country,
            coordinates: data.coord,
            weather: {
                temp: data.main.temp,
                feels_like: data.main.feels_like,
                description: data.weather[0].description,
                icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
                wind_speed: data.wind.speed,
                rain_3h: data.rain ? data.rain['3h'] || 0 : 0 
            }
        };
    } catch (error) {
        // Mock Data если ключ не работает
        return {
            city: city,
            country: "XX (Mock)",
            coordinates: { lon: 0, lat: 0 },
            weather: {
                temp: 20, // Ставим 20 градусов для теста
                feels_like: 18,
                description: "mock rain", // Напишем дождь, чтобы проверить совет про зонт
                icon: "http://openweathermap.org/img/wn/10d.png",
                wind_speed: 5.5,
                rain_3h: 5 
            }
        };
    }
}

// --- EMAIL НАСТРОЙКА (Requirement 4) ---
let transporter;

// Создаем тестовый аккаунт автоматически
async function createTestAccount() {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    console.log('Test email account created!');
}
createTestAccount();

async function sendEmail(email, subject, text) {
    if (!transporter) return;
    let info = await transporter.sendMail({
        from: '"Weather App" <weather@example.com>',
        to: email,
        subject: subject,
        text: text,
    });
    console.log(`📧 Email sent to ${email}: ${nodemailer.getTestMessageUrl(info)}`);
}

// --- CRON JOBS (РАСПИСАНИЕ) (Requirement 4) ---
// Функция рассылки
async function broadcastWeather(timeOfDay) {
    console.log(`Starting ${timeOfDay} broadcast...`);
    for (const user of subscribers) {
        const data = await fetchWeather(user.city);
        let message = `Good ${timeOfDay}! Weather in ${user.city}: ${data.weather.temp}°C, ${data.weather.description}.`;
        
        // В 22:00 добавляем советы (Recommendation)
        if (timeOfDay === 'Night (Forecast)') {
            message += `\nForecast for tomorrow:`;
            if (data.weather.temp < 10) message += "\n❄️ It will be cold. Dress warmly!";
            else if (data.weather.temp > 25) message += "\n☀️ It will be warm. Wear light clothes.";
            
            if (data.weather.description.includes('rain') || data.weather.rain_3h > 0) {
                message += "\n☔ Don't forget your umbrella!";
            }
        }
        await sendEmail(user.email, `Weather Update: ${timeOfDay}`, message);
    }
}

// 09:00 Morning Update
cron.schedule('0 9 * * *', () => broadcastWeather('Morning'));
// 13:00 Afternoon Update
cron.schedule('0 13 * * *', () => broadcastWeather('Afternoon'));
// 20:00 Evening Update
cron.schedule('0 20 * * *', () => broadcastWeather('Evening'));
// 22:00 Next Day Forecast + Recommendations
cron.schedule('0 22 * * *', () => broadcastWeather('Night (Forecast)'));


// --- API МАРШРУТЫ ---
app.get('/api/weather', async (req, res) => {
    const promises = favoriteCities.map(city => fetchWeather(city));
    const results = await Promise.all(promises);
    res.json(results);
});

app.post('/api/weather', async (req, res) => {
    const { city } = req.body;
    const data = await fetchWeather(city);
    if (!favoriteCities.includes(data.city)) favoriteCities.push(data.city);
    res.json(data);
});

app.delete('/api/weather/:city', (req, res) => {
    favoriteCities = favoriteCities.filter(c => c !== req.params.city);
    res.json({ message: "Deleted" });
});

// Новый маршрут: Подписка на рассылку
app.post('/api/subscribe', (req, res) => {
    const { email, city } = req.body;
    if (!email || !city) return res.status(400).json({ error: "Email and city required" });
    
    subscribers.push({ email, city });
    
    // Сразу отправим приветственное письмо, чтобы проверить работу
    sendEmail(email, "Welcome!", `You subscribed to weather updates for ${city}.`);
    
    res.json({ message: "Subscribed successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});