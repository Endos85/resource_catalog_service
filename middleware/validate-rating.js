// middleware/validate-rating.js
// Middleware zum Validieren von Bewertungen
// Diese Middleware überprüft, ob die Bewertung im Anfrage-Body korrekt formatiert ist
// Die Bewertung muss eine ganze Zahl zwischen 1 und 5 sein
// Wenn die Bewertung nicht korrekt ist, wird eine 400 Bad Request-Antwort gesendet
// Wenn die Bewertung korrekt ist, wird die Anfrage fortgesetzt

export function validateRating(req, res, next) {
  const rating = Number(req.body.rating);
if (
  !Number.isInteger(rating) ||
  rating < 1 ||
  rating > 5
) {
  return res.status(400).json({ error: "Rating muss eine ganze Zahl zwischen 1 und 5 sein." });
}

  next(); // Wenn die Bewertung korrekt ist, wird die Anfrage fortgesetzt
}
