"use strict";

// ── Columns displayed in the weather table ──────────────────────────────────
const FIELDS = [
    { label: "Hora",              key: "time",                     unit: ""     },
    { label: "Tempo",             key: "weather_code",             unit: ""     },
    { label: "Nuvens (%)",        key: "cloud_cover",              unit: "%"    },
    { label: "Nuvens Baixas (%)", key: "cloud_cover_low",          unit: "%"    },
    { label: "Visib. (m)",        key: "visibility",               unit: "m"    },
    { label: "Temp. Ap. (°C)",    key: "apparent_temperature",     unit: "°C"   },
    { label: "Prob. Prec. (%)",   key: "precipitation_probability",unit: "%"    },
    { label: "Precip. (mm)",      key: "precipitation",            unit: "mm"   },
    { label: "Pancadas (mm)",     key: "showers",                  unit: "mm"   },
    { label: "Vento 80m (km/h)",  key: "wind_speed_80m",           unit: "km/h" },
    { label: "Dir. Vento 80m (°)",key: "wind_direction_80m",       unit: "°"    }
];

// ── Open-Meteo API ──────────────────────────────────────────────────────────
const OPENMETEO_BASE = "https://api.open-meteo.com/v1/forecast";
const OPENMETEO_PARAMS =
    "hourly=visibility,apparent_temperature,precipitation_probability," +
    "precipitation,showers,weather_code,cloud_cover,cloud_cover_low," +
    "wind_speed_80m,wind_direction_80m" +
    "&models=gfs_seamless&timezone=auto&forecast_hours=24&past_hours=24";

// ── Local airport database (ICAO -> coordinates/name) ──────────────────────
// Add more airports here as needed. Keeping this local avoids CORS issues
// when the app is opened directly from disk or a simple local server.
const AIRPORTS = {
    SBGR: { name: "São Paulo/Guarulhos – Governador André Franco Montoro", lat: -23.4356, lon: -46.4731 },
    SBSP: { name: "São Paulo/Congonhas – Deputado Freitas Nobre", lat: -23.6261, lon: -46.6564 },
    SBBE: { name: "Belém/Val-de-Cans – Júlio Cezar Ribeiro", lat: -1.3792, lon: -48.4763 },
    SBRJ: { name: "Rio de Janeiro/Santos Dumont", lat: -22.9104, lon: -43.1631 },
    SBCF: { name: "Belo Horizonte/Confins – Tancredo Neves", lat: -19.6337, lon: -43.9688 },
    SBGL: { name: "Rio de Janeiro/Galeão – Tom Jobim", lat: -22.8090, lon: -43.2506 },
    SBKP: { name: "Campinas/Viracopos", lat: -23.0074, lon: -47.1345 },
    SBRF: { name: "Recife/Guararapes – Gilberto Freyre", lat: -8.1265, lon: -34.9236 },
    SBSV: { name: "Salvador/Deputado Luís Eduardo Magalhães", lat: -12.9086, lon: -38.3225 },
    SBPA: { name: "Porto Alegre/Salgado Filho", lat: -29.9944, lon: -51.1714 },
    SBFZ: { name: "Fortaleza/Pinto Martins", lat: -3.7763, lon: -38.5326 },
    SBRB: { name: "Rio Branco/Plácido de Castro", lat: -9.8689, lon: -67.8981 },
    SBEG: { name: "Manaus/Eduardo Gomes", lat: -3.0386, lon: -60.0497 },
    SBCT: { name: "Curitiba/Afonso Pena", lat: -25.5285, lon: -49.1758 },
    EDDF: { name: "Frankfurt Airport", lat: 50.0379, lon: 8.5622 },
    EGLL: { name: "London Heathrow Airport", lat: 51.4700, lon: -0.4543 },
    LFPG: { name: "Paris Charles de Gaulle Airport", lat: 49.0097, lon: 2.5479 },
    LEMD: { name: "Adolfo Suárez Madrid–Barajas Airport", lat: 40.4719, lon: -3.5626 },
    KJFK: { name: "John F. Kennedy International Airport", lat: 40.6413, lon: -73.7781 },
    KMIA: { name: "Miami International Airport", lat: 25.7959, lon: -80.2870 }
};

