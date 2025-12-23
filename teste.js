/* ================= TESTES TREINO ================= */

const tempoDescansoPadrao = 120; // 2 min
const timersDescanso = {};

function abrirTeste() {
  document.getElementById('modalTeste').style.display = 'block';
}

function fecharTeste() {
  document.getElementById('modalTeste').style.display = 'none';
}

/* ---------- NOTIFICAÇÃO ---------- */

function pedirPermissaoNotificacao() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function enviarNotificacao(titulo, mensagem) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, { body: mensagem });
  }
}

/* ---------- SÉRIES ---------- */

function marcarSerie(exercicioId, serie) {
  const key = 'seriesTeste';
  const dados = JSON.parse(localStorage.getItem(key)) || {};

  if (!dados[exercicioId]) dados[exercicioId] = [];

  if (!dados[exercicioId].includes(serie)) {
    dados[exercicioId].push(serie);
    iniciarDescanso(exercicioId);
  } else {
    dados[exercicioId] = dados[exercicioId].filter(s => s !== serie);
  }

  localStorage.setItem(key, JSON.stringify(dados));
  atualizarSeriesVisual(exercicioId);
}

/* ---------- VISUAL ---------- */

function atualizarSeriesVisual(exercicioId) {
  const dados = JSON.parse(localStorage.getItem('seriesTeste')) || {};
  const exercicio = document.querySelector(`[data-id="${exercicioId}"]`);
  const spans = exercicio.querySelectorAll('.series span');

  spans.forEach((span, index) => {
    span.classList.toggle(
      'feito',
      dados[exercicioId]?.includes(index + 1)
    );
  });
}

/* ---------- DESCANSO ---------- */

function iniciarDescanso(exercicioId) {
  const container = document.getElementById(`descanso-${exercicioId}`);
  let tempo = tempoDescansoPadrao;

  if (timersDescanso[exercicioId]) {
    clearInterval(timersDescanso[exercicioId]);
  }

  container.textContent = `⏱️ Descanso: ${formatarTempo(tempo)}`;
  container.classList.remove('liberado');

  timersDescanso[exercicioId] = setInterval(() => {
    tempo--;

    if (tempo <= 0) {
      clearInterval(timersDescanso[exercicioId]);
      container.textContent = '🔥 Pode iniciar a próxima série!';
      container.classList.add('liberado');

      enviarNotificacao(
        '🔥 Descanso finalizado',
        'Pode iniciar a próxima série'
      );
    } else {
      container.textContent = `⏱️ Descanso: ${formatarTempo(tempo)}`;
    }
  }, 1000);
}

function formatarTempo(seg) {
  const m = String(Math.floor(seg / 60)).padStart(2, '0');
  const s = String(seg % 60).padStart(2, '0');
  return `${m}:${s}`;
}

document.addEventListener('DOMContentLoaded', pedirPermissaoNotificacao);
