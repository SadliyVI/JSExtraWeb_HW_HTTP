import express from "express";
import cors from "cors";
import * as crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

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
        description: "Задача переустановки Windows включает несколько этапов: подготовку (резервное копирование данных), создание установочного носителя (загрузочной флешки), настройку BIOS/UEFI для загрузки с него, установку самой системы (форматирование диска и копирование файлов) и постобработку (установка драйверов, программ)",
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

    switch (method) {
        case "allTickets":
            return res.status(200).json(tickets);

        case "ticketById": {
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });
            return res.status(200).json(ticket);
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
            return res.status(200).json(newTicket);
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
            return res.status(200).json(tickets);
        }

        default:
            if (!method) return res.status(200).json({ status: "ok" });
            return res.status(400).json({ message: "Unknown method", method });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 7070;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});