import express from "express";
import cors from "cors";
import * as crypto from "crypto";
import pino from "pino";
import pinoPretty from "pino-pretty";

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(express.json()); // <-- ВАЖНО

app.get("/", (req, res, next) => {
    if (!req.query.method) return res.status(200).json({ status: "ok" });
    next();
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

app.all("/", (request, response) => {
    const { method, id } = request.query;

    switch (method) {
        case "allTickets":
            logger.info("allTickets");
            return response.json(tickets);

        case "ticketById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return response.status(404).json({ message: "Ticket not found" });
            return response.json(ticket);
        }

        case "createTicket": {
            const createData = request.body || {};
            const newTicket = {
                id: crypto.randomUUID(),
                name: createData.name,
                status: false,
                description: createData.description || "",
                created: Date.now(),
            };
            tickets.push(newTicket);
            logger.info({ newTicket }, "createTicket");
            return response.json(newTicket);
        }

        case "deleteById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return response.status(404).json({ message: "Ticket not found" });
            tickets = tickets.filter((t) => t.id !== id);
            logger.info({ id }, "deleteById");
            return response.status(204).end();
        }

        case "updateById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return response.status(404).json({ message: "Ticket not found" });
            Object.assign(ticket, request.body);
            logger.info({ id }, "updateById");
            return response.json(tickets);
        }

        default:
            logger.warn({ method }, "Unknown method");
            return response.status(400).json({ message: "Unknown method", method });
    }
});

const port = process.env.PORT || 7070;
app.listen(port, () => logger.info(`Server started on port ${port}`));