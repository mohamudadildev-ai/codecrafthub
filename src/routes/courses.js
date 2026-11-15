const express = require('express');
const { readCourses, writeCourses } = require('../storage');

const router = express.Router();

const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];
const REQUIRED_FIELDS = ['name', 'description', 'target_date', 'status'];

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

function validate(body, partial = false) {
  const errors = [];
  if (!partial) {
    for (const f of REQUIRED_FIELDS) {
      if (body[f] === undefined || String(body[f]).trim() === '') {
        errors.push(`Missing required field: ${f}`);
      }
    }
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (body.target_date !== undefined && !isValidDate(body.target_date)) {
    errors.push('Invalid target_date. Use format YYYY-MM-DD');
  }
  return errors;
}

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// GET /api/courses - list all courses
router.get('/', wrap(async (req, res) => {
  res.json(await readCourses());
}));

// GET /api/courses/stats - counts by status
router.get('/stats', wrap(async (req, res) => {
  const courses = await readCourses();
  const by_status = Object.fromEntries(VALID_STATUSES.map((s) => [s, 0]));
  courses.forEach((c) => { by_status[c.status] = (by_status[c.status] || 0) + 1; });
  res.json({ total: courses.length, by_status });
}));

// GET /api/courses/:id - get one course
router.get('/:id', wrap(async (req, res) => {
  const courses = await readCourses();
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
}));

// POST /api/courses - create a course
router.post('/', wrap(async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const courses = await readCourses();
  const course = {
    id: courses.length ? Math.max(...courses.map((c) => c.id)) + 1 : 1,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    target_date: req.body.target_date,
    status: req.body.status,
    created_at: new Date().toISOString(),
  };
  courses.push(course);
  await writeCourses(courses);
  res.status(201).json(course);
}));

// PUT /api/courses/:id - update a course
router.put('/:id', wrap(async (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  const courses = await readCourses();
  const idx = courses.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });

  for (const f of REQUIRED_FIELDS) {
    if (req.body[f] !== undefined) {
      courses[idx][f] = typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f];
    }
  }
  await writeCourses(courses);
  res.json(courses[idx]);
}));

// DELETE /api/courses/:id - delete a course
router.delete('/:id', wrap(async (req, res) => {
  const courses = await readCourses();
  const idx = courses.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });

  const [removed] = courses.splice(idx, 1);
  await writeCourses(courses);
  res.json({ message: 'Course deleted', course: removed });
}));

module.exports = router;
