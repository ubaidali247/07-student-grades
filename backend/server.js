const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3007;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { students: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.students.length === 0) {
    db.students = [
    {
        "id": "seed-1",
        "title": "Mathematics Grade",
        "description": "Sample description for Mathematics Grade. This is test data for the flaky test detection research study.",
        "category": "Mathematics",
        "createdAt": "2026-07-21T00:21:18.623Z",
        "name": "Alice",
        "studentId": "STU1000",
        "grade": "A",
        "semester": "Semester 1"
    },
    {
        "id": "seed-2",
        "title": "Science Report",
        "description": "Sample description for Science Report. This is test data for the flaky test detection research study.",
        "category": "Science",
        "createdAt": "2026-07-20T00:21:18.623Z",
        "name": "Bob",
        "studentId": "STU1001",
        "grade": "B+",
        "semester": "Semester 2"
    },
    {
        "id": "seed-3",
        "title": "English Essay",
        "description": "Sample description for English Essay. This is test data for the flaky test detection research study.",
        "category": "English",
        "createdAt": "2026-07-19T00:21:18.623Z",
        "name": "Carol",
        "studentId": "STU1002",
        "grade": "B",
        "semester": "Semester 1"
    },
    {
        "id": "seed-4",
        "title": "History Assignment",
        "description": "Sample description for History Assignment. This is test data for the flaky test detection research study.",
        "category": "History",
        "createdAt": "2026-07-18T00:21:18.623Z",
        "name": "David",
        "studentId": "STU1003",
        "grade": "C+",
        "semester": "Semester 2"
    },
    {
        "id": "seed-5",
        "title": "CS Project",
        "description": "Sample description for CS Project. This is test data for the flaky test detection research study.",
        "category": "Computer Science",
        "createdAt": "2026-07-17T00:21:18.623Z",
        "name": "Emma",
        "studentId": "STU1004",
        "grade": "A-",
        "semester": "Semester 1"
    },
    {
        "id": "seed-6",
        "title": "Physics Lab",
        "description": "Sample description for Physics Lab. This is test data for the flaky test detection research study.",
        "category": "Mathematics",
        "createdAt": "2026-07-16T00:21:18.623Z",
        "name": "Frank",
        "studentId": "STU1005",
        "grade": "A",
        "semester": "Semester 2"
    },
    {
        "id": "seed-7",
        "title": "Chemistry Test",
        "description": "Sample description for Chemistry Test. This is test data for the flaky test detection research study.",
        "category": "Science",
        "createdAt": "2026-07-15T00:21:18.623Z",
        "name": "Grace",
        "studentId": "STU1006",
        "grade": "B+",
        "semester": "Semester 1"
    },
    {
        "id": "seed-8",
        "title": "Art Portfolio",
        "description": "Sample description for Art Portfolio. This is test data for the flaky test detection research study.",
        "category": "English",
        "createdAt": "2026-07-14T00:21:18.623Z",
        "name": "Henry",
        "studentId": "STU1007",
        "grade": "B",
        "semester": "Semester 2"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/students', (req, res) => {
  const db = readDB();
  let items = db.students;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/students/:id', (req, res) => {
  const db = readDB();
  const item = db.students.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/students', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.students.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/students/:id', (req, res) => {
  const db = readDB();
  const idx = db.students.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.students[idx]);
});

// DELETE
app.delete('/api/students/:id', (req, res) => {
  const db = readDB();
  const idx = db.students.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { students: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Student Grades' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Student Grades server running on http://localhost:3007'));
