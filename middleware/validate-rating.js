// middleware/validate-rating.js
// Middleware zum Validieren von Bewertungen
// Diese Middleware überprüft, ob die Bewertung im Anfrage-Body korrekt formatiert ist
// Die Bewertung muss eine ganze Zahl zwischen 1 und 5 sein
// Wenn die Bewertung nicht korrekt ist, wird eine 400 Bad Request-Antwort gesendet
// Wenn die Bewertung korrekt ist, wird die Anfrage fortgesetzt

export function validateRating(req, res, next) {
  const { rating } = req.body; // Extrahieren der Bewertung aus dem Anfrage-Body

  // Überprüfen, ob das Feld "rating" vorhanden ist und eine ganze Zahl zwischen 1 und 5 ist
  // Wenn "rating" fehlt oder nicht im richtigen Format ist, wird eine 400 Bad Request-Antwort gesendet
  // Die Überprüfung stellt sicher, dass rating ein Number ist, eine ganze Zahl und im Bereich von 1 bis 5 liegt
  if (
    typeof rating !== "number" || // Überprüfen, ob rating eine Zahl ist
    !Number.isInteger(rating) || // Überprüfen, ob rating eine ganze Zahl ist
    rating < 1 || // Überprüfen, ob rating mindestens 1 ist
    rating > 5 // Überprüfen, ob rating höchstens 5 ist
  ) { // Wenn die Bewertung nicht korrekt ist, wird eine 400 Bad Request-Antwort gesendet
    return res.status(400).json({ error: "Rating muss eine ganze Zahl zwischen 1 und 5 sein." });
  }

  next(); // Wenn die Bewertung korrekt ist, wird die Anfrage fortgesetzt
}
