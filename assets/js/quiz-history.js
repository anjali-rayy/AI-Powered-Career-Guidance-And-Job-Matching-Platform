function toggleCard(id, e) {
  e.stopPropagation();
  const card = document.getElementById(id);
  card.classList.toggle('expanded');
}

function filterQuizzes(type, btn) {
  document.querySelectorAll('.qh-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.qh-card').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}