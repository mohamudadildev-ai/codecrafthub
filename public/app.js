const API = '/api/courses';

const form = document.getElementById('course-form');
const list = document.getElementById('course-list');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const fields = ['name', 'description', 'target_date', 'status'];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

async function loadCourses() {
  const [courses, stats] = await Promise.all([
    fetch(API).then((r) => r.json()),
    fetch(`${API}/stats`).then((r) => r.json()),
  ]);

  document.getElementById('stats').textContent =
    `(${stats.total} total · ${stats.by_status['Completed']} completed)`;

  if (!courses.length) {
    list.innerHTML = '<tr><td colspan="5">No courses yet. Add one above.</td></tr>';
    return;
  }

  list.innerHTML = courses.map((c) => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.description)}</td>
      <td>${escapeHtml(c.target_date)}</td>
      <td><span class="status status-${c.status.toLowerCase().replace(' ', '-')}">${escapeHtml(c.status)}</span></td>
      <td>
        <button class="btn btn-success btn-sm" onclick="editCourse(${c.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Delete</button>
      </td>
    </tr>`).join('');
}

function resetForm() {
  form.reset();
  document.getElementById('course-id').value = '';
  formTitle.textContent = 'Add a Course';
  submitBtn.textContent = 'Add Course';
  cancelBtn.hidden = true;
}

async function editCourse(id) {
  const course = await fetch(`${API}/${id}`).then((r) => r.json());
  document.getElementById('course-id').value = course.id;
  fields.forEach((f) => { document.getElementById(f).value = course[f]; });
  formTitle.textContent = 'Edit Course';
  submitBtn.textContent = 'Update Course';
  cancelBtn.hidden = false;
  showMessage('', '');
  form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showMessage('Course deleted.', 'ok');
    loadCourses();
  } else {
    const data = await res.json();
    showMessage(data.error || 'Delete failed.', 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('course-id').value;
  const body = Object.fromEntries(fields.map((f) => [f, document.getElementById(f).value]));

  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    showMessage((data.errors || [data.error]).join(' '), 'error');
    return;
  }
  showMessage(id ? 'Course updated.' : 'Course added.', 'ok');
  resetForm();
  loadCourses();
});

cancelBtn.addEventListener('click', () => { resetForm(); showMessage('', ''); });

loadCourses();
