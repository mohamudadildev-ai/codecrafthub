# CodeCraftHub – Personalized Learning Platform

A simple learning-management app where developers track the courses they want to take.
Built with **Node.js + Express**, data stored in a **JSON file** (`data/courses.json`), with a web UI.

## Run with Docker (recommended)

```bash
docker compose up --build -d
```

Open http://localhost:5000. Stop with `docker compose down`
(course data is kept in the `course-data` volume; `docker compose down -v` wipes it).

Without Compose:

```bash
docker build -t codecrafthub .
docker run -d -p 5000:5000 --name codecrafthub codecrafthub
```

## Run locally (requires Node.js 18+)

```bash
npm install
npm start
```

## Course fields

| Field         | Type   | Notes                                        |
|---------------|--------|----------------------------------------------|
| `id`          | number | Auto-generated                               |
| `name`        | string | Required                                     |
| `description` | string | Required                                     |
| `target_date` | string | Required, `YYYY-MM-DD`                       |
| `status`      | string | `Not Started`, `In Progress`, or `Completed` |
| `created_at`  | string | Auto-generated ISO timestamp                 |

## REST API

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/api/courses`       | List all courses         |
| GET    | `/api/courses/stats` | Course counts by status  |
| GET    | `/api/courses/:id`   | Get one course           |
| POST   | `/api/courses`       | Create a course          |
| PUT    | `/api/courses/:id`   | Update a course          |
| DELETE | `/api/courses/:id`   | Delete a course          |

### Examples

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Node.js Basics","description":"Learn Express","target_date":"2026-12-31","status":"Not Started"}'

curl http://localhost:5000/api/courses
curl -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d '{"status":"In Progress"}'
curl -X DELETE http://localhost:5000/api/courses/1
```

Errors: `400` for missing/invalid fields or bad JSON, `404` for an unknown course id, `500` for file errors.

## Project structure

```
├── src/
│   ├── server.js          # Starts the server
│   ├── app.js             # Express app setup
│   ├── storage.js         # JSON file read/write
│   └── routes/courses.js  # CRUD routes + validation
├── public/                # Web UI (index.html, styles.css, app.js)
├── data/courses.json      # Data store
├── Dockerfile
└── docker-compose.yml
```
