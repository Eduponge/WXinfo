# WXinfo — Consulta Meteorológica para Aeroportos

Aplicação HTML local para consulta de previsão meteorológica por código ICAO de aeroporto, usando a API gratuita do [Open-Meteo](https://open-meteo.com/).

## Como usar

1. Abra um terminal na pasta do projeto e inicie um servidor HTTP local (necessário para as chamadas de API funcionarem):

   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js (npx)
   npx serve .
   ```

2. Acesse `http://localhost:8080` no seu navegador.

3. Digite um ou mais códigos ICAO (4 letras, ex.: `SBGR`) ou IATA (3 letras, ex.: `GRU`), separados por vírgula ou espaço, e clique em **Buscar**.

## Funcionalidades

- Busca por qualquer aeroporto mundial via código ICAO (4 letras, ex.: `SBGR`) ou IATA (3 letras, ex.: `GRU`).
- Múltiplos aeroportos consultados simultaneamente.
- Dados meteorológicos fornecidos pelo Open-Meteo (modelo GFS Seamless):
  - Condição do tempo (código WMO, em português)
  - Cobertura de nuvens total e baixas
  - Visibilidade (m)
  - Temperatura aparente (°C)
  - Probabilidade e volume de precipitação
  - Pancadas de chuva
  - Velocidade e direção do vento a 80 m
- Cores indicativas nas células:
  - 🟡 Amarelo — condição de atenção
  - 🔴 Vermelho — condição adversa

## APIs utilizadas

| API | Finalidade |
|-----|-----------|
| [Aviation Weather Center (NOAA/NWS)](https://aviationweather.gov/api/data/airport) | Resolução ICAO → coordenadas geográficas |
| [Open-Meteo](https://api.open-meteo.com/v1/forecast) | Previsão meteorológica horária |

Ambas são gratuitas e não requerem chave de API.