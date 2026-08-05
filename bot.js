const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.DISCORD_WEDHOOK;

const REDDIT_URL = "https://www.reddit.com/r/GTAGlitches/new.json?limit=5";

async function enviarNoticias() {
    try {
        const respuesta = await axios.get(REDDIT_URL, {
            headers: {
                "User-Agent": "GTA-Glitches-Webhook"
            }
        });

        const posts = respuesta.data.data.children;

        let ultimoPost = "";

        if (fs.existsSync("last post.txt")) {
            ultimoPost = fs.readFileSync("last post.txt", "utf8");
        }

        for (const post of posts.reverse()) {
            const noticia = post.data;

            if (noticia.id === ultimoPost) {
                continue;
            }

            const mensaje = {
                username: "GTA V Glitches",
                avatar_url: "https://i.imgur.com/4M34hi2.png",
                embeds: [
                    {
                        title: noticia.title,
                        url: "https://reddit.com" + noticia.permalink,
                        description: noticia.selftext
                            ? noticia.selftext.substring(0, 1000)
                            : "Nuevo glitch encontrado en GTA V.",
                        color: 16711680,
                        footer: {
                            text: "Fuente: Reddit r/GTAGlitches"
                        },
                        timestamp: new Date()
                    }
                ]
            };

            await axios.post(WEBHOOK_URL, mensaje);

            fs.writeFileSync("last post.txt", noticia.id);

            console.log("Noticia enviada:", noticia.title);

            break;
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

enviarNoticias();
