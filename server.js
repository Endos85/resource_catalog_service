import express from 'express';
import {readFileSync}from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const app = express();

const port = 5002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data_file = path.join(__dirname, 'data', 'resources.json');

app.get('/', (req, res) => {
  res.send('Welcome to Resource Catalog');
});

app.get('/resources', (req, res) => {
  try {
      const data = readFileSync(data_file, 'utf8');
      const resources = JSON.parse(data);
      res.json(resources);
  } catch (error) {
      res.status(500).json({ error: 'Failed to read resources' });
  }
});

app.get('/resources/:id', (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Lesen der Ressource' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});