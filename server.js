import express from "express";
import cors from "cors";
import * as crypto from "crypto";
import pino from "pino";
import pinoPretty from "pino-pretty";

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url, ct: req.headers["content-type"] }, "incoming");
    next();
});

app.get("/health", (req, res) => res.json({ ok: true }));

let tickets = [
    {
        id: crypto.randomUUID(),
        name: "Поменять краску в принтере, ком. 404",
        description: "Принтер HP LJ-1210, картриджи на складе",
        status: false,
        created: Date.now(),
    },
    {
        id: crypto.randomUUID(),
        name: "Переустановить Windows, PC-Hall24",
        description: "",
        status: false,
        created: Date.now(),
    },
    {
        id: crypto.randomUUID(),
        name: "Установить обновление KB-31642dv3875",
        description: "Вышло критическое обновление для Windows",
        status: false,
        created: Date.now(),
    },
];

app.all("*", (req, res) => {
    const { method, id } = req.query;

    switch (method) {
        case "allTickets":
            return res.json(tickets);

        case "ticketById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });
            return res.json(ticket);
        }

        case "createTicket": {
            const { name, description = "" } = req.body || {};
            if (!name) return res.status(400).json({ message: "name is required" });

            const newTicket = {
                id: crypto.randomUUID(),
                name,
                status: false,
                description,
                created: Date.now(),
            };
            tickets.push(newTicket);
            return res.json(newTicket);
        }

        case "deleteById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });
            tickets = tickets.filter((t) => t.id !== id);
            return res.status(204).end();
        }

        case "updateById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });
            Object.assign(ticket, req.body);
            return res.json(tickets);
        }

        default:
            return res.status(400).json({ message: "Unknown method", method });
    }
});

app.use((err, req, res, next) => {
    logger.error({ err }, "unhandled error");
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 7070;
app.listen(port, () => logger.info(`Server started on port ${port}`));