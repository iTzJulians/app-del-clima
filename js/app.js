import { fetchWeatherByCity } from './weather.js';
import { describeWeather } from './wmo.js';
import { formatTemp, capitalize } from './format.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const message = document.querySelector('#message');
const weatherSection = document.querySelector('#weather');

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = `message ${isError ? 'message--error' : ''}`;
}

function renderWeather(data) {
  const title = [data.city, data.country].filter(Boolean).join(', ') || 'Ubicación';

  weatherSection.innerHTML = `
    <article class="card">
      <h2>${title}</h2>
      <p class="temp">${formatTemp(data.temperature)}</p>
      <p>${capitalize(describeWeather(data.weatherCode))}</p>
      <p>Sensación: ${formatTemp(data.feelsLike)} · Humedad: ${data.humidity}%</p>
      <p>Viento: ${Math.round(data.windSpeed)} km/h</p>
    </article>
  `;
  showMessage('');
}

async function handleSearch(event) {
  event.preventDefault();
  const city = input.value.trim();

  if (!city) {
    showMessage('Escribe el nombre de una ciudad.', true);
    return;
  }

  showMessage('Consultando...');
  weatherSection.innerHTML = '';

  try {
    const data = await fetchWeatherByCity(city);
    renderWeather(data);
  } catch (error) {
    showMessage(error?.reason ?? error?.message ?? 'Error al consultar el clima.', true);
  }
}

form.addEventListener('submit', handleSearch);
input.focus();