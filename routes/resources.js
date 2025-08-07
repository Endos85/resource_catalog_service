// routes/resources.js

// Importieren der erforderlichen Module
// Importieren von Express für die Erstellung des Routers
import express from 'express';
// Importieren von Funktionen zum Lesen und Schreiben von Dateien
// Diese Funktionen werden verwendet, um die Ressourcen aus einer JSON-Datei zu lesen und zu schreiben
import { readFileSync, writeFileSync } from 'fs';
// Importieren von path für die Handhabung von Dateipfaden
// Dies ist nützlich, um den Pfad zur JSON-Datei plattformunabhängig zu erstellen
import path from 'path';
// Importieren von fileURLToPath, um den Dateipfad aus der URL zu extrahieren
// Dies ist notwendig, da wir ES-Module verwenden und den aktuellen Dateipfad benötigen
import { fileURLToPath } from 'url';
// Importieren der UUID-Bibliothek für die Generierung von eindeutigen IDs
// Diese Bibliothek wird verwendet, um eindeutige Identifikatoren für neue Ressourcen zu erstellen
import { v4 as uuidv4 } from 'uuid';

// Erstellen eines Routers mit Express
const router = express.Router();

// Variablen für den Dateipfad
const __filename = fileURLToPath(import.meta.url); // Aktueller Dateipfad
const __dirname = path.dirname(__filename); // Erstellen des Pfads zur JSON-Datei, die die Ressourcen enthält
const data_file = path.join(__dirname, '../data', 'resources.json'); // Pfad zur JSON-Datei mit den Ressourcen


