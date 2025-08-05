// resources.js

// Importieren der erforderlichen Module
import express from 'express';
import {readFileSync}from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const router = express.Router();

// Variablen für den Dateipfad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data_file = path.join(__dirname, '../data', 'resources.json');


// Route zum Abrufen aller Ressourcen
router.get('/', (req, res) => {
  try {
      const data = readFileSync(data_file, 'utf8');
      const resources = JSON.parse(data);
      res.json(resources);
      // Erfolgreiche Antwort mit den Ressourcen
    } catch (error) {
      res.status(500).json({ error: 'Failed to read resources' });
  }
});


// Route zum Abrufen einer Ressource nach ID
router.get('/:id', (req, res) => {
  try {
    const data = readFileSync(data_file, 'utf8');
    const resources = JSON.parse(data);
    const resourceId = req.params.id;
    const resource = resources.find(r => String(r.id) === resourceId);

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

// Exportieren des Routers
// Damit kann dieser Router in der server.js-Datei importiert und verwendet werden
export default router;
