const DEFAULT_BASE_URL =
    typeof __API_URL__ !== 'undefined' && __API_URL__
        ? __API_URL__
        : 'http://localhost:7070';

export class HelpDeskApi {
    constructor(baseUrl = DEFAULT_BASE_URL) {
        this.baseUrl = String(baseUrl).replace(/\/+$/, '');
    }

    url(params) {
        const u = new URL(this.baseUrl + '/');
        Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
        return u.toString();
    }

    async request(url, { method = 'GET', body } = {}) {
        const options = { method, headers: {} };

        if (body !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);

        if (res.status === 204) return null;

        const text = await res.text();
        if (!res.ok) {
            let msg = text;
            try {
                const parsed = JSON.parse(text);
                msg = parsed?.message ?? parsed?.error ?? text;
            } catch (_) { }
            throw new Error(msg || `HTTP ${res.status}`);
        }

        return text ? JSON.parse(text) : null;
    }

    allTickets() {
        return this.request(this.url({ method: 'allTickets' }));
    }
    ticketById(id) {
        return this.request(this.url({ method: 'ticketById', id }));
    }
    createTicket({ name, description }) {
        return this.request(this.url({ method: 'createTicket' }), {
            method: 'POST',
            body: { id: null, name, description, status: false },
        });
    }
    updateById(id, patch) {
        return this.request(this.url({ method: 'updateById', id }), {
            method: 'POST',
            body: patch,
        });
    }
    deleteById(id) {
        return this.request(this.url({ method: 'deleteById', id }));
    }
}