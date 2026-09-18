import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { WeatherError, fetchWeatherByCity, geoCodeCity, normalize } from '../js/weather.js';

// ==========================================================
// AYUDANTES: utilidades para escribir tests cortos y claros
// ==========================================================

// Crea una respuesta falsa de `fetch` con el formato mínimo que usa la app.
function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => ({ ...body }) };
}

// Simula `fetch`: para cada URL real, devuelve la respuesta del "marcador"
// que coincida con esa URL. Si no coincide ninguna, responde 404.
function mockFetchApi(respuestasPorMarcador) {
  global.fetch = async (url) => {
    const href = url.toString();
    for (const [marcador, respuesta] of Object.entries(respuestasPorMarcador)) {
      if (href.includes(marcador)) return respuesta;
    }
    return jsonResponse({}, false, 404);
  };
}

// Comprueba que `fn` rechace con un WeatherError del código esperado.
async function esperaError(fn, codigoEsperado) {
  await assert.rejects(fn, (error) => {
    assert.ok(error instanceof WeatherError, 'debería ser un WeatherError');
    assert.equal(error.code, codigoEsperado, 'código del error');
    return true;
  });
}

const fetchOriginal = global.fetch;
afterEach(() => {
  global.fetch = fetchOriginal;
});

// ==========================================================
// FIXTURES: datos falsos (pero realistas) de la API
// ==========================================================

const respuestaGeocoderMadrid = {
  results: [
    {
      name: 'Madrid',
      country_code: 'ES',
      latitude: 40.4167,
      longitude: -3.7039,
      timezone: 'Europe/Madrid',
    },
  ],
};

const respuestaClimaMadrid = {
  current: {
    temperature_2m: 27.3,
    apparent_temperature: 26.2,
    relative_humidity_2m: 29,
    weather_code: 0,
    wind_speed_10m: 3.3,
  },
};

const ubicacionMadrid = {
  name: 'Madrid',
  country: 'ES',
  latitude: 40.4167,
  longitude: -3.7039,
  timezone: 'Europe/Madrid',
};

// ==========================================================
// UNIDAD: normalize() — convierte la respuesta cruda de la API
// ==========================================================

describe('unidad — normalize()', () => {
  it('caso válido: mapea la respuesta de la API al formato interno', () => {
    const resultado = normalize(ubicacionMadrid, respuestaClimaMadrid);

    assert.deepEqual(resultado, {
      city: 'Madrid',
      country: 'ES',
      temperature: 27.3,
      feelsLike: 26.2,
      humidity: 29,
      windSpeed: 3.3,
      weatherCode: 0,
    });
  });

  it('caso límite: weatherCode 0 es válido (no se confunde con "sin dato")', () => {
    const resultado = normalize(ubicacionMadrid, {
      current: { temperature_2m: 10, weather_code: 0 },
    });

    assert.equal(resultado.weatherCode, 0);
  });

  it('caso inválido: los campos que faltan quedan como undefined (no causan crash)', () => {
    const resultado = normalize(ubicacionMadrid, { current: {} });

    assert.equal(resultado.temperature, undefined);
    assert.equal(resultado.humidity, undefined);
  });
});

// ==========================================================
// UNIDAD: geoCodeCity() — convierte un nombre de ciudad en coordenadas
// ==========================================================

describe('unidad — geoCodeCity()', () => {
  it('caso válido: devuelve los datos del primer resultado del geocoder', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse(respuestaGeocoderMadrid),
    });

    const resultado = await geoCodeCity('Madrid');

    assert.deepEqual(resultado, ubicacionMadrid);
  });

  it('caso inválido: no encuentra resultados para la ciudad buscada', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse({ results: [] }),
    });

    await esperaError(() => geoCodeCity('XyzNoExiste123'), 'weather-city-not-found');
  });

  it('caso límite: el geocoder responde con error 500 (servidor caído)', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse({}, false, 500),
    });

    await esperaError(() => geoCodeCity('Madrid'), 'weather-geocoding-error');
  });
});

// ==========================================================
// INTEGRACIÓN: fetchWeatherByCity() — junta geocoder + clima
// ==========================================================

describe('integración — fetchWeatherByCity()', () => {
  it('caso válido: orquesta geocoder + pronóstico y devuelve el clima normalizado', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse(respuestaGeocoderMadrid),
      'api.open-meteo.com': jsonResponse(respuestaClimaMadrid),
    });

    const resultado = await fetchWeatherByCity('Madrid');

    assert.deepEqual(resultado, {
      city: 'Madrid',
      country: 'ES',
      temperature: 27.3,
      feelsLike: 26.2,
      humidity: 29,
      windSpeed: 3.3,
      weatherCode: 0,
    });
  });

  it('caso inválido: la ciudad no existe', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse({ results: [] }),
    });

    await esperaError(() => fetchWeatherByCity('XyzNoExiste123'), 'weather-city-not-found');
  });

  it('caso límite: el servicio del clima responde con error 500', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse(respuestaGeocoderMadrid),
      'api.open-meteo.com': jsonResponse({}, false, 500),
    });

    await esperaError(() => fetchWeatherByCity('Madrid'), 'weather-service-error');
  });

  it('caso límite: la respuesta del clima viene vacía (formato inesperado)', async () => {
    mockFetchApi({
      'geocoding-api.open-meteo.com': jsonResponse(respuestaGeocoderMadrid),
      'api.open-meteo.com': jsonResponse({}),
    });

    await esperaError(() => fetchWeatherByCity('Madrid'), 'weather-invalid-response');
  });
});