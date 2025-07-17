import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error(
    "ERRORE: La variabile d'ambiente OPENROUTER_API_KEY non è impostata. Assicurati di averla nel tuo file .env"
  );
  process.exit(1);
}

app.use(express.json());
app.use(cors());

app.post("/api/generate-text", async (req, res) => {
  // Estrai i dati necessari dal corpo della richiesta del client
  const { prompt } = req.body;

  // Controlla se i dati necessari sono presenti
  if (!prompt) {
    return res.status(400).json({ error: "prompt è obbligatorio" });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: "La chiave API di OpenRouter non è configurata sul server.",
    });
  }

  try {
    console.log("Invio richiesta a OpenRouter...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.2-24b-instruct:free", // o qualsiasi altro modello
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    // Controlla se la richiesta a OpenRouter ha avuto successo
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Errore da OpenRouter:", errorData);
      return res.status(response.status).json({
        error: "Errore durante la chiamata a OpenRouter API.",
        details: errorData,
      });
    }

    const data = await response.json();
    console.log("Risposta ricevuta da OpenRouter.");

    // Invia la risposta di OpenRouter al client
    res.json(data);
  } catch (error) {
    console.error("Errore interno del server:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server Express in ascolto sulla porta ${port}`);
  console.log(`Apri il browser su http://localhost:${port}`);
});
