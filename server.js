const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'reservations.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readReservations() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeReservations(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function isValidReservation(body) {
  const { name, phone, date, party } = body;
  if (!name || typeof name !== 'string' || !name.trim()) return 'Name is required.';
  if (!phone || typeof phone !== 'string' || !phone.trim()) return 'Phone is required.';
  if (!date || typeof date !== 'string' || !date.trim()) return 'Date is required.';
  if (!party || typeof party !== 'string' || !party.trim()) return 'Party size is required.';
  return null;
}

app.post('/api/reservations', (req, res) => {
  const error = isValidReservation(req.body);
  if (error) {
    return res.status(400).json({ ok: false, error });
  }

  const reservations = readReservations();

  const reservation = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: req.body.name.trim(),
    phone: req.body.phone.trim(),
    date: req.body.date.trim(),
    party: req.body.party.trim(),
    notes: (req.body.notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  reservations.push(reservation);
  writeReservations(reservations);

  res.status(201).json({ ok: true, reservation });
});

app.get('/api/reservations', (req, res) => {
  const reservations = readReservations();
  res.json({ ok: true, count: reservations.length, reservations });
});

app.delete('/api/reservations/:id', (req, res) => {
  const reservations = readReservations();
  const filtered = reservations.filter(r => r.id !== req.params.id);

  if (filtered.length === reservations.length) {
    return res.status(404).json({ ok: false, error: 'Reservation not found.' });
  }

  writeReservations(filtered);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Gyenos server running at http://localhost:${PORT}`);
});