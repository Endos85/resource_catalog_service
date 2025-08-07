# resource_catalog_service
Ressource Catalog Microservice for Learning Path Generator App

Ein einfacher RESTful API-Service für einen Ressourcenkatalog, der mit Express.js implementiert wurde.

---

##  Features

- Ressourcen abrufen, erstellen, aktualisieren und löschen (CRUD)
- **GET /resources**: Ruft alle Ressourcen ab. Unterstützt Filterung über Query-Parameter (`type`, `authorId`).
- **GET /resources/:id**: Ruft eine einzelne Ressource anhand ihrer ID ab.
- **POST /resources**: Erstellt eine neue Ressource.
- **PUT /resources/:id**: Aktualisiert eine bestehende Ressource.
- **DELETE /resources/:id**: Löscht eine bestehende Ressource.
- Fehlerbehandlung über zentrale **Middleware**
- Validierung über **Middleware**
- Unterstützung für **CORS** (Zugriff vom Frontend)
- Konfiguration über `.env`-Datei

## Projektstruktur

```
resource_catalog_service/
├── data/
│   └── resources.json           # Lokale JSON-Datenbank
├── middleware/
│   ├── error-handler.js         # Fehlerbehandlung
│   ├── validation.js            # Eingabevalidierung
├── routes/
│   └── resources.js             # Routen für /resources
├── .env                         # Umgebungsvariablen (z. B. Port)
├── server.js                    # Server-Einstiegspunkt
├── package.json
└── README.md
```

---

## Installation & Setup


1.  Klone dieses Repository (sobald es in einem Repository ist).
2.  Navigiere in das Projektverzeichnis.
3.  Installiere die Abhängigkeiten:
```bash
npm install
```
4.  Erstelle eine `.env`-Datei im Stammverzeichnis und füge den Port hinzu:
```env
PORT=5002
```

Dann starte den Server:

```bash
npm start
```

---

## 🛠 API-Endpunkte

### Ressourcen abrufen

- **Alle Ressourcen**:  
  `GET /resources`

- **Eine Ressource nach ID**:  
  `GET /resources/:id`

- **Nach Attributen suchen (z. B. `type`, `authorId`)**:  
  `GET /resources/search?type=Video&authorId=123`

---

### Ressource erstellen

`POST /resources`

```json
{
  "title": "Neuer Artikel",
  "type": "Article",
  "authorId": "user123",
  "url": "https://example.com"
}
```

---

### Ressource aktualisieren

`PUT /resources/:id`

```json
{
  "title": "Titel aktualisiert"
}
```

---

### Ressource löschen

`DELETE /resources/:id`

---

## Abhängigkeiten

- `express` – Webserver
- `uuid` – Für eindeutige IDs
- `dotenv` – Umgebungsvariablen
- `cors` – Cross-Origin Resource Sharing

---

## ⚠️ Hinweise

- Alle Daten werden lokal in `data/resources.json` gespeichert.
- Dieses Projekt ist nicht für produktive Umgebungen gedacht.