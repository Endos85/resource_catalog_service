// server.js

// Importieren der erforderlichen Module
// Importieren von Express für die Erstellung des Servers
import express from 'express';
// Importieren des Ressourcen-Routers
// Dieser Router enthält die Routen für den Zugriff auf Ressourcen
import resourcesRouter from './routes/resources.js';

// Festlegen des Ports für den Server
const port = 5002;
// Initialisierung des Express-Servers
const app = express();

// Middleware zum Parsen von JSON-Daten
app.use(express.json());
// Verwenden des Ressourcen-Routers für Anfragen an den Pfad "/resources"
app.use("/resources", resourcesRouter);

// Starten des Servers
app.listen(port, () => {
  // Ausgabe einer Nachricht in der Konsole, wenn der Server erfolgreich gestartet wurde
  console.log(`Server is running at http://localhost:${port}`);
});