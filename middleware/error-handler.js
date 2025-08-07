// middleware/error-handler.js

// Fehlerbehandlungs-Middleware für Express
// Diese Middleware fängt Fehler ab, die in den Routen auftreten, und sendet eine einheitliche Fehlermeldung zurück
const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err.message || err); // Protokollieren des Fehlers im Server-Log
    res.status(500).json({ // Senden einer JSON-Antwort mit dem Fehlerstatus 500
        error: 'Ein interner Serverfehler ist aufgetreten.' // Allgemeine Fehlermeldung, die an den Client gesendet wird
    });
};

// Exportieren der Fehlerbehandlungs-Middleware, damit sie in anderen Dateien verwendet werden kann
// Diese Middleware sollte immer am Ende der Routen definiert werden, um alle Fehler abzufangen
export { errorHandler };