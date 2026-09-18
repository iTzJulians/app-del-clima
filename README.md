# 🌤️ App del Clima

Aplicación web para consultar el clima de cualquier ciudad, construida **100% con JavaScript vanilla** (HTML + CSS + ES Modules, sin frameworks ni dependencias de runtime). Los datos salen de la API pública de **Open-Meteo** (sin API key, con CORS habilitado — se consume directo desde el navegador).

## ✨ Funcionalidades

- Buscar el clima por nombre de ciudad.
- Temperatura actual en °C, sensación térmica, humedad y velocidad del viento.
- Descripción del tiempo en español (códigos WMO).
- Manejo de errores: ciudad no encontrada, servicios caídos, respuestas inesperadas.

## 🧱 Stack

| Capa       | Tecnología                                      |
|------------|-------------------------------------------------|
| Frontend   | HTML + CSS + JavaScript vanilla (ES Modules)    |
| API clima  | [Open-Meteo](https://open-meteo.com) (geocoding + forecast) |
| Tests      | [`node:test`](https://nodejs.org/api/test.html) + `node:assert/strict` (sin dependencias) |
| Servidor   | [`serve`](https://www.npmjs.com/package/serve) (estático, solo para desarrollo) |

## 📁 Estructura

```
proyecto con ia/
├── index.html          # página principal (+ <link> al CSS, <script type="module">)
├── css/
│   └── global.css      # estilos
├── js/
│   ├── app.js          # lógica de UI + búsqueda
│   ├── weather.js      # geocoding + pronóstico + normalización (fetch del navegador)
│   ├── wmo.js          # códigos WMO → descripción en español
│   └── format.js       # helpers de formato (°C, capitalize)
├── test/
│   ├── weather.test.js # unidad (normalize, geoCodeCity) + integración (fetch mockeado)
│   ├── wmo.test.js
│   └── format.test.js
└── package.json
```

## 🚀 Cómo ejecutar

Requisitos: [Node.js](https://nodejs.org) ≥ 22.

```bash
npm start
# npx serve inicia un servidor estático en http://localhost:3000
```

> Nota: la app usa ES Modules, así que debe servirse por HTTP (no abrir el `index.html` con `file://`). Cualquier servidor estático sirve: `npx serve`, `python3 -m http.server 3000`, VSCode Live Server, etc.

## 🧪 Cómo ejecutar los tests

```bash
npm test
# node --test test/
```

Usa el runner nativo de Node (`node:test`) con `node:assert/strict` — **cero dependencias**. Los tests se organizan como **unidad** (funciones aisladas) e **integración** (flujo completo con `fetch` simulado).

## 📡 Cómo funciona el flujo

1. El usuario escribe una ciudad y envía el formulario.
2. `app.js` llama a `fetchWeatherByCity(ciudad)`.
3. `weather.js` geocodifica la ciudad (nombre → coordenadas) con Open-Meteo Geocoding.
4. Consulta el pronóstico actual en Open-Meteo y normaliza la respuesta.
5. Devuelve al componente de UI un objeto simple: `{ city, country, temperature, feelsLike, humidity, windSpeed, weatherCode }`.

## 🛠️ Agregar más datos (pronóstico horario, etc.)

Cada paso está aislado en `js/weather.js`. Para pedir más variables, solo se agregan al parámetro `current` de la URL del forecast y al mapa en `normalize()`.

## 📄 Licencia

MIT