// ── WMO weather code descriptions (Portuguese) ─────────────────────────────
const WEATHER_CODE_PT = {
    "0":  "Tempo bom",
    "1":  "Nuvens dissipando",
    "2":  "Tempo bom",
    "3":  "Nuvens se formando",
    "4":  "Visibilidade reduzida por fumaça",
    "5":  "Neblina seca (haze)",
    "6":  "Poeira suspensa em grande escala",
    "7":  "Poeira/areia levantada pelo vento",
    "8":  "Turbilhão de poeira/areia",
    "9":  "Tempestade de poeira ou areia",
    "10": "Névoa",
    "11": "Nevoeiro em pedaços",
    "12": "Nevoeiro contínuo",
    "13": "Relâmpago visível, sem trovão",
    "14": "Precipitação à vista, não atingindo o solo",
    "15": "Precipitação à vista, distante (>5 km)",
    "16": "Precipitação à vista, próxima, fora da estação",
    "17": "Trovoada sem precipitação",
    "18": "Rajadas (squalls)",
    "19": "CB (Cumulonimbus)",
    "20": "Chuvisco ou grãos de neve",
    "21": "Chuva (não congelante)",
    "22": "Neve",
    "23": "Chuva e neve ou granizo",
    "24": "Chuvisco ou chuva congelante",
    "25": "Pancadas de chuva",
    "26": "Pancadas de neve ou chuva/neve",
    "27": "Pancadas de granizo",
    "28": "Nevoeiro ou nevoeiro de gelo",
    "29": "Trovoada (com ou sem precipitação)",
    "30": "Tempestade de poeira/areia leve ou moderada",
    "31": "Tempestade de poeira/areia leve ou moderada",
    "32": "Tempestade de poeira/areia leve ou moderada",
    "33": "Tempestade de poeira/areia severa",
    "34": "Tempestade de poeira/areia severa",
    "35": "Tempestade de poeira/areia severa",
    "36": "Neve soprada leve ou moderada",
    "37": "Neve soprada forte",
    "38": "Neve soprada leve ou moderada",
    "39": "Neve soprada forte",
    "40": "Nevoeiro à distância",
    "41": "Nevoeiro parcial",
    "42": "Nevoeiro com céu visível",
    "43": "Nevoeiro com céu obscurecido",
    "44": "Nevoeiro com céu visível",
    "45": "Nevoeiro com céu obscurecido",
    "46": "Nevoeiro se intensificando (céu visível)",
    "47": "Nevoeiro se intensificando (céu obscurecido)",
    "48": "Nevoeiro de gelo com céu visível",
    "49": "Nevoeiro de gelo com céu obscurecido",
    "50": "Chuvisco intermitente",
    "51": "Chuvisco contínuo",
    "52": "Chuvisco intermitente",
    "53": "Chuvisco contínuo",
    "54": "Chuvisco intermitente",
    "55": "Chuvisco contínuo",
    "56": "Chuvisco congelante fraco",
    "57": "Chuvisco congelante moderado ou forte",
    "58": "Chuvisco e chuva fracos",
    "59": "Chuvisco e chuva moderados ou fortes",
    "60": "Chuva intermitente",
    "61": "Chuva contínua",
    "62": "Chuva intermitente",
    "63": "Chuva contínua",
    "64": "Chuva intermitente",
    "65": "Chuva contínua",
    "66": "Chuva congelante fraca",
    "67": "Chuva congelante moderada ou forte",
    "68": "Chuva/chuvisco e neve fracos",
    "69": "Chuva/chuvisco e neve moderados ou fortes",
    "70": "Neve intermitente (flocos)",
    "71": "Neve contínua (flocos)",
    "72": "Neve intermitente (flocos)",
    "73": "Neve contínua (flocos)",
    "74": "Neve intermitente (flocos)",
    "75": "Neve contínua (flocos)",
    "76": "Pó de diamante",
    "77": "Grãos de neve",
    "78": "Cristais de neve",
    "79": "Granizo",
    "80": "Pancadas de chuva fracas",
    "81": "Pancadas de chuva moderadas ou fortes",
    "82": "Pancadas de chuva violentas",
    "83": "Pancadas de chuva e neve fracas",
    "84": "Pancadas de chuva e neve moderadas ou fortes",
    "85": "Pancadas de neve fracas",
    "86": "Pancadas de neve moderadas ou fortes",
    "87": "Pancadas de grãos de neve ou granizo pequeno",
    "88": "Pancadas de grãos de neve ou granizo pequeno",
    "89": "Pancadas de granizo sem trovoada",
    "90": "Pancadas de granizo sem trovoada",
    "91": "Chuva fraca com trovoada recente",
    "92": "Chuva moderada/forte com trovoada recente",
    "93": "Neve/granizo fraco com trovoada recente",
    "94": "Neve/granizo moderado/forte com trovoada recente",
    "95": "Trovoada fraca/moderada com chuva ou neve",
    "96": "Trovoada fraca/moderada com granizo",
    "97": "Trovoada forte com chuva ou neve",
    "98": "Trovoada com tempestade de poeira/areia",
    "99": "Trovoada forte com granizo"
};

