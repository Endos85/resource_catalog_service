// routes/resources.js

// Importieren der erforderlichen Module
// Importieren von Express für die Erstellung des Routers
import express from 'express';
// Importieren von Funktionen zum Lesen und Schreiben von Dateien
// Diese Funktionen werden verwendet, um die Ressourcen aus einer JSON-Datei zu lesen und zu schreiben
import fs, { readFileSync, writeFileSync } from 'fs';
// Importieren von path für die Handhabung von Dateipfaden
// Dies ist nützlich, um den Pfad zur JSON-Datei plattformunabhängig zu erstellen
import path from 'path';
// Importieren von fileURLToPath, um den Dateipfad aus der URL zu extrahieren
// Dies ist notwendig, da wir ES-Module verwenden und den aktuellen Dateipfad benötigen
import { fileURLToPath } from 'url';
// Importieren der UUID-Bibliothek für die Generierung von eindeutigen IDs
// Diese Bibliothek wird verwendet, um eindeutige Identifikatoren für neue Ressourcen zu erstellen
import { v4 as uuidv4 } from 'uuid';
// Importieren der Middleware zum Validieren von Ressourcen
// Diese Middleware wird verwendet, um sicherzustellen, dass die erforderlichen Felder in der Anfrage vorhanden sind
import validateResource from '../middleware/validateResource.js';
// Importieren der Middleware zum Validieren von Feedback
// Diese Middleware wird verwendet, um sicherzustellen, dass das Feedback korrekt formatiert ist
import validateFeedback from '../middleware/validate-feedback.js';
// Importieren der Ressourcen-Datei, die die Ressourcen enthält
import { join } from 'path';

// Erstellen eines Routers mit Express
const router = express.Router();

// Variablen für den Dateipfad
const __filename = fileURLToPath(import.meta.url); // Aktueller Dateipfad
const __dirname = path.dirname(__filename); // Erstellen des Pfads zur JSON-Datei, die die Ressourcen enthält
const data_file = path.join(__dirname, '../data', 'resources.json'); // Pfad zur JSON-Datei mit den Ressourcen

// Variablen für die Feedback-Datei
const feedbackFile = path.join(__dirname, '../data', 'feedback.json');
const resourcesFile = path.join(__dirname, '../data', 'resources.json');



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
router.post('/', validateResource, (req, res, next) => {
  try {
    // Extrahieren der neuen Ressourcendaten aus dem Request-Body
    const newData = req.body;

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


// Route zum Suchen von Ressourcen nach type oder authorId
router.get('/search', (req, res, next) => {
  try {
    const { type, authorId } = req.query; // Extrahieren der Suchparameter aus der Query-String
    const data = readFileSync(data_file, 'utf8'); // Lesen der JSON-Datei, die die Ressourcen enthält
    const resources = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt

    // Filtern der Ressourcen basierend auf den Suchparametern
    // Wenn type oder authorId angegeben sind, werden die Ressourcen entsprechend gefiltert
    // Wenn keine Parameter angegeben sind, werden alle Ressourcen zurückgegeben
    const filteredResources = resources.filter(r => {
      return (type ? r.type === type : true) && (authorId ? r.authorId === authorId : true);
    });
    res.status(200).json(filteredResources); // Senden der gefilterten Ressourcen als JSON-Antwort zurück an den Client
  } catch (error) {
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Speichern von Feedback für eine Ressource
// Diese Route wird verwendet, um Feedback für eine bestimmte Ressource zu speichern
// Die Ressource-ID wird aus den URL-Parametern extrahiert und die Feedback-Daten aus dem Request-Body
router.post('/:resourceId/feedback', validateFeedback, (req, res, next) => {
  const { resourceId } = req.params; // Extrahieren der Ressource-ID aus den URL-Parametern
  const { feedback_text, user_name } = req.body; // Extrahieren des Feedback-Textes und des Benutzernamens aus dem Request-Body

  
  try {
    const resources = JSON.parse(readFileSync(resourcesFile, 'utf8')); // Lesen der Ressourcen aus der Datei
    const resourceExists = resources.some(r => String(r.id) === resourceId); // Überprüfen, ob die Ressource mit der angegebenen ID existiert
    // Wenn die Ressource nicht existiert, wird eine Fehlermeldung mit dem Status 404 (Not Found) zurückgegeben
    if (!resourceExists) {
      return res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.` });
    }
    // Wenn die Ressource existiert, wird das Feedback gespeichert
    // Erstellen eines neuen Feedback-Objekts mit der Ressource-ID, dem Text, dem Benutzernamen und einem Zeitstempel
    // Der Benutzername wird auf 'anonym' gesetzt, wenn er nicht angegeben ist
    const newFeedback = {
      feedbackId: uuidv4(), // Generieren einer eindeutigen ID für das Feedback
      resourceId, // Verknüpfen des Feedbacks mit der Ressource-ID
      feedback_text, // Der Feedback-Text wird aus dem Request-Body übernommen
      user_name: user_name?.trim() || 'anonym', // Der Benutzername wird auf 'anonym' gesetzt, wenn er nicht angegeben ist
      timestamp: new Date().toISOString() // Aktueller Zeitstempel im ISO-Format
    };

    const feedbacks = JSON.parse(readFileSync(feedbackFile, 'utf8')); // Lesen der bestehenden Feedbacks aus der Datei
    feedbacks.push(newFeedback); // Hinzufügen des neuen Feedbacks zur Liste der bestehenden Feedbacks
    // Schreiben der aktualisierten Feedbacks zurück in die Datei
    // Die Feedbacks werden als JSON-String formatiert und in der Datei gespeichert
    writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2), 'utf8');

    // Erfolgreiche Antwort mit dem neuen Feedback
    // Der Status 201 (Created) wird zurückgegeben, um anzuzeigen, dass das Feedback erfolgreich erstellt wurde
    // Die Antwort enthält das neu erstellte Feedback-Objekt
    res.status(201).json({ message: 'Feedback gespeichert.', feedback: newFeedback });

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Feedbacks:', error); // Protokollieren des Fehlers im Server-Log
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Aktualisieren von Feedback für eine Ressource
// Diese Route wird verwendet, um Feedback für eine bestimmte Ressource zu aktualisieren
// Die Ressource-ID und die Feedback-ID werden aus den URL-Parametern extrahiert und die neuen Daten aus dem Request-Body
router.put('/:resourceId/feedback/:feedbackId', validateFeedback, (req, res, next) => {
  const { resourceId, feedbackId } = req.params; // Extrahieren der Ressource-ID und der Feedback-ID aus den URL-Parametern
  const { feedback_text, user_name } = req.body; // Extrahieren des Feedback-Textes und des Benutzernamens aus dem Request-Body

  try {
    const data = readFileSync(feedbackFile, 'utf8'); // Lesen der Feedback-Datei, die das Feedback enthält
    const feedback = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt

    // Überprüfen, ob die Ressource mit der angegebenen ID existiert
    const feedbackIndex = feedback.findIndex(
      f => f.resourceId === resourceId && f.feedbackId === feedbackId
    );

    // Wenn das Feedback nicht gefunden wurde, wird eine Fehlermeldung mit dem Status 404 (Not Found) zurückgegeben
    // Dies bedeutet, dass entweder die Ressource oder das Feedback nicht existiert
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback nicht gefunden.' });
    }

    // Feedback aktualisieren
    feedback[feedbackIndex] = { // Aktualisieren des Feedbacks mit den neuen Daten
      ...feedback[feedbackIndex], // Beibehalten der bestehenden Felder
      feedback_text, // Aktualisieren des Feedback-Textes
      user_name: user_name?.trim() || feedback[feedbackIndex].user_name, // Benutzername aktualisieren, falls angegeben
      updatedAt: new Date().toISOString() // Aktueller Zeitstempel im ISO-Format
    };

    writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2), 'utf8'); // Schreiben der aktualisierten Feedbacks zurück in die Datei

    // Erfolgreiche Antwort mit dem aktualisierten Feedback
    // Der Status 200 (OK) wird zurückgegeben, um anzuzeigen, dass das Feedback erfolgreich aktualisiert wurde
    // Die Antwort enthält das aktualisierte Feedback-Objekt
    res.status(200).json(feedback[feedbackIndex]);

  } catch (error) {
      console.error('Fehler beim Aktualisieren des Feedbacks:', error); // Protokollieren des Fehlers im Server-Log
      next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Route zum Löschen von Feedback für eine Ressource
// Diese Route wird verwendet, um Feedback für eine bestimmte Ressource zu löschen
// Die Ressource-ID und die Feedback-ID werden aus den URL-Parametern extrahiert
router.delete('/:resourceId/feedback/:feedbackId', (req, res, next) => {
  const { resourceId, feedbackId } = req.params; // Extrahieren der Ressource-ID und der Feedback-ID aus den URL-Parametern

  try {
    const data = readFileSync(feedbackFile, 'utf8'); // Lesen der Feedback-Datei, die das Feedback enthält
    let feedbackList = JSON.parse(data); // Parsen der JSON-Daten in ein JavaScript-Objekt

    const initialLength = feedbackList.length; // Speichern der ursprünglichen Länge der Feedback-Liste, um zu überprüfen, ob das Feedback existiert

    // Suchen des Feedbacks mit der angegebenen Ressource-ID und Feedback-ID
    // Wenn das Feedback gefunden wird, wird es aus der Liste entfernt
    // Wenn das Feedback nicht gefunden wird, bleibt die Länge der Liste unverändert
    feedbackList = feedbackList.filter(
      f => !(f.resourceId === resourceId && f.feedbackId === feedbackId)
    );

    // Überprüfen, ob das Feedback mit der angegebenen ID gefunden wurde
    // Wenn die Länge der Liste unverändert ist, bedeutet dies, dass das Feedback nicht gefunden wurde
    // In diesem Fall wird eine Fehlermeldung mit dem Status 404 (Not Found) zurückgegeben
    if (feedbackList.length === initialLength) {
      return res.status(404).json({ error: 'Feedback nicht gefunden.' });
    }

    // Schreiben der aktualisierten Feedback-Liste zurück in die Datei
    // Die Feedbacks werden als JSON-String formatiert und in der Datei gespeichert
    writeFileSync(feedbackFile, JSON.stringify(feedbackList, null, 2), 'utf8');

    // Erfolgreiche Antwort mit dem Status 204 (No Content)
    // Dies bedeutet, dass das Feedback erfolgreich gelöscht wurde und keine Daten zurückgegeben werden
    // Der Client erhält eine leere Antwort ohne Inhalt
    res.status(204).end();

  } catch (error) {
    console.error('Fehler beim Löschen des Feedbacks:', error); // Protokollieren des Fehlers im Server-Log
    next(error); // Weiterleiten des Fehlers an die Fehlerbehandlungs-Middleware
  }
});


// Exportieren des Routers, damit er in anderen Dateien verwendet werden kann
// Dies ermöglicht es, die Routen in der server.js-Datei zu verwenden.
export default router;
