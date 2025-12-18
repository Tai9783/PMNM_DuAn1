const api = {
  list: () => fetch('/api/todos').then(r => r.json()),
  create: (title) => fetch('/api/todos', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ title }) }).then(r => r.json()),
  update: (id, data) => fetch('/api/todos/' + id, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  remove: (id) => fetch('/api/todos/' + id, { method: 'DELETE' }).then(r => r.json())
};

const $form = document.getElementById('todo-form');
const $title = document.getElementById('title');
const $list = document.getElementById('todos');

function render(todos){
  $list.innerHTML = '';
  if (!todos || todos.length === 0) {
    $list.innerHTML = '<li class="empty">Không có todo nào</li>';
    return;
  }
  todos.forEach(t => {
    const li = document.createElement('li');
    li.className = t.completed ? 'done' : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''} />
        <span class="title">${escapeHtml(t.title)}</span>
      </label>
      <div class="actions">
        <button class="del" data-id="${t.id}">Xóa</button>
      </div>
    `;
    $list.appendChild(li);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}

function load(){
  api.list().then(render).catch(err => console.error(err));
}

$form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = $title.value.trim();
  if (!value) return;
  api.create(value).then(() => { $title.value = ''; load(); });
});

$list.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('button.del')){
    const id = t.dataset.id;
    api.remove(id).then(() => load());
  }
});

$list.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('input[type="checkbox"]')){
    const id = t.dataset.id;
    api.update(id, { completed: t.checked }).then(() => load());
  }
});

load();
