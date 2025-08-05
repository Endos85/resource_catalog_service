// resources.js

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
router.get('/', (req, res) => {
  try {
    const data = readFileSync(data_file, 'utf8'); // Lesen der JSON-Datei, die die Ressourcen enthält
    const resources = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt
    res.json(resources);    // Senden der Ressourcen als JSON-Antwort zurück an den Client
    // Erfolgreiche Antwort mit den Ressourcen
  } catch (error) {
    res.status(500).json({ error: 'Failed to read resources' });
  }
});

// Route zum Abrufen einer Ressource nach ID
router.get('/:id', (req, res) => {
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
    // Fehlerbehandlung für das Lesen der Datei
    res.status(500).json({ error: 'Fehler beim Lesen der Ressource.' });
  }
});

// Route zum Erstellen einer neuen Ressource
router.post('/', (req, res) => {
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
    // Fehlerbehandlung für das Schreiben der Datei oder andere unerwartete Fehler
    res.status(500).json({ error: 'Fehler beim Erstellen der Ressource.' });
  }
});

// Exportieren des Routers
// Damit kann dieser Router in der server.js-Datei importiert und verwendet werden
export default router;