// Route zum Abrufen aller Ressourcen
// Diese Route wird verwendet, um alle Ressourcen abzurufen
// Sie gibt eine Liste aller verfügbaren Ressourcen zurück
router.get('/', (req, res, next) => {
  try {
    const data = readFileSync(data_file, 'utf8'); // Lesen der JSON-Datei, die die Ressourcen enthält
    const resources = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt
    res.json(resources);    // Senden der Ressourcen als JSON-Antwort zurück an den Client
    // Erfolgreiche Antwort mit den Ressourcen
  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


router.get('/force-error', (req, res, next) => {
  // Manuelles Auslösen eines Fehlers
  const error = new Error('Dies ist ein erzwungener Serverfehler.');
  error.status = 500;
  next(error); // Übergibt den Fehler an die zentrale Fehlerbehandlung
});


// Route zum Abrufen einer Ressource nach ID
// Diese Route wird verwendet, um eine Ressource anhand ihrer ID abzurufen
// Die ID wird aus den URL-Parametern extrahiert
router.get('/:id', (req, res, next) => {
  try {
    const data = readFileSync(data_file, 'utf8'); // Lesen der JSON-Datei, die die Ressourcen enthält
    const resources = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt
    const resourceId = req.params.id; // Extrahieren der Ressourcendaten anhand der ID aus den URL-Parametern
    const resource = resources.find(r => String(r.id) === resourceId); // Suchen der Ressource mit der angegebenen ID in der Liste der Ressourcen

    if (resource) {
      res.json(resource); // Senden der gefundenen Ressource als JSON-Antwort zurück an den Client
    } else {
      res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }
    // Erfolgreiche Antwort mit der gefundenen Ressource oder Fehlermeldung
  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Erstellen einer neuen Ressource
// Diese Route wird verwendet, um eine neue Ressource zu erstellen
// Die Daten für die neue Ressource werden im Request-Body übergeben
router.post('/', (req, res, next) => {
  try {
    // Extrahieren der neuen Ressourcendaten aus dem Request-Body
    const newData = req.body;

    // Überprüfen, ob die erforderlichen Felder "title" und "type" im Request-Body vorhanden sind
    // Wenn nicht, wird eine Fehlermeldung mit dem Status 400 (Bad Request) zurückgegeben
    if (!newData.title || !newData.type) {
      res.status(400).json({ error: 'title und type sind erforderlich.' });
      return;
    }

    // Generieren einer eindeutigen ID für die neue Ressource
    // Erstellen eines neuen Ressourcenobjekts mit der generierten ID und den übergebenen Daten
    // Hier wird die UUID-Bibliothek verwendet, um eine eindeutige ID zu generieren
    const newResource = {
      id: uuidv4(),
      ...newData, // Kopieren der übergebenen Daten , title und type
      //title: newData.title,
      //type: newData.type,
      //description: newData.description || '',
      //url: newData.url || ''
    };

    // Versuchen, die aktuelle Ressourcendatei zu lesen und die neue Ressource hinzuzufügen
    // und die aktualisierte Liste zurück in die Datei zu schreiben
    const data = readFileSync(data_file, 'utf8');
    const resources = JSON.parse(data);
    resources.push(newResource);
    writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');

    // Erfolgreiche Antwort mit der neu erstellten Ressource
    res.status(201).json(newResource);

  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Aktualisieren einer Ressource nach ID
// Diese Route wird verwendet, um eine Ressource anhand ihrer ID zu aktualisieren
// Die ID wird aus den URL-Parametern extrahiert und die neuen Daten aus dem Request-Body
router.put('/:id', (req, res, next) => {
  try {
    const resourceId = req.params.id; // Extrahieren der Ressourcendaten anhand der ID aus den URL-Parametern
    const updatedData = req.body; // Extrahieren der aktualisierten Ressourcendaten aus dem Request-Body
    
    // Überprüfen, ob die aktualisierten Daten im Request-Body vorhanden sind
    // Wenn nicht, wird eine Fehlermeldung mit dem Status 400 (Bad Request) zurückgegeben
    if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({error: "Datei hat keinen Inhalt!"});
    };

    // Lesen der aktuellen Ressourcen aus der Datei
    const data = readFileSync(data_file, 'utf8');
    const resources = JSON.parse(data);

    // Suchen der Ressource mit der angegebenen ID
    const resourceIndex = resources.findIndex(r => String(r.id) === resourceId);

    if (resourceIndex === -1) {
      // Wenn die Ressource nicht gefunden wurde, wird eine Fehlermeldung mit dem Status 404 (Not Found) zurückgegeben
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }
    
    // Aktualisieren der gefundenen Ressource mit den neuen Daten
    resources[resourceIndex] = {
      ...resources[resourceIndex], // Beibehalten der bestehenden Felder
      ...updatedData, // Aktualisieren mit den neuen Daten aus dem Request-Body
    };

    // Optional: Generieren einer neuen ID, wenn die ID aktualisiert werden soll
    // resources[resourceIndex].id = uuidv4(); // Uncomment if you want to change the ID
    
    // Schreiben der aktualisierten Ressourcen zurück in die Datei
    writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');

    // Erfolgreiche Antwort mit der aktualisierten Ressource
    res.status(200).json(resources[resourceIndex]);

  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Löschen einer Ressource nach ID
// Diese Route wird verwendet, um eine Ressource anhand ihrer ID zu löschen
// Die ID wird aus den URL-Parametern extrahiert
router.delete('/:id', (req, res, next) => {
  try {
    const resourceId = req.params.id; // Extrahieren der Ressourcendaten anhand der ID aus den URL-Parametern
    const data = readFileSync(data_file, 'utf8'); // Lesen der JSON-Datei, die die Ressourcen enthält
    const resources = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt
    const resourceIndex = resources.findIndex(r => String(r.id) === resourceId); // Suchen der Ressource mit der angegebenen ID in der Liste der Ressourcen
    
    // Überprüfen, ob die Ressource mit der angegebenen ID gefunden wurde
    // Wenn die Ressource nicht gefunden wurde, wird eine Fehlermeldung mit dem Status 404 (Not Found) zurückgegeben
    if (resourceIndex === -1) return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });

    // Wenn die Ressource gefunden wurde, wird sie aus der Liste entfernt
    resources.splice(resourceIndex, 1); // Entfernen der Ressource aus dem Array
    // Schreiben der aktualisierten Ressourcen zurück in die Datei
    writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');
    // Erfolgreiche Antwort mit einer Bestätigung der Löschung
    res.status(204).send(); // 204 No Content, da keine Daten zurückgegeben werden

  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});



// Exportieren des Routers
// Damit kann dieser Router in der server.js-Datei importiert und verwendet werden
export default router;
