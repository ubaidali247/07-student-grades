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

// ============================================================
// FLAKINESS INJECTION LAYER v2
// MSc Dissertation - AI-Assisted Flaky Test Detection
// Probabilities tuned for ~30-40% failure rate
// ============================================================
const FLAKY_CONFIG = {
  enabled: true,
  slowProbability: 0.30,   // 30% chance of slow GET response
  errorProbability: 0.20,  // 20% chance of 500 on POST
  slowDelayMs: { min: 2000, max: 4500 }  // Below Cypress 8s timeout but enough to cause issues
};

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldBeFlaky(prob) {
  return FLAKY_CONFIG.enabled && Math.random() < prob;
}

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

function seedIfEmpty() {
  const db = readDB();
  if (db.students.length === 0) {
    db.students = [
    {
        "id": "seed-1",
        "title": "Mathematics Assignment",
        "description": "Sample description for research study item 1.",
        "category": "Mathematics",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "name": "Alice",
        "studentId": "STU1000",
        "grade": "A"
    },
    {
        "id": "seed-2",
        "title": "Science Report",
        "description": "Sample description for research study item 2.",
        "category": "Science",
        "createdAt": "2024-02-02T10:00:00.000Z",
        "name": "Bob",
        "studentId": "STU1001",
        "grade": "B+"
    },
    {
        "id": "seed-3",
        "title": "English Essay",
        "description": "Sample description for research study item 3.",
        "category": "English",
        "createdAt": "2024-03-03T10:00:00.000Z",
        "name": "Carol",
        "studentId": "STU1002",
        "grade": "B"
    },
    {
        "id": "seed-4",
        "title": "History Assignment",
        "description": "Sample description for research study item 4.",
        "category": "History",
        "createdAt": "2024-04-04T10:00:00.000Z",
        "name": "David",
        "studentId": "STU1003",
        "grade": "C+"
    },
    {
        "id": "seed-5",
        "title": "CS Project",
        "description": "Sample description for research study item 5.",
        "category": "Mathematics",
        "createdAt": "2024-05-05T10:00:00.000Z",
        "name": "Emma",
        "studentId": "STU1004",
        "grade": "A-"
    },
    {
        "id": "seed-6",
        "title": "Physics Lab",
        "description": "Sample description for research study item 6.",
        "category": "Science",
        "createdAt": "2024-06-06T10:00:00.000Z",
        "name": "Frank",
        "studentId": "STU1005",
        "grade": "A"
    },
    {
        "id": "seed-7",
        "title": "Chemistry Test",
        "description": "Sample description for research study item 7.",
        "category": "English",
        "createdAt": "2024-07-07T10:00:00.000Z",
        "name": "Grace",
        "studentId": "STU1006",
        "grade": "B+"
    },
    {
        "id": "seed-8",
        "title": "Art Portfolio",
        "description": "Sample description for research study item 8.",
        "category": "History",
        "createdAt": "2024-08-08T10:00:00.000Z",
        "name": "Henry",
        "studentId": "STU1007",
        "grade": "B"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all - 30% chance of slow response
app.get('/api/students', (req, res) => {
  const handler = () => {
    const db = readDB();
    let items = db.students;
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      items = items.filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.name && i.name.toLowerCase().includes(q)));
    }
    if (req.query.category) items = items.filter(i => i.category === req.query.category);
    res.json(items);
  };
  if (shouldBeFlaky(FLAKY_CONFIG.slowProbability)) {
    const delay = randomDelay(FLAKY_CONFIG.slowDelayMs.min, FLAKY_CONFIG.slowDelayMs.max);
    console.log(`[FLAKY] Slow GET /api/students +${delay}ms`);
    setTimeout(handler, delay);
  } else { handler(); }
});

// GET one
app.get('/api/students/:id', (req, res) => {
  const db = readDB();
  const item = db.students.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST - 20% chance of 500 error
app.post('/api/students', (req, res) => {
  if (shouldBeFlaky(FLAKY_CONFIG.errorProbability)) {
    console.log(`[FLAKY] 500 error on POST /api/students`);
    return res.status(500).json({ error: 'Flaky server error - injected for research' });
  }
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

app.post('/api/reset', (req, res) => {
  writeDB({ students: [] });
  seedIfEmpty();
  res.json({ message: 'Reset complete' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Student Grades', flakyEnabled: FLAKY_CONFIG.enabled }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Student Grades running on http://localhost:3007 [FLAKY v2]'));
