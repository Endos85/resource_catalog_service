// middleware/validate-feedback.js

// Middleware zum Validieren von Feedback
// Diese Middleware überprüft, ob die erforderlichen Felder im Anfrage-Body vorhanden sind und korrekt formatiert sind
export default function validateFeedback(req, res, next) {
  const { feedback_text, user_name } = req.body; // Extrahieren der Felder "feedback_text" und "user_name" aus dem Anfrage-Body

  // Überprüfen, ob das Feld "feedback_text" vorhanden ist und ein nicht-leerer String ist
  // Wenn "feedback_text" fehlt oder leer ist, wird eine 400 Bad Request-Antwort gesendet
  // Der Text muss auch ein String sein, daher die Überprüfung auf typeof feedback_text !== 'string'
  if (!feedback_text || typeof feedback_text !== 'string' || feedback_text.trim() === '') {
    return res.status(400).json({
      error: 'Feedback-Text ist erforderlich und muss ein nicht-leerer String sein.'
    });
  }

  // Überprüfen, ob das Feld "user_name" vorhanden ist und ein String ist
  // Optional: Wenn "user_name" nicht vorhanden ist, wird es nicht als Fehler betrachtet
  // Wenn es vorhanden ist, muss es ein String sein
  if (user_name && typeof user_name !== 'string') {
    return res.status(400).json({
      error: 'user_name muss ein String sein.'
    });
  }

  next();
}