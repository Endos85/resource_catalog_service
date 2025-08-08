// middleware/validate-feedback.js

// Middleware zum Validieren von Feedback
// Diese Middleware überprüft, ob die erforderlichen Felder im Anfrage-Body vorhanden sind und korrekt formatiert sind
export default function validateFeedback(req, res, next) {
  let { feedback_text, user_name } = req.body;

  if (
    !feedback_text || 
    typeof feedback_text !== 'string' || 
    feedback_text.trim().length < 20 ||       // mindestens 20 Zeichen nach trim
    feedback_text.trim().length > 500         // maximal 500 Zeichen nach trim
  ) {
    return res.status(400).json({
      error: 'Feedback-Text muss zwischen 20 und 500 nicht-leeren Zeichen lang sein.'
    });
  }

  // Überprüfen, ob user_name vorhanden ist und ein String ist
  if (user_name && typeof user_name !== 'string') {
    return res.status(400).json({
      error: 'user_name muss ein String sein.'
    });
  }

  if (user_name && typeof user_name === 'string') {
    req.body.user_name = user_name.trim();
  }

  req.body.feedback_text = feedback_text.trim();

  next();
}