const STORAGE_KEY = 'sorfarnotas_v1';

let notes = [];
let editingId = null;

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    notes = raw ? JSON.parse(raw) : [];
  } catch {
    notes = [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function renderList() {
  const list = document.getElementById('notes-list');
  const empty = document.getElementById('empty-msg');
  list.innerHTML = '';

  if (notes.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  // más recientes primero
  const sorted = [...notes].sort((a, b) => b.updated - a.updated);
  sorted.forEach(n => {
    const el = document.createElement('div');
    el.className = 'note-item';
    const preview = n.body.slice(0, 100).replace(/\n/g, ' ');
    el.innerHTML = `
      <h3>${escapeHtml(n.title || 'Sin título')}</h3>
      <time>${formatDate(n.updated)}</time>
      ${preview ? `<p>${escapeHtml(preview)}</p>` : ''}
    `;
    el.addEventListener('click', () => openView(n.id));
    list.appendChild(el);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openForm(id = null) {
  editingId = id;
  const titleInput = document.getElementById('note-title');
  const bodyInput = document.getElementById('note-body');
  const formTitle = document.getElementById('form-title');

  if (id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    formTitle.textContent = 'Editar nota';
    titleInput.value = n.title;
    bodyInput.value = n.body;
  } else {
    formTitle.textContent = 'Nueva nota';
    titleInput.value = '';
    bodyInput.value = '';
  }
  showScreen('form-screen');
  titleInput.focus();
}

function openView(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  editingId = id;
  document.getElementById('view-title').textContent = n.title || 'Sin título';
  document.getElementById('view-date').textContent = formatDate(n.updated);
  document.getElementById('view-body').textContent = n.body || '';
  showScreen('view-screen');
}

function saveNote() {
  const title = document.getElementById('note-title').value.trim();
  const body = document.getElementById('note-body').value.trim();
  if (!title && !body) {
    alert('Escribe algo antes de guardar.');
    return;
  }
  const now = Date.now();
  if (editingId) {
    const n = notes.find(x => x.id === editingId);
    if (n) {
      n.title = title;
      n.body = body;
      n.updated = now;
    }
  } else {
    notes.push({
      id: 'n_' + now + '_' + Math.random().toString(36).slice(2, 7),
      title,
      body,
      created: now,
      updated: now
    });
  }
  saveNotes();
  editingId = null;
  renderList();
  showScreen('list-screen');
}

function deleteNote() {
  if (!editingId) return;
  if (!confirm('¿Eliminar esta nota?')) return;
  notes = notes.filter(x => x.id !== editingId);
  saveNotes();
  editingId = null;
  renderList();
  showScreen('list-screen');
}

// Eventos
document.getElementById('btn-ver-notas').addEventListener('click', () => {
  renderList();
  showScreen('list-screen');
});

document.getElementById('btn-crear-nota').addEventListener('click', () => openForm());

document.getElementById('btn-back-list').addEventListener('click', () => showScreen('menu-screen'));
document.getElementById('btn-back-form').addEventListener('click', () => {
  editingId = null;
  showScreen('menu-screen');
});
document.getElementById('btn-back-view').addEventListener('click', () => {
  renderList();
  showScreen('list-screen');
});

document.getElementById('btn-save').addEventListener('click', saveNote);
document.getElementById('btn-edit').addEventListener('click', () => openForm(editingId));
document.getElementById('btn-delete').addEventListener('click', deleteNote);

// Init
loadNotes();
showScreen('menu-screen');
