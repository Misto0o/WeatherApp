// API Key and Base URL
const API_KEY = '5c5466de88b1afd98f17835699194c34';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default temperature unit (Celsius)
let temperatureUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit

// Function to get weather data
async function getWeather() {
    const cityName = document.getElementById('city').value.trim();

    if (!cityName) {
        alert('Please enter a city name');
        return;
    }

    const closestCity = await getCityFromGeocoding(cityName);

    if (!closestCity) {
        alert('City not found. Please check the spelling or try another city.');
        return;
    }

    const lat = closestCity.coord.lat;
    const lon = closestCity.coord.lon;

    try {
        const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${temperatureUnit}&appid=${API_KEY}`);
        const weatherData = await response.json();

        if (weatherData.cod !== 200) {
            throw new Error(weatherData.message || 'Error fetching weather data.');
        }

        displayWeather(weatherData);
        getHourlyForecast(lat, lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message);
    }
}

// Function to get the closest city match using Geocoding API
async function getCityFromGeocoding(query) {
    const encodedCityName = encodeURIComponent(query);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${encodedCityName}&type=like&appid=${API_KEY}`);
        const geoData = await response.json();

        if (geoData.cod !== "200" || !geoData.list.length) {
            return null;
        }

        return geoData.list[0]; // Choose the first match
    } catch (error) {
        console.error('Error with geocoding API:', error);
        return null;
    }
}

// Function to display the current weather
function displayWeather(data) {
    const tempDiv = document.getElementById('temp-div');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherInfo = document.getElementById('weather-info');

    const temperature = data.main.temp;
    const weatherDesc = data.weather[0].description;
    const icon = data.weather[0].icon;

    tempDiv.innerHTML = `<p>${Math.round(temperature)}°${temperatureUnit === 'metric' ? 'C' : 'F'}</p>`;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDesc}">`;
    weatherInfo.innerHTML = `<p>${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)}</p>`;
}

// Function to toggle temperature units
function toggleTemperatureUnit() {
    temperatureUnit = temperatureUnit === 'metric' ? 'imperial' : 'metric';
    getWeather();
}

// Function to get hourly forecast data
async function getHourlyForecast(lat, lon) {
    try {
        const response = await fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${temperatureUnit}&appid=${API_KEY}`);
        const data = await response.json();

        displayHourlyForecast(data);
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
    }
}

// Function to display hourly forecast
function displayHourlyForecast(data) {
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.innerHTML = ''; // Clear existing items

    data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000).getHours();
        const temperature = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');

        hourlyItem.innerHTML = `
            <p>${time}:00</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">
            <p>${temperature}°${temperatureUnit === 'metric' ? 'C' : 'F'}</p>
        `;

        hourlyForecast.appendChild(hourlyItem);
    });
}