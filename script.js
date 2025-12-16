function abrir(id) {
  document.getElementById(id).style.display = 'block';
}

function fechar() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

/* ================= TREINOS ================= */

let exerciciosTemp = [];

function addExercicio() {
  const nome = exercicio.value;
  if (!nome) return;

  exerciciosTemp.push({ nome, feito: false });
  exercicio.value = '';
  listarExerciciosTemp();
}

function listarExerciciosTemp() {
  listaExercicios.innerHTML = '';
  exerciciosTemp.forEach(e => {
    listaExercicios.innerHTML += `<li>${e.nome}</li>`;
  });
}

function salvarTreino() {
  const nome = nomeTreino.value;
  if (!nome || exerciciosTemp.length === 0) return;

  const treinos = JSON.parse(localStorage.getItem('treinos')) || [];

  treinos.push({
    nome,
    exercicios: exerciciosTemp
  });

  localStorage.setItem('treinos', JSON.stringify(treinos));

  nomeTreino.value = '';
  exerciciosTemp = [];
  listaExercicios.innerHTML = '';

  listarTreinos();
}

function listarTreinos() {
  const treinos = JSON.parse(localStorage.getItem('treinos')) || [];
  listaTreinos.innerHTML = '';

  treinos.forEach((t, i) => {
    let html = `<div><strong>${t.nome}</strong><ul>`;

    t.exercicios.forEach((e, j) => {
      html += `
        <li>
          <input type="checkbox" ${e.feito ? 'checked' : ''}
            onchange="marcar(${i}, ${j})">
          ${e.nome}
        </li>`;
    });

    html += `
      </ul>
      <button onclick="resetar(${i})">Resetar Checklist</button>
      </div>`;

    listaTreinos.innerHTML += html;
  });
}

function marcar(treinoIndex, exercicioIndex) {
  const treinos = JSON.parse(localStorage.getItem('treinos'));
  treinos[treinoIndex].exercicios[exercicioIndex].feito =
    !treinos[treinoIndex].exercicios[exercicioIndex].feito;

  localStorage.setItem('treinos', JSON.stringify(treinos));
}

function resetar(index) {
  const treinos = JSON.parse(localStorage.getItem('treinos'));
  treinos[index].exercicios.forEach(e => e.feito = false);
  localStorage.setItem('treinos', JSON.stringify(treinos));
  listarTreinos();
}

/* ================= EVOLUÇÃO ================= */

function salvarEvolucao() {
  const data = new Date().toLocaleDateString();
  const evolucao = JSON.parse(localStorage.getItem('evolucao')) || [];

  evolucao.push({
    data,
    peso: peso.value,
    quadril: quadril.value,
    perna: perna.value,
    braco: braco.value,
    busto: busto.value,
    barriga: barriga.value
  });

  localStorage.setItem('evolucao', JSON.stringify(evolucao));
  listarEvolucao();
}

function listarEvolucao() {
  const evolucao = JSON.parse(localStorage.getItem('evolucao')) || [];
  historico.innerHTML = '';

  evolucao.forEach(e => {
    historico.innerHTML += `
      <div>
        <strong>${e.data}</strong><br>
        Peso: ${e.peso}kg | Perna: ${e.perna}cm | Braço: ${e.braco}cm
      </div>`;
  });
}

/* ================= CHECK-IN ================= */

let humorSelecionado = '';

function atualizarDataHora() {
  const agora = new Date();
  const data = agora.toLocaleDateString();
  const hora = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  dataHora.textContent = `📅 ${data} • ⏰ ${hora}`;
}

function selecionarHumor(botao, humor) {
  humorSelecionado = humor;
  document.querySelectorAll('.humor button').forEach(b => b.classList.remove('ativo'));
  botao.classList.add('ativo');
}

function salvarCheckin() {
  const agora = new Date();

  const checkin = {
    data: agora.toLocaleDateString(),
    hora: agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tempo: tempoTreino.value,
    calorias: calorias.value,
    comentario: comentario.value,
    humor: humorSelecionado
  };

  const lista = JSON.parse(localStorage.getItem('checkins')) || [];
  lista.unshift(checkin);

  localStorage.setItem('checkins', JSON.stringify(lista));

  tempoTreino.value = '';
  calorias.value = '';
  comentario.value = '';
  humorSelecionado = '';

  document.querySelectorAll('.humor button').forEach(b => b.classList.remove('ativo'));

  listarCheckins();
}

function listarCheckins() {
  const lista = JSON.parse(localStorage.getItem('checkins')) || [];
  listaDias.innerHTML = '';

  lista.forEach(c => {
    listaDias.innerHTML += `
      <hr class="checkin-hr">

      <div class="checkin-card">

        <div class="checkin-comentario">
          💬 ${c.comentario || 'Sem comentário'}
        </div>

        <div class="checkin-linha">
          <span>📅 Data:</span>
          <strong>${c.data}</strong>
        </div>

        <div class="checkin-linha">
          <span>⏰ Horário Check in:</span>
          <strong>${c.hora}</strong>
        </div>

        <div class="checkin-linha">
          <span>⏱️ Tempo:</span>
          <strong>${c.tempo || '-'}</strong>
        </div>

        <div class="checkin-linha">
          <span>🔥 KCal:</span>
          <strong>${c.calorias || '-'}</strong>
        </div>

        <div class="checkin-intensidade">
          Intensidade: ${c.humor || '-'}
        </div>

      </div>

      <hr class="checkin-hr">
    `;
  });
}


/* ATUALIZAR DATA/HORA AO ABRIR */
document
  .querySelector("button[onclick=\"abrir('calendario')\"]")
  .addEventListener('click', atualizarDataHora);



/* INIT */
listarCheckins();


/* INIT */
listarTreinos();
listarEvolucao();
listarCheckin();
