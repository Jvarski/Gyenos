// Scroll-reveal for sections
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Reservation form -> real backend API
const form = document.getElementById('reservation-form');
const statusEl = document.getElementById('form-status');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: form.name.value,
    phone: form.phone.value,
    date: form.date.value,
    party: form.party.value,
    notes: form.notes.value
  };

  submitBtn.disabled = true;
  statusEl.textContent = 'Sending your request…';
  statusEl.className = 'form-status';

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    statusEl.textContent = `Thank you, ${data.reservation.name.split(' ')[0]} — your table request has been received.`;
    statusEl.className = 'form-status success';
    form.reset();
  } catch (err) {
    statusEl.textContent = err.message || 'Could not send your request. Please try again.';
    statusEl.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
