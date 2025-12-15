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
    logger.info(
        { method: req.method, url: req.url, query: req.query, ct: req.headers["content-type"] },
        "incoming"
    );
    next();
});

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

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

app.all("/", (req, res) => {
    const { method, id } = req.query;

    logger.info({ method, id }, "api call");

    switch (method) {
        case "allTickets": {
            logger.info("allTickets handler");
            return res.status(200).json(tickets);
        }

        case "ticketById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found" });
            }
            return res.status(200).json(ticket);
        }

        case "createTicket": {
            const createData = req.body || {};
            if (!createData.name) {
                return res.status(400).json({ message: "Field 'name' is required" });
            }

            const newTicket = {
                id: crypto.randomUUID(),
                name: createData.name,
                status: false,
                description: createData.description || "",
                created: Date.now(),
            };

            tickets.push(newTicket);
            logger.info({ newTicket }, "createTicket");
            return res.status(200).json(newTicket);
        }

        case "deleteById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found" });
            }

            tickets = tickets.filter((t) => t.id !== id);
            logger.info({ id }, "deleteById");
            return res.status(204).end();
        }

        case "updateById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found" });
            }

            const updateData = req.body || {};
            Object.assign(ticket, updateData);

            logger.info({ id, updateData }, "updateById");
            return res.status(200).json(tickets);
        }

        default: {
            // Если запрос без method (например, Render проверяет "/"), отвечаем ok
            if (!method) {
                return res.status(200).json({ status: "ok" });
            }

            logger.warn({ method }, "Unknown method");
            return res.status(400).json({ message: "Unknown method", method });
        }
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    logger.error({ err }, "unhandled error");
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 7070;
app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
});