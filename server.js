import express from 'express';
import {readFileSync}from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

// Initialisierung des Express-Servers
const app = express();
const port = 5002;

// Variablen für den Dateipfad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data_file = path.join(__dirname, 'data', 'resources.json');

// Middleware zum Parsen von JSON-Daten
app.use(express.json());

// Routen für den Server
app.get('/', (req, res) => {
  res.send('Welcome to Resource Catalog');
});

// Route zum Abrufen aller Ressourcen
app.get('/resources', (req, res) => {
  try {
      const data = readFileSync(data_file, 'utf8');
      const resources = JSON.parse(data);
      res.json(resources);
  } catch (error) {
      res.status(500).json({ error: 'Failed to read resources' });
  }
});

// Route zum Abrufen einer Ressource nach ID
app.get('/resources/:id', (req, res) => {
  try {
    const data = readFileSync(data_file, 'utf8');
    const resources = JSON.parse(data);
    
    const resourceId = req.params.id;
    
    const resource = resources.find(r => String(r.id) === resourceId);
    // Überprüfen, ob die Ressource gefunden wurde
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }
  // Fehlerbehandlung für das Lesen der Datei
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Lesen der Ressource' });
  }
});

// Starten des Servers
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});