// ── Initialise UI ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const btn   = document.getElementById("search-btn");
    const input = document.getElementById("airport-input");

    btn.addEventListener("click", () => startSearch(input, btn));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startSearch(input, btn);
    });
});

function startSearch(input, btn) {
    const raw = input.value.trim();
    if (!raw) return;

    // Accept codes separated by commas, spaces, or both
    const codes = raw
        .split(/[,\s]+/)
        .map(c => c.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
        .filter(c => c.length >= 3 && c.length <= 5);

    if (codes.length === 0) return;
    btn.disabled = true;
    loadAirports(codes).finally(() => { btn.disabled = false; });
}

// ── Load all airports (create placeholder cards, then fill in parallel) ─────
async function loadAirports(codes) {
    const container = document.getElementById("tables-container");
    container.innerHTML = "";

    // Pre-create placeholder cards so order is preserved
    const placeholders = codes.map(code => {
        const div = document.createElement("div");
        div.className = "table-section";
        div.innerHTML =
            `<h2>${code}</h2>` +
            `<div class="loading">⏳ Carregando…</div>`;
        container.appendChild(div);
        return div;
    });

    await Promise.allSettled(
        codes.map(async (code, i) => {
            try {
                const section = await fetchAirportAndTable(code);
                placeholders[i].replaceWith(section);
            } catch (err) {
                placeholders[i].innerHTML =
                    `<h2>${code}</h2>` +
                    `<div class="error-msg">❌ ${err.message}</div>`;
            }
        })
    );
}

// ── Resolve local airport info + weather, then build table ──────────────────
async function fetchAirportAndTable(icao) {
    const airport = AIRPORTS[icao];

    if (!airport) {
        throw new Error(
            `Aeroporto "${icao}" não encontrado no banco local. ` +
            `Adicione o ICAO no objeto AIRPORTS em script.js.`
        );
    }

    const { lat, lon, name } = airport;

    if (lat == null || lon == null) {
        throw new Error(`Coordenadas não disponíveis para ${icao}.`);
    }

    // Fetch weather from Open-Meteo
    const weatherUrl = `${OPENMETEO_BASE}?latitude=${lat}&longitude=${lon}&${OPENMETEO_PARAMS}`;
    let weatherData;
    try {
        const resp = await fetch(weatherUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        weatherData = await resp.json();
    } catch (e) {
        throw new Error(`Falha ao buscar dados meteorológicos para ${icao}: ${e.message}`);
    }

    return makeTableSection(weatherData, icao, name);
}

// ── Build one airport table section ────────────────────────────────────────
function makeTableSection(data, icao, airportName) {
    const section = document.createElement("div");
    section.className = "table-section";
    section.innerHTML =
        `<h2>${icao}</h2>` +
        `<p class="airport-name">${airportName}</p>`;

    const table = document.createElement("table");

    // Header row
    const thead = document.createElement("thead");
    thead.innerHTML =
        `<tr>${FIELDS.map(f => `<th>${f.label}</th>`).join("")}</tr>`;
    table.appendChild(thead);

    // Body rows
    const tbody  = document.createElement("tbody");
    const times  = data.hourly.time;
    const utcOff = typeof data.utc_offset_seconds === "number"
        ? data.utc_offset_seconds
        : 0;
    const nowStr = getNowLocalString(utcOff);

    // Find the first future time slot
    let firstIdx = times.findIndex(t => t.replace("T", " ") >= nowStr);
    if (firstIdx === -1) firstIdx = times.length;

    // Display from 5 slots ahead (matching WX2 behaviour)
    const startIdx = firstIdx + 5;
    if (startIdx >= times.length) {
        table.appendChild(tbody);
        section.appendChild(table);
        const msg = document.createElement("p");
        msg.className = "error-msg";
        msg.textContent = "Sem dados de previsão disponíveis para o período atual.";
        section.appendChild(msg);
        return section;
    }

    for (let i = startIdx; i < times.length; i++) {
        const row = document.createElement("tr");
        FIELDS.forEach(f => {
            const td = document.createElement("td");
            let value;

            if (f.key === "time") {
                value = times[i].replace("T", " ");
                td.textContent = value;
            } else if (f.key === "weather_code") {
                const code = data.hourly.weather_code[i];
                value = WEATHER_CODE_PT[String(code)] ?? code;
                td.textContent = value;
                // Color: yellow for code 3, red for anything else unusual
                if (code === 3) {
                    td.className = "bg-yellow";
                } else if (code !== 0 && code !== 1 && code !== 2) {
                    td.className = "bg-red";
                }
            } else {
                const raw = Array.isArray(data.hourly[f.key])
                    ? data.hourly[f.key][i]
                    : null;
                value = raw ?? "-";
                td.textContent = value !== "-"
                    ? value + (f.unit ? ` ${f.unit}` : "")
                    : "-";

                // Color-coding rules
                if (isNumeric(raw)) {
                    if (f.key === "showers" && raw > 0) {
                        td.className = "bg-redlight";
                    } else if (f.key === "precipitation") {
                        if (raw > 1 && raw < 10) td.className = "bg-yellow";
                        else if (raw >= 10)       td.className = "bg-redlight";
                    } else if (f.key === "cloud_cover_low") {
                        if (raw > 49 && raw < 80) td.className = "bg-yellow";
                        else if (raw >= 80)        td.className = "bg-redlight";
                    } else if (f.key === "wind_speed_80m") {
                        if (raw > 19 && raw < 30) td.className = "bg-yellow";
                        else if (raw >= 30)        td.className = "bg-redlight";
                    } else if (f.key === "visibility") {
                        // MVFR: <5000 m, IFR: <1500 m (aviation minimums)
                        if (raw < 5000 && raw >= 1500) td.className = "bg-yellow";
                        else if (raw < 1500)            td.className = "bg-redlight";
                    }
                }
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    section.appendChild(table);
    return section;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the current local time at a location given its UTC offset (seconds),
 * formatted as "YYYY-MM-DD HH:MM" — matching the Open-Meteo time strings.
 */
function getNowLocalString(utcOffsetSeconds) {
    const localMs  = Date.now() + utcOffsetSeconds * 1000;
    const local    = new Date(localMs);
    const yyyy     = local.getUTCFullYear();
    const mm       = String(local.getUTCMonth() + 1).padStart(2, "0");
    const dd       = String(local.getUTCDate()).padStart(2, "0");
    const hh       = String(local.getUTCHours()).padStart(2, "0");
    const min      = String(local.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function isNumeric(n) {
    return n !== null && n !== undefined && !isNaN(parseFloat(n)) && isFinite(n);
}
