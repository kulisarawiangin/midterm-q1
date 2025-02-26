const express = require("express");
const mongodb = require("mongodb");
const amqp = require('amqplib');
const path = require("path");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.RABBIT) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");
}

const PORT = process.env.PORT;
const RABBIT = process.env.RABBIT;

// Update the image URLs to reference local images in the public folder
const ads = [
    { id: 1, image: "/images/kaidee.png", link: "https://www.kaidee.com/" },
    { id: 2, image: "/images/lazada.png", link: "https://www.lazada.co.th/" },
    { id: 3, image: "/images/shopee.png", link: "https://shopee.co.th/" }
];

async function main() {
    const messagingConnection = await amqp.connect(RABBIT);
    const messageChannel = await messagingConnection.createChannel();

    const app = express();

    // Serve static files from the 'public' folder
    app.use(express.static(path.join(__dirname, "public")));

    app.get("/ads", (req, res) => {
        res.json(ads);
    });

    app.get("/ad/:id", (req, res) => {
        const ad = ads.find(ad => ad.id === parseInt(req.params.id));
        if (ad) {
            res.json(ad);
        } else {
            res.status(404).send("Ad not found");
        }
    });

    app.listen(PORT, () => {
        console.log(`Advertise microservice online on port ${PORT}`);
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });
