const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

const REDDIT_URL = "https://www.reddit.com/r/GTAGlitches/new.json?limit=5&raw_json=1";

async function enviarNoticias() {
    try {
        if (!WEBHOOK_URL) {
            throw new Error("No existe el secreto DISCORD_WEBHOOK");
        }

        const respuesta = await axios.get(REDDIT_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 GTA-News-Webhook/1.0"
            }
        });

        if (!respuesta.data?.data?.children) {
            throw new Error("Reddit no devolvió datos válidos");
        }

        const posts = respuesta.data.data.children;

        let ultimoPost = "";

        if (fs.existsSync("last post.txt")) {
            ultimoPost = fs.readFileSync("last post.txt", "utf8").trim();
        }

        for (const post of posts) {
            const noticia = post.data;

            if (noticia.id === ultimoPost) {
                continue;
            }

            const mensaje = {
                username: "🚨 GTA V Glitches",
                embeds: [
                    {
                        title: noticia.title,
                        url: `https://reddit.com${noticia.permalink}`,
                        description:
                            noticia.selftext
                                ? noticia.selftext.substring(0, 1500)
                                : "Nuevo glitch encontrado en GTA V.",
                        color: 16711680,
                        fields: [
                            {
                                name: "👤 Usuario",
                                value: noticia.author || "Desconocido",
                                inline: true
                            },
                            {
                                name: "⬆️ Votos",
                                value: String(noticia.ups || 0),
                                inline: true
                            }
                        ],
                        footer: {
                            text: "Fuente: Reddit r/GTAGlitches"
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const envio = await axios.post(WEBHOOK_URL, mensaje);

            if (envio.status === 204 || envio.status === 200) {
                fs.writeFileSync("last post.txt", noticia.id);
                console.log("Noticia enviada:", noticia.title);
            }

            break;
        }

    } catch (error) {
        console.log(
            "ERROR:",
            error.response?.data || error.message
        );
    }
}

enviarNoticias();
