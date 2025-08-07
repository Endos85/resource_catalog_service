// server.js

// Importieren der erforderlichen Module
// Importieren von dotenv für die Handhabung von Umgebungsvariablen
// Diese Bibliothek wird verwendet, um Umgebungsvariablen aus einer .env-Datei zu laden
import dotenv from 'dotenv';
// Konfigurieren von dotenv
dotenv.config();

// Importieren von Express für die Erstellung des Servers
import express from 'express';
// Importieren von CORS für die Handhabung von Cross-Origin Resource Sharing
// Diese Middleware ermöglicht es, Anfragen von anderen Ursprüngen zu akzeptieren
import cors from 'cors';
// Importieren des Ressourcen-Routers
// Dieser Router enthält die Routen für den Zugriff auf Ressourcen
import resourcesRouter from './routes/resources.js';
// Importieren der Fehlerbehandlungs-Middleware
// Diese Middleware fängt Fehler ab, die in den Routen auftreten, und sendet eine einheitliche Fehlermeldung zurück
import {errorHandler} from './middleware/error-handler.js';


// Festlegen des Ports für den Server
const port = process.env.PORT || 5002;

// Initialisierung des Express-Servers
const app = express();

// Middleware zum Aktivieren von CORS
// Diese Middleware ermöglicht es, Anfragen von anderen Ursprüngen zu akzeptieren
// Sie sollte vor allen anderen Middleware-Funktionen und Routen definiert werden
app.use(cors());

// Middleware zum Parsen von JSON-Daten
app.use(express.json());

// Verwenden des Ressourcen-Routers für Anfragen an den Pfad "/resources"
app.use("/resources", resourcesRouter);

// Fehlerbehandlungs-Middleware - immer **nach** allen Routen
app.use(errorHandler);

// Starten des Servers
app.listen(port, () => {
  // Ausgabe einer Nachricht in der Konsole, wenn der Server erfolgreich gestartet wurde
  console.log(`Server is running at http://localhost:${port}`);
});