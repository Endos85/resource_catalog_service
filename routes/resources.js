// routes/resources.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import validateResource from '../middleware/validateResource.js';
import validateFeedback from '../middleware/validate-feedback.js';
import { validateRating } from '../middleware/validate-rating.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');

const resourcesFile = path.join(dataDir, 'resources.json');
const feedbackFile = path.join(dataDir, 'feedback.json');
const ratingsFile = path.join(dataDir, 'ratings.json');


// Alle Ressourcen ausgeben
router.get('/', (req, res, next) => {
  try {
    const data = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(data);
    res.json(resources);
  } catch (error) {
    next(error);
  }
});


// Einzelne Ressource mit Durchschnittsbewertung
router.get('/:id', (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resourcesData = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(resourcesData);

    const ratingsData = fs.readFileSync(ratingsFile, 'utf8');
    const ratings = JSON.parse(ratingsData);

    const resource = resources.find(r => String(r.id) === String(resourceId));
    if (!resource) {
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }

    const resourceRatings = ratings.filter(r => String(r.resourceId) === String(resourceId));
    let averageRating = null;
    if (resourceRatings.length > 0) {
      const sum = resourceRatings.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / resourceRatings.length;
    }

    res.json({
      ...resource,
      averageRating,
      ratingsCount: resourceRatings.length
    });
  } catch (error) {
    next(error);
  }
});


// Neue Ressource anlegen
router.post('/', validateResource, (req, res, next) => {
  try {
    const newData = req.body;
    const newResource = {
      id: uuidv4(),
      ...newData,
    };
    const data = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(data);
    resources.push(newResource);
    fs.writeFileSync(resourcesFile, JSON.stringify(resources, null, 2), 'utf8');
    res.status(201).json(newResource);
  } catch (error) {
    next(error);
  }
});


// Ressource aktualisieren
router.put('/:id', (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const updatedData = req.body;
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: 'Datei hat keinen Inhalt!' });
    }

    const data = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(data);
    const resourceIndex = resources.findIndex(r => String(r.id) === String(resourceId));
    if (resourceIndex === -1) {
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }

    resources[resourceIndex] = {
      ...resources[resourceIndex],
      ...updatedData,
    };
    fs.writeFileSync(resourcesFile, JSON.stringify(resources, null, 2), 'utf8');
    res.status(200).json(resources[resourceIndex]);
  } catch (error) {
    next(error);
  }
});


// Ressource löschen
router.delete('/:id', (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const data = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(data);
    const resourceIndex = resources.findIndex(r => String(r.id) === String(resourceId));
    if (resourceIndex === -1) {
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }
    resources.splice(resourceIndex, 1);
    fs.writeFileSync(resourcesFile, JSON.stringify(resources, null, 2), 'utf8');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// Suche (Filter) nach type und authorId
router.get('/search', (req, res, next) => {
  try {
    const { type, authorId } = req.query;
    const data = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(data);

    const filteredResources = resources.filter(r => {
      return (type ? r.type === type : true) && (authorId ? r.authorId === authorId : true);
    });

    res.status(200).json(filteredResources);
  } catch (error) {
    next(error);
  }
});


// Feedback anlegen
router.post('/:resourceId/feedback', validateFeedback, (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { feedback_text, user_name } = req.body;

    const resourcesData = fs.readFileSync(resourcesFile, 'utf8');
    const resources = JSON.parse(resourcesData);
    if (!resources.some(r => String(r.id) === String(resourceId))) {
      return res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.` });
    }

    const feedbacksData = fs.readFileSync(feedbackFile, 'utf8');
    const feedbacks = JSON.parse(feedbacksData);

    const newFeedback = {
      feedbackId: uuidv4(),
      resourceId,
      feedback_text,
      user_name: user_name?.trim() || 'anonym',
      timestamp: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2), 'utf8');

    res.status(201).json({ message: 'Feedback gespeichert.', feedback: newFeedback });
  } catch (error) {
    next(error);
  }
});


// Feedback aktualisieren
router.put('/:resourceId/feedback/:feedbackId', validateFeedback, (req, res, next) => {
  try {
    const { resourceId, feedbackId } = req.params;
    const { feedback_text, user_name } = req.body;

    const feedbacksData = fs.readFileSync(feedbackFile, 'utf8');
    const feedbacks = JSON.parse(feedbacksData);
    const feedbackIndex = feedbacks.findIndex(f => f.resourceId === resourceId && f.feedbackId === feedbackId);

    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback nicht gefunden.' });
    }

    feedbacks[feedbackIndex] = {
      ...feedbacks[feedbackIndex],
      feedback_text,
      user_name: user_name?.trim() || feedbacks[feedbackIndex].user_name,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2), 'utf8');
    res.status(200).json(feedbacks[feedbackIndex]);
  } catch (error) {
    next(error);
  }
});


// Feedback löschen
router.delete('/:resourceId/feedback/:feedbackId', (req, res, next) => {
  try {
    const { resourceId, feedbackId } = req.params;

    const feedbacksData = fs.readFileSync(feedbackFile, 'utf8');
    let feedbacks = JSON.parse(feedbacksData);

    const initialLength = feedbacks.length;
    feedbacks = feedbacks.filter(f => !(f.resourceId === resourceId && f.feedbackId === feedbackId));

    if (feedbacks.length === initialLength) {
      return res.status(404).json({ error: 'Feedback nicht gefunden.' });
    }

    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2), 'utf8');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});


// Neue Bewertung anlegen
router.post('/:resourceId/rating', validateRating, (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { rating, user_name } = req.body;

    let ratings = [];
    if (fs.existsSync(ratingsFile)) {
      const ratingsData = fs.readFileSync(ratingsFile, 'utf8');
      ratings = JSON.parse(ratingsData);
    }

    const newRating = {
      ratingId: uuidv4(),
      resourceId,
      rating,
      user_name: user_name || 'Anonym',
      timestamp: new Date().toISOString()
    };

    ratings.push(newRating);
    fs.writeFileSync(ratingsFile, JSON.stringify(ratings, null, 2), 'utf8');

    res.status(201).json({
      message: 'Bewertung gespeichert',
      rating: newRating
    });
  } catch (error) {
    next(error);
  }
});


export default router;
