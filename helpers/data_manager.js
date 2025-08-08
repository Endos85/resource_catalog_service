import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import validateResource from '../middleware/validateResource.js';
import validateFeedback from '../middleware/validate-feedback.js';
import { validateRating } from '../middleware/validate-rating.js';

import { readJsonFileAsync, writeJsonFileAsync } from '../helpers/data_manager.js';

const router = express.Router();

const resourcesFile = 'resources.json';
const feedbackFile = 'feedback.json';
const ratingsFile = 'ratings.json';

// Alle Ressourcen ausgeben
router.get('/', async (req, res, next) => {
  try {
    const resources = await readJsonFileAsync(resourcesFile);
    res.json(resources);
  } catch (error) {
    next(error);
  }
});


// Einzelne Ressource mit Durchschnittsbewertung
router.get('/:id', async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resources = await readJsonFileAsync(resourcesFile);
    const ratings = await readJsonFileAsync(ratingsFile);

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
router.post('/', validateResource, async (req, res, next) => {
  try {
    const newData = req.body;
    const newResource = {
      id: uuidv4(),
      ...newData,
    };
    const resources = await readJsonFileAsync(resourcesFile);
    resources.push(newResource);
    await writeJsonFileAsync(resourcesFile, resources);
    res.status(201).json(newResource);
  } catch (error) {
    next(error);
  }
});


// Ressource aktualisieren
router.put('/:id', async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const updatedData = req.body;
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: 'Datei hat keinen Inhalt!' });
    }

    const resources = await readJsonFileAsync(resourcesFile);
    const resourceIndex = resources.findIndex(r => String(r.id) === String(resourceId));
    if (resourceIndex === -1) {
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }

    resources[resourceIndex] = {
      ...resources[resourceIndex],
      ...updatedData,
    };
    await writeJsonFileAsync(resourcesFile, resources);
    res.status(200).json(resources[resourceIndex]);
  } catch (error) {
    next(error);
  }
});


// Ressource löschen
router.delete('/:id', async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resources = await readJsonFileAsync(resourcesFile);
    const resourceIndex = resources.findIndex(r => String(r.id) === String(resourceId));
    if (resourceIndex === -1) {
      return res.status(404).json({ error: `Ressource mit der ID ${resourceId} nicht gefunden!` });
    }
    resources.splice(resourceIndex, 1);
    await writeJsonFileAsync(resourcesFile, resources);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Suche (Filter) nach type und authorId
router.get('/search', async (req, res, next) => {
  try {
    const { type, authorId } = req.query;
    const resources = await readJsonFileAsync(resourcesFile);

    const filteredResources = resources.filter(r => {
      return (type ? r.type === type : true) && (authorId ? r.authorId === authorId : true);
    });

    res.status(200).json(filteredResources);
  } catch (error) {
    next(error);
  }
});


// Feedback anlegen
router.post('/:resourceId/feedback', validateFeedback, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { feedback_text, user_name } = req.body;

    const resources = await readJsonFileAsync(resourcesFile);
    if (!resources.some(r => String(r.id) === String(resourceId))) {
      return res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.` });
    }

    const feedbacks = await readJsonFileAsync(feedbackFile);
    const newFeedback = {
      feedbackId: uuidv4(),
      resourceId,
      feedback_text,
      user_name: user_name?.trim() || 'anonym',
      timestamp: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    await writeJsonFileAsync(feedbackFile, feedbacks);

    res.status(201).json({ message: 'Feedback gespeichert.', feedback: newFeedback });
  } catch (error) {
    next(error);
  }
});


// Feedback aktualisieren
router.put('/:resourceId/feedback/:feedbackId', validateFeedback, async (req, res, next) => {
  try {
    const { resourceId, feedbackId } = req.params;
    const { feedback_text, user_name } = req.body;

    const feedbacks = await readJsonFileAsync(feedbackFile);
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

    await writeJsonFileAsync(feedbackFile, feedbacks);
    res.status(200).json(feedbacks[feedbackIndex]);
  } catch (error) {
    next(error);
  }
});


// Feedback löschen
router.delete('/:resourceId/feedback/:feedbackId', async (req, res, next) => {
  try {
    const { resourceId, feedbackId } = req.params;
    let feedbacks = await readJsonFileAsync(feedbackFile);

    const initialLength = feedbacks.length;
    feedbacks = feedbacks.filter(f => !(f.resourceId === resourceId && f.feedbackId === feedbackId));

    if (feedbacks.length === initialLength) {
      return res.status(404).json({ error: 'Feedback nicht gefunden.' });
    }

    await writeJsonFileAsync(feedbackFile, feedbacks);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});


// Neue Bewertung anlegen
router.post('/:resourceId/rating', validateRating, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { rating, user_name } = req.body;

    const ratings = await readJsonFileAsync(ratingsFile);

    const newRating = {
      ratingId: uuidv4(),
      resourceId,
      rating,
      user_name: user_name || 'Anonym',
      timestamp: new Date().toISOString()
    };

    ratings.push(newRating);
    await writeJsonFileAsync(ratingsFile, ratings);

    res.status(201).json({
      message: 'Bewertung gespeichert',
      rating: newRating
    });
  } catch (error) {
    next(error);
  }
});


export default router;
