const fs = require('fs/promises');
const path = require('path');

const DATA_FILE =
  process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'courses.json');

async function readCourses() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeCourses([]);
      return [];
    }
    throw err;
  }
}

async function writeCourses(courses) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2));
}

module.exports = { readCourses, writeCourses };
