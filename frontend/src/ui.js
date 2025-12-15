export function formatDate(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ticketItemTemplate(ticket) {
    return `
    <li class="ticket" data-id="${ticket.id}">
      <input class="checkbox" type="checkbox" data-role="toggle" ${ticket.status ? 'checked' : ''} />

      <div class="ticket-main" data-role="open">
        <div class="ticket-title">${escapeHtml(ticket.name)}</div>
        <div class="ticket-meta">${formatDate(ticket.created)}</div>
        <div class="ticket-desc hidden" data-role="desc"></div>
      </div>

      <div class="ticket-actions">
        <button class="icon-btn" title="Редактировать" data-role="edit">✎</button>
        <button class="icon-btn" title="Удалить" data-role="delete">x</button>
      </div>
    </li>
  `;
}

export function escapeHtml(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function renderTickets(listEl, tickets) {
    listEl.innerHTML = tickets.map(ticketItemTemplate).join('');
}

export function openModal(backdropEl, modalEl, html) {
    modalEl.innerHTML = html;
    backdropEl.classList.remove('hidden');
    modalEl.classList.remove('hidden');
}

export function closeModal(backdropEl, modalEl) {
    backdropEl.classList.add('hidden');
    modalEl.classList.add('hidden');
    modalEl.innerHTML = '';
}

export function addEditModalTemplate({ title, submitText, name = '', description = '' }) {
    return `
    <h2 class="modal-title">${escapeHtml(title)}</h2>

    <form id="ticketForm">
      <div class="field">
        <label>Краткое описание</label>
        <input name="name" value="${escapeHtml(name)}" required />
      </div>

      <div class="field">
        <label>Подробное описание</label>
        <textarea name="description">${escapeHtml(description)}</textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn" data-role="cancel">Отмена</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(submitText)}</button>
      </div>
    </form>
  `;
}

export function deleteModalTemplate({ title, text }) {
    return `
    <h2 class="modal-title">${escapeHtml(title)}</h2>
    <div>${escapeHtml(text)}</div>

    <div class="modal-actions">
      <button class="btn" data-role="cancel">Отмена</button>
      <button class="btn btn-primary" data-role="confirm">Ок</button>
    </div>
  `;
}

export function setLoading(loaderEl, isLoading) {
    loaderEl.classList.toggle('hidden', !isLoading);
}