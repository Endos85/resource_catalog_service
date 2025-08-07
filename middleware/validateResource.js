// middleware/validateResource.js
// Middleware zum Validieren von Ressourcen
// Diese Middleware überprüft, ob die erforderlichen Felder in der Anfrage vorhanden sind
const validateResource = (req, res, next) => {
    const { title, type } = req.body; // Extrahieren der Felder aus dem Anfrage-Body
    
    // Überprüfen, ob die erforderlichen Felder vorhanden sind
    // Wenn eines der Felder fehlt, wird eine 400 Bad Request-Antwort gesendet
    if (!title || !type) {
        return res.status(400).json({ error: 'title und type sind erforderlich.' });
    }
    next(); // Wenn alle erforderlichen Felder vorhanden sind, wird die Anfrage fortgesetzt
};

export default validateResource;
