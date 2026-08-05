const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.DISCORD_WEDHOOK;

const REDDIT_URL = "https://www.reddit.com/r/GTAGlitches/new.json?limit=5";

async function enviarNoticias() {
    try {
        if (!WEBHOOK_URL) {
            throw new Error("No existe el secreto DISCORD_WEDHOOK");
        }

        const respuesta = await axios.get(REDDIT_URL, {
            headers: {
                "User-Agent": "GTA-Glitches-Webhook/1.0"
            }
        });

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
                        title: noticia.title || "Nuevo glitch encontrado",
                        url: `https://reddit.com${noticia.permalink}`,
                        description:
                            noticia.selftext?.substring(0, 1500) ||
                            "Se encontró un nuevo glitch en GTA V.",
                        color: 16711680,
                        fields: [
                            {
                                name: "Autor",
                                value: noticia.author || "Desconocido",
                                inline: true
                            },
                            {
                                name: "Comentarios",
                                value: String(noticia.num_comments),
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
