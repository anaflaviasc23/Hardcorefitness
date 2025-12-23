/* ================= CONFIG ================= */

const tempoDescansoPadrao = 120; // 2 minutos
const timersDescanso = {};

/* ================= MODAL ================= */

function abrirModal() {
  document.getElementById('modalTreino').style.display = 'block';
  carregarSeries();
}

function fecharModal() {
  document.getElementById('modalTreino').style.display = 'none';
}

/* ================= NOTIFICAÇÃO ================= */

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

/* ================= SÉRIES ================= */

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
  atualizarVisual(exercicioId);
}

function carregarSeries() {
  document.querySelectorAll('.exercicio').forEach(ex => {
    atualizarVisual(ex.dataset.id);
  });
}

function atualizarVisual(exercicioId) {
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

/* ================= DESCANSO ================= */

function iniciarDescanso(exercicioId) {
  const container = document.getElementById(`descanso-${exercicioId}`);
  let tempo = tempoDescansoPadrao;

  if (timersDescanso[exercicioId]) {
    clearInterval(timersDescanso[exercicioId]);
  }

  container.classList.remove('liberado');
  container.textContent = `⏱️ Descanso: ${formatarTempo(tempo)}`;

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

function formatarTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', pedirPermissaoNotificacao);


/* ================= CHECK-IN AUTOMÁTICO (TESTE) ================= */

let treinoAtivo = null;
let humorFinal = '';

function iniciarTreino() {
  const agora = new Date();

  treinoAtivo = {
    inicio: agora.toLocaleString(),
    fim: null,
    kcal: '',
    comentario: '',
    intensidade: ''
  };

  document.getElementById('inicioTreino').textContent =
    `🏁 Início: ${treinoAtivo.inicio}`;

  document.getElementById('btnFinalizar').disabled = false;
}

function finalizarTreino() {
  treinoAtivo.fim = new Date().toLocaleString();
  document.getElementById('finalizacao').style.display = 'block';
}

function selecionarHumor(btn, humor) {
  humorFinal = humor;
  document.querySelectorAll('.humor button')
    .forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
}

function salvarTreino() {
  treinoAtivo.kcal = document.getElementById('kcal').value;
  treinoAtivo.comentario = document.getElementById('comentario').value;
  treinoAtivo.intensidade = humorFinal;

  const lista = JSON.parse(localStorage.getItem('checkinsTeste')) || [];
  lista.unshift(treinoAtivo);
  localStorage.setItem('checkinsTeste', JSON.stringify(lista));

  resetarTreino();
  listarCheckinsTeste();
}

function resetarTreino() {
  treinoAtivo = null;
  humorFinal = '';

  document.getElementById('finalizacao').style.display = 'none';
  document.getElementById('btnFinalizar').disabled = true;
  document.getElementById('inicioTreino').textContent = '';
}

function listarCheckinsTeste() {
  const lista = JSON.parse(localStorage.getItem('checkinsTeste')) || [];
  const container = document.getElementById('listaTreinosTeste');

  container.innerHTML = '';

  lista.forEach(t => {
    container.innerHTML += `
      <hr>
      <strong>${t.inicio}</strong><br>
      ⏹ Fim: ${t.fim}<br>
      🔥 ${t.kcal || '-'} kcal<br>
      Intensidade: ${t.intensidade || '-'}<br>
      💬 ${t.comentario || '-'}
      <hr>
    `;
  });
}

