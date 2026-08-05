const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

const REDDIT_URL = "https://old.reddit.com/r/GTAGlitches/new.json?limit=5";

async function enviarNoticias() {
    try {
        if (!WEBHOOK_URL) {
            throw new Error("No existe el secreto DISCORD_WEBHOOK");
        }

        const respuesta = await axios.get(REDDIT_URL, {
            headers: {
                "User-Agent": "GTA-Glitches-Bot/1.0 by DiscordWebhook"
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
                        title: noticia.title,
                        url: `https://reddit.com${noticia.permalink}`,
                        description: noticia.selftext
                            ? noticia.selftext.substring(0, 1500)
                            : "Nuevo glitch encontrado en GTA V.",
                        color: 16711680,
                        footer: {
                            text: "Fuente: Reddit r/GTAGlitches"
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            await axios.post(WEBHOOK_URL, mensaje);

            fs.writeFileSync("last post.txt", noticia.id);

            console.log("Noticia enviada:", noticia.title);

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
