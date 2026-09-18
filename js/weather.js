const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherError extends Error {
  constructor(code, reason) {
    super(reason);
    this.name = 'WeatherError';
    this.code = code;
    this.reason = reason;
  }
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

export async function geoCodeCity(city) {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new WeatherError('weather-geocoding-error', 'No se pudo geocodificar la ciudad.');
  }

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) {
    throw new WeatherError('weather-city-not-found', `No se encontró la ciudad "${city}"`);
  }

  return {
    name: result.name,
    country: result.country_code ?? '',
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

async function fetchCurrentWeather(location) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', location.latitude);
  url.searchParams.set('longitude', location.longitude);
  url.searchParams.set('timezone', location.timezone ?? 'auto');
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new WeatherError('weather-service-error', 'El servicio climático respondió con un error.');
  }

  return response.json();
}

export function normalize(location, data) {
  const current = data?.current ?? {};

  return {
    city: location.name,
    country: location.country,
    temperature: pick(current, ['temperature_2m', 'temperature']),
    feelsLike: pick(current, ['apparent_temperature', 'feels_like']),
    humidity: pick(current, ['relative_humidity_2m', 'humidity']),
    windSpeed: pick(current, ['wind_speed_10m', 'wind_speed']),
    weatherCode: pick(current, ['weather_code', 'weathercode']),
  };
}

export async function fetchWeatherByCity(city) {
  const location = await geoCodeCity(city);
  const data = await fetchCurrentWeather(location);
  const weather = normalize(location, data);

  if (weather.temperature === undefined) {
    throw new WeatherError('weather-invalid-response', 'Formato inesperado en la respuesta del clima.');
  }

  return weather;
}