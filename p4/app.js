const STORAGE_KEY = 'todo-calendar-v1';
const state = {
  current: new Date()
};

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveTodos(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Could not save todos', e);
  }
}

function formatKey(date) {

  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

const todosStore = { data: loadTodos() };

function renderMonth(date) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekdayRow = document.createElement('div');
  weekdayRow.className = 'weekdays';
  weekdays.forEach(w => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = w;
    weekdayRow.appendChild(el);
  });
  calendar.appendChild(weekdayRow);

  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth()+1, 0);
  const startDay = first.getDay();
  const totalDays = last.getDate();

  for (let i=0;i<startDay;i++){
    const empty = document.createElement('div');
    empty.className = 'day empty';
    calendar.appendChild(empty);
  }

  for (let d=1; d<=totalDays; d++) {
    const dt = new Date(date.getFullYear(), date.getMonth(), d);
    const key = formatKey(dt);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.dataset.date = key;

    const header = document.createElement('div');
    header.className = 'dayHeader';
    const num = document.createElement('div');
    num.className = 'dayNumber';
    num.textContent = d;
    header.appendChild(num);

    const count = (todosStore.data[key] || []).length;
    if (count) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = count;
      header.appendChild(badge);
    }

    dayEl.appendChild(header);
    dayEl.addEventListener('click', () => openPanel(dt));
    calendar.appendChild(dayEl);
  }
  document.getElementById('monthLabel').textContent = date.toLocaleString(undefined,{month:'long', year:'numeric'});
}

function openPanel(date) {
  const key = formatKey(date);
  const panel = document.getElementById('todoPanel');
  panel.classList.remove('hidden');
  document.getElementById('panelDate').textContent = date.toDateString();
  document.getElementById('todoInput').value = '';
  panel.dataset.date = key;
  renderTodoList(key);
}

function closePanel() {
  const panel = document.getElementById('todoPanel');
  panel.classList.add('hidden');
  delete panel.dataset.date;
}

function renderTodoList(key) {
  const list = document.getElementById('todoList');
  list.innerHTML = '';
  const items = todosStore.data[key] || [];
  items.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    const txt = document.createElement('div');
    txt.className = 'todo-text';
    txt.textContent = t.text;
    const actions = document.createElement('div');

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      items.splice(idx,1);
      if (items.length) todosStore.data[key] = items;
      else delete todosStore.data[key];
      saveTodos(todosStore.data);
      renderTodoList(key);
      renderMonth(state.current);
    });

    actions.appendChild(del);
    li.appendChild(txt);
    li.appendChild(actions);
    list.appendChild(li);
  });
  if (!items.length) {
    const none = document.createElement('div');
    none.className = 'small-muted';
    none.textContent = 'No todos for this date';
    list.appendChild(none);
  }
}

function addTodoForOpenDate(text) {
  const panel = document.getElementById('todoPanel');
  const key = panel.dataset.date;
  if (!key) return;
  const items = todosStore.data[key] || [];
  items.push({ text, created: Date.now() });
  todosStore.data[key] = items;
  saveTodos(todosStore.data);
  renderTodoList(key);
  renderMonth(state.current);
}

document.getElementById('prevMonth').addEventListener('click', () => {
  state.current = new Date(state.current.getFullYear(), state.current.getMonth()-1, 1);
  renderMonth(state.current);
});
document.getElementById('nextMonth').addEventListener('click', () => {
  state.current = new Date(state.current.getFullYear(), state.current.getMonth()+1, 1);
  renderMonth(state.current);
});
document.getElementById('closePanel').addEventListener('click', closePanel);
document.getElementById('todoForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (!text) return;
  addTodoForOpenDate(text);
  input.value = '';
});

renderMonth(state.current);