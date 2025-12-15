import './styles.css';
import spinnerUrl from './assets/spinner.svg';
import { HelpDeskApi } from './api.js';
import {
    renderTickets,
    openModal,
    closeModal,
    addEditModalTemplate,
    deleteModalTemplate,
    setLoading,
} from './ui.js';

const api = new HelpDeskApi(); // <-- ВАЖНО

const ticketsEl = document.getElementById('tickets');
const addTicketBtn = document.getElementById('addTicketBtn');
const loaderEl = document.getElementById('loader');
const loaderImg = document.getElementById('loaderImg');
const backdropEl = document.getElementById('backdrop');
const modalEl = document.getElementById('modal');

loaderImg.src = spinnerUrl;

let cache = [];

async function refreshTickets() {
    setLoading(loaderEl, true);
    try {
        cache = await api.allTickets();
        renderTickets(ticketsEl, cache);
    } catch (e) {
        alert(`Ошибка загрузки: ${e.message}`);
    } finally {
        setLoading(loaderEl, false);
    }
}

function findTicket(id) {
    return cache.find((t) => t.id === id);
}

function bindModalCommon() {
    modalEl.addEventListener(
        'click',
        (e) => {
            if (e.target?.dataset?.role === 'cancel') closeModal(backdropEl, modalEl);
        },
        { once: true },
    );
}

addTicketBtn.addEventListener('click', () => {
    openModal(backdropEl, modalEl, addEditModalTemplate({ title: 'Добавить тикет', submitText: 'Ок' }));
    bindModalCommon();

    const form = modalEl.querySelector('#ticketForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get('name') ?? '').trim();
        const description = String(fd.get('description') ?? '').trim();
        if (!name) return;

        setLoading(loaderEl, true);
        try {
            await api.createTicket({ name, description });
            closeModal(backdropEl, modalEl);
            await refreshTickets();
        } catch (err) {
            alert(`Ошибка создания: ${err.message}`);
        } finally {
            setLoading(loaderEl, false);
        }
    });
});

backdropEl.addEventListener('click', () => closeModal(backdropEl, modalEl));

ticketsEl.addEventListener('click', async (e) => {
    const li = e.target.closest('.ticket');
    if (!li) return;

    const id = li.dataset.id;
    const role = e.target?.dataset?.role;

    if (role === 'toggle') {
        const checked = e.target.checked;
        setLoading(loaderEl, true);
        try {
            await api.updateById(id, { status: checked });
            await refreshTickets();
        } catch (err) {
            alert(`Ошибка обновления: ${err.message}`);
            e.target.checked = !checked;
        } finally {
            setLoading(loaderEl, false);
        }
        return;
    }

    if (role === 'edit') {
        const t = findTicket(id);
        openModal(
            backdropEl,
            modalEl,
            addEditModalTemplate({
                title: 'Редактировать тикет',
                submitText: 'Ок',
                name: t?.name ?? '',
                description: t?.description ?? '',
            }),
        );
        bindModalCommon();

        const form = modalEl.querySelector('#ticketForm');
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const fd = new FormData(form);
            const name = String(fd.get('name') ?? '').trim();
            const description = String(fd.get('description') ?? '').trim();

            setLoading(loaderEl, true);
            try {
                await api.updateById(id, { name, description });
                closeModal(backdropEl, modalEl);
                await refreshTickets();
            } catch (err) {
                alert(`Ошибка редактирования: ${err.message}`);
            } finally {
                setLoading(loaderEl, false);
            }
        });

        return;
    }

    if (role === 'delete') {
        openModal(
            backdropEl,
            modalEl,
            deleteModalTemplate({
                title: 'Удалить тикет',
                text: 'Вы уверены, что хотите удалить тикет? Это действие необратимо.',
            }),
        );
        bindModalCommon();

        const okBtn = modalEl.querySelector('[data-role="confirm"]');
        okBtn.addEventListener(
            'click',
            async () => {
                setLoading(loaderEl, true);
                try {
                    await api.deleteById(id);
                    closeModal(backdropEl, modalEl);
                    await refreshTickets();
                } catch (err) {
                    alert(`Ошибка удаления: ${err.message}`);
                } finally {
                    setLoading(loaderEl, false);
                }
            },
            { once: true },
        );

        return;
    }

    if (e.target.closest('[data-role="open"]')) {
        const descEl = li.querySelector('[data-role="desc"]');
        const isHidden = descEl.classList.contains('hidden');

        if (!isHidden) {
            descEl.classList.add('hidden');
            descEl.textContent = '';
            return;
        }

        setLoading(loaderEl, true);
        try {
            const full = await api.ticketById(id);
            descEl.textContent = full.description || '(нет описания)';
            descEl.classList.remove('hidden');
        } catch (err) {
            alert(`Ошибка загрузки деталей: ${err.message}`);
        } finally {
            setLoading(loaderEl, false);
        }
    }
});

refreshTickets();