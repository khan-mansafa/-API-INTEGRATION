// Select elements from index.html
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const statusDiv = document.getElementById("status");

const locationTitle = document.getElementById("locationTitle");
const currentCard = document.getElementById("currentCard");
const noData = document.getElementById("noData");

const tempDiv = document.getElementById("temp");
const condDiv = document.getElementById("cond");
const windDiv = document.getElementById("wind");
const pressureDiv = document.getElementById("pressure");
const timeDiv = document.getElementById("time");

const forecastHour = document.getElementById("forecastHour");
const details = document.getElementById("details");
const hourTable = document.getElementById("hourTable");
const hourBody = document.getElementById("hourBody");

// Base URLs
const geocodeBase = "https://geocoding-api.open-meteo.com/v1/search";
const forecastBase = "https://api.open-meteo.com/v1/forecast";

// Utility: fetch JSON
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error: " + res.status);
  return await res.json();
}

// Load weather for a city
async function loadCityWeather(city) {
  try {
    statusDiv.textContent = "Loading...";
    currentCard.style.display = "none";
    noData.style.display = "block";
    hourTable.style.display = "none";

    // 1. Geocode city → lat/lon
    const geoUrl = `${geocodeBase}?name=${encodeURIComponent(city)}&count=1`;
    const geo = await fetchJSON(geoUrl);

    if (!geo.results || geo.results.length === 0) {
      statusDiv.textContent = "❌ City not found";
      return;
    }

    const loc = geo.results[0];
    locationTitle.textContent = `${loc.name}, ${loc.country}`;

    // 2. Fetch forecast
    const forecastUrl =
      `${forecastBase}?latitude=${loc.latitude}&longitude=${loc.longitude}` +
      `&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,surface_pressure&timezone=auto`;

    const forecast = await fetchJSON(forecastUrl);

    // 3. Display current weather
    const current = forecast.current_weather;
    tempDiv.textContent = `${current.temperature} °C`;
    condDiv.textContent = `Weather code: ${current.weathercode}`;
    windDiv.textContent = current.windspeed;
    pressureDiv.textContent = forecast.hourly.surface_pressure[0];
    timeDiv.textContent = current.time;

    currentCard.style.display = "block";
    noData.style.display = "none";
    statusDiv.textContent = "";

    // 4. Hourly forecast (next 12 hours)
    forecastHour.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const t = forecast.hourly.time[i];
      const temp = forecast.hourly.temperature_2m[i];
      const hum = forecast.hourly.relative_humidity_2m[i];
      const wind = forecast.hourly.windspeed_10m[i];

      const div = document.createElement("div");
      div.className = "forecast-hour";
      div.innerHTML = `<strong>${t.slice(11, 16)}</strong><br>${temp}°C`;
      forecastHour.appendChild(div);
    }

    // 5. Fill 24-hour table
    hourBody.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${forecast.hourly.time[i].slice(11, 16)}</td>
        <td>${forecast.hourly.temperature_2m[i]}</td>
        <td>${forecast.hourly.relative_humidity_2m[i]}</td>
        <td>${forecast.hourly.windspeed_10m[i]}</td>
      `;
      hourBody.appendChild(row);
    }
    hourTable.style.display = "table";

    // 6. Extra details
    details.textContent = `Showing weather data for ${loc.name}, ${loc.country}`;
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "⚠️ Error loading data. See console.";
  }
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) loadCityWeather(city);
});

// Optional: Load default city on startup
loadCityWeather(cityInput.value.trim());
