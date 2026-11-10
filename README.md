# SOCproject
Semester 3 SOC project

Vereisten: Node.js met npm en de .NET 10 SDK.

Installeer vanuit de hoofdmap de dependencies:

```sh
npm ci
npm --prefix frontend ci
```

Start vanuit de hoofdmap:

- `npm run dev`: frontend en backend samen.
- `npm run frontend`: alleen de frontend.
- `npm run backend`: alleen de backend.

De frontend draait standaard op http://localhost:3000 en de backend op http://localhost:3001.
De backend heeft een statusendpoint op http://localhost:3001/health.
`npm run backend` gebruikt het Development-profiel. Swagger UI is dan beschikbaar op
http://localhost:3001/swagger en de OpenAPI-beschrijving op http://localhost:3001/swagger/v1/swagger.json.
Swagger is alleen ingeschakeld in Development.
De frontend laadt wijzigingen automatisch. Herstart de backend na wijzigingen aan de C#-code.
Met Ctrl+C stop je de gestarte servers.

Vanuit de map `frontend` kun je ook rechtstreeks `npm ci` en `npm run dev` uitvoeren.
