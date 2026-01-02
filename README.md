# Weather API Application 🌦️

## Description
This project is a functional weather API application developed as part of Assignment 2. It fetches real-time weather data using the OpenWeatherMap API, processes it, and provides a RESTful API for client applications. The project includes a responsive frontend dashboard with geolocation mapping and an automated email notification system.

## Features
* **Real-time Weather:** Displays temperature, humidity, wind speed, rain volume, and coordinates .
* **Interactive Map:** Visualizes city locations using Leaflet.js maps.
* **RESTful API:** Endpoints to manage favorite cities (GET, POST, PUT, DELETE) .
* **Logging:** Custom server-side middleware to log all incoming requests to console and file .
* **Email Notifications:** Automated scheduling (Cron jobs) for weather updates at 09:00, 13:00, 20:00, and 22:00 with personalized recommendations .

## Technologies Used
* **Node.js & Express:** Backend server framework.
* **Axios:** For fetching external API data.
* **Nodemailer:** For SMTP email notifications.
* **Node-cron:** For scheduling tasks.
* **Leaflet.js:** For rendering maps.
* **CSS3:** For responsive design.

---

## Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** installed on your machine.

### 2. Installation
1.  Clone or download the project folder.
2.  Open the terminal in the project directory.
3.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Configuration
Create a `.env` file in the root directory and add the following:
```env
PORT=3000
WEATHER_API_KEY=your_openweathermap_api_key_here

```

*(Replace `your_openweathermap_api_key_here` with your actual API key)*.

### 4. Running the Application

Start the server:

```bash
node server.js

```

The server will run on `http://localhost:3000`.

---

## API Documentation

### Weather Endpoints

| Method | Endpoint | Description | Body Parameters |
| --- | --- | --- | --- |
| **GET** | `/api/weather` | Returns weather data for all favorite cities. | None |
| **GET** | `/api/weather/:city` | Returns weather data for a specific city. | None |
| **POST** | `/api/weather` | Adds a new city to the favorites list. | `{ "city": "London" }` |
| **DELETE** | `/api/weather/:city` | Removes a city from the favorites list. | None |
| **PUT** | `/api/weather/:city` | Changes the position of a city in the list. | `{ "newIndex": 1 }` |

### Subscription Endpoint

| Method | Endpoint | Description | Body Parameters |
| --- | --- | --- | --- |
| **POST** | `/api/subscribe` | Subscribes a user to email updates. | `{ "email": "user@example.com", "city": "Almaty" }` |

---

## Key Design Decisions

1. **Architecture:**
* The project follows a modified MVC pattern. The backend (`server.js`) handles logic and routing, while the `public` folder serves the Frontend (View).
* **In-Memory Storage:** To keep the application lightweight and focus on logic implementation, data (cities and subscribers) is stored in variables (arrays) as permitted by the assignment requirements .


2. **Email Service (Ethereal):**
* For testing purposes, **Ethereal Email** (a fake SMTP service) is used. This allows verifying that emails are sent (via console links) without needing real sensitive credentials like Gmail passwords.


3. **Logging Strategy:**
* A custom middleware was implemented to capture Method, URL, IP, and Timestamp *before* the request reaches the route handler to ensure every interaction is recorded .


4. **Frontend:**
* **Leaflet.js** was chosen over Google Maps because it is open-source, free, and does not require a credit card for API access.



---

## Project Structure

```
weather-api-project/
├── logs/
│   └── requests.log       # Server request logs
├── public/
│   ├── index.html         # Main dashboard
│   ├── style.css          # Styles and responsive design
│   └── script.js          # Client-side logic and map rendering
├── .env                   # Environment variables (API Key)
├── package.json           # Dependencies list
├── server.js              # Main server file (Backend)
└── README.md              # Documentation

```

```

***