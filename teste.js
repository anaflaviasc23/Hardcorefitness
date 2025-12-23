/* ================= TREINO TESTE (ISOLADO) ================= */

let tempoTeste = 0;
let cronometroTeste = null;
let pausado = false;
let humorTeste = '';

function iniciarTreinoTeste() {
  tempoTeste = 0;
  pausado = false;

  document.getElementById('cronometroTeste').textContent = '00:00:00';

  cronometroTeste = setInterval(() => {
    tempoTeste++;
    document.getElementById('cronometroTeste').textContent = formatarTempoTeste(tempoTeste);
  }, 1000);

  btnIniciarTeste.disabled = true;
  btnPausarTeste.disabled = false;
  btnFinalizarTeste.disabled = false;
}

function pausarTreinoTeste() {
  if (!pausado) {
    clearInterval(cronometroTeste);
    pausado = true;
    btnPausarTeste.textContent = '▶ Retomar';
  } else {
    cronometroTeste = setInterval(() => {
      tempoTeste++;
      cronometroTesteDisplay();
    }, 1000);

    pausado = false;
    btnPausarTeste.textContent = '⏸ Pausar';
  }
}

function cronometroTesteDisplay() {
  document.getElementById('cronometroTeste').textContent =
    formatarTempoTeste(tempoTeste);
}

function finalizarTreinoTeste() {
  clearInterval(cronometroTeste);
  document.getElementById('dadosFinaisTeste').style.display = 'block';
}

function selecionarHumorTeste(botao, humor) {
  humorTeste = humor;
  document.querySelectorAll('#treinoTeste .humor button')
    .forEach(b => b.classList.remove('ativo'));
  botao.classList.add('ativo');
}

function salvarTreinoTeste() {
  const agora = new Date();

  const treino = {
    data: agora.toLocaleDateString(),
    hora: agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tempo: formatarTempoTeste(tempoTeste),
    kcal: document.getElementById('kcalTeste').value,
    comentario: document.getElementById('comentarioTeste').value,
    intensidade: humorTeste
  };

  const lista = JSON.parse(localStorage.getItem('treinosTeste')) || [];
  lista.unshift(treino);
  localStorage.setItem('treinosTeste', JSON.stringify(lista));

  resetarTreinoTeste();
  listarTreinosTeste();
}

function listarTreinosTeste() {
  const lista = JSON.parse(localStorage.getItem('treinosTeste')) || [];
  const container = document.getElementById('listaTreinosTeste');

  container.innerHTML = '';

  lista.forEach(t => {
    container.innerHTML += `
      <hr>
      <strong>${t.data} • ${t.hora}</strong><br>
      ⏱️ ${t.tempo}<br>
      🔥 ${t.kcal || '-'} kcal<br>
      Intensidade: ${t.intensidade || '-'}<br>
      💬 ${t.comentario || 'Sem comentário'}
      <hr>
    `;
  });
}

function resetarTreinoTeste() {
  tempoTeste = 0;
  humorTeste = '';
  pausado = false;

  document.getElementById('dadosFinaisTeste').style.display = 'none';
  document.getElementById('kcalTeste').value = '';
  document.getElementById('comentarioTeste').value = '';

  btnIniciarTeste.disabled = false;
  btnPausarTeste.disabled = true;
  btnFinalizarTeste.disabled = true;
  btnPausarTeste.textContent = '⏸ Pausar';
}

function formatarTempoTeste(seg) {
  const h = String(Math.floor(seg / 3600)).padStart(2, '0');
  const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
  const s = String(seg % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/* carregar histórico do teste */
document.addEventListener('DOMContentLoaded', listarTreinosTeste);

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
