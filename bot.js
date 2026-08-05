const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

const DATA_URL = "https://gtaglitches.com/js/working-glitches-data.20260804a.js";

async function enviarGlitchNuevo() {
    try {
        if (!WEBHOOK_URL) {
            throw new Error("No existe el secreto DISCORD_WEBHOOK");
        }

        const respuesta = await axios.get(DATA_URL, {
            headers: {
                "User-Agent": "GTA-Glitches-Webhook/1.0"
            }
        });

        const texto = respuesta.data;

        // Extraer el JSON que está dentro de window.WORKING_GLITCHES_DATA
        const inicio = texto.indexOf("{");
        const datos = JSON.parse(texto.substring(inicio));

        const glitches = datos.items;

        if (!glitches || glitches.length === 0) {
            throw new Error("No se encontraron glitches");
        }

        let ultimoGlitch = "";

        if (fs.existsSync("last post.txt")) {
            ultimoGlitch = fs.readFileSync("last post.txt", "utf8").trim();
        }

        const nuevo = glitches[0];

        if (nuevo.url === ultimoGlitch) {
            console.log("No hay glitches nuevos");
            return;
        }

        const mensaje = {
            username: "🚨 GTA V Glitches",
            embeds: [
                {
                    title: nuevo.title,
                    url: nuevo.url,
                    description:
                        "🆕 Nuevo glitch encontrado en GTA Online.",
                    color: 16711680,
                    fields: [
                        {
                            name: "📂 Categoría",
                            value: nuevo.categoryId || "Sin categoría",
                            inline: true
                        }
                    ],
                    footer: {
                        text: "Fuente: GTAGlitches"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        await axios.post(WEBHOOK_URL, mensaje);

        fs.writeFileSync("last post.txt", nuevo.url);

        console.log("Glitch enviado:", nuevo.title);

    } catch (error) {
        console.log(
            "ERROR:",
            error.response?.data || error.message
        );
    }
}

enviarGlitchNuevo();
