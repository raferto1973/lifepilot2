/* ---------- CUSTOM MODALS ---------- */
function showAlert(msg) {
  const modal = document.getElementById('custom-modal');
  document.getElementById('modal-title').innerText = 'Life Pilot';
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  const paragraph = document.createElement('p');
  paragraph.textContent = msg;
  body.appendChild(paragraph);
  document.getElementById('modal-actions').innerHTML = `<button class="modal-btn ok" onclick="closeModal()">OK</button>`;
  modal.classList.add('active');
}
function showConfirm(msg, callback) {
  const modal = document.getElementById('custom-modal');
  document.getElementById('modal-title').innerText = 'Life Pilot';
  document.getElementById('modal-body').innerHTML = `<p>${msg}</p>`;
  document.getElementById('modal-actions').innerHTML = `
    <button class="modal-btn cancel" onclick="closeModal()">Cancelar</button>
    <button class="modal-btn ok" id="modal-confirm-btn">Confirmar</button>
  `;
  document.getElementById('modal-confirm-btn').onclick = () => {
    closeModal();
    if(callback) callback();
  };
  modal.classList.add('active');
}
function closeModal() {
  document.getElementById('custom-modal').classList.remove('active');
}

/* ---------- SETTINGS LOGIC ---------- */
document.getElementById('settings-btn').addEventListener('click', () => {
  renderSettingsUI();
  document.getElementById('settings-modal').classList.add('active');
});

function renderSettingsUI() {
  const dietList = document.getElementById('settings-diet-list');
  dietList.innerHTML = DIET_MENU.map((d,i) => `
    <div class="settings-section" data-idx="${i}">
      <strong>${d.day}</strong>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <input type="text" class="diet-b" value="${d.breakfast}" placeholder="Desayuno">
        <input type="text" class="diet-l" value="${d.lunch}" placeholder="Comida">
        <input type="text" class="diet-l-with" value="${d.lunchWith || ''}" placeholder="Con quién se comparte la comida">
        <input type="text" class="diet-d" value="${d.dinner}" placeholder="Cena">
        <input type="text" class="diet-d-with" value="${d.dinnerWith || ''}" placeholder="Con quién se comparte la cena">
      </div>
    </div>
  `).join('');

  const stretchList = document.getElementById('settings-stretches-list');
  stretchList.innerHTML = STRETCHES.map((s,i) => `
    <div class="settings-row stretch-item">
      <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
        <input type="text" class="st-name" value="${s[0]}" placeholder="Nombre">
        <input type="text" class="st-desc" value="${s[1]}" placeholder="Descripción corta">
      </div>
      <button class="modal-btn danger" onclick="this.closest('.settings-row').remove()"><i class="ti ti-trash"></i></button>
    </div>
  `).join('');

  const careList = document.getElementById('settings-care-list');
  careList.innerHTML = CARE_ITEMS.map((c,i) => `
    <div class="settings-row care-item">
      <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
        <input type="text" class="care-label" value="${c[1]}" placeholder="Nombre de la tarea">
      </div>
      <button class="modal-btn danger" onclick="this.closest('.settings-row').remove()"><i class="ti ti-trash"></i></button>
    </div>
  `).join('');
}

function addStretchRow() {
  const div = document.createElement('div');
  div.className = 'settings-row stretch-item';
  div.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
      <input type="text" class="st-name" placeholder="Nombre">
      <input type="text" class="st-desc" placeholder="Descripción">
    </div>
    <button class="modal-btn danger" onclick="this.closest('.settings-row').remove()"><i class="ti ti-trash"></i></button>
  `;
  document.getElementById('settings-stretches-list').appendChild(div);
}

function addCareRow() {
  const div = document.createElement('div');
  div.className = 'settings-row care-item';
  div.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
      <input type="text" class="care-label" placeholder="Nombre de la tarea">
    </div>
    <button class="modal-btn danger" onclick="this.closest('.settings-row').remove()"><i class="ti ti-trash"></i></button>
  `;
  document.getElementById('settings-care-list').appendChild(div);
}

function saveSettings() {
  // Diet
  const newDiet = [];
  document.querySelectorAll('#settings-diet-list .settings-section').forEach(row => {
    newDiet.push({
      day: row.querySelector('strong').innerText,
      breakfast: row.querySelector('.diet-b').value,
      lunch: row.querySelector('.diet-l').value,
      lunchWith: row.querySelector('.diet-l-with').value,
      dinner: row.querySelector('.diet-d').value,
      dinnerWith: row.querySelector('.diet-d-with').value
    });
  });
  DIET_MENU = newDiet;
  saveState('cfg-diet', DIET_MENU);
  localStorage.setItem('cfg-diet-version', DIET_PLAN_VERSION);

  // Stretches
  const newStretches = [];
  document.querySelectorAll('#settings-stretches-list .stretch-item').forEach(row => {
    const name = row.querySelector('.st-name').value;
    const desc = row.querySelector('.st-desc').value;
    if(name) newStretches.push([name, desc]);
  });
  STRETCHES = newStretches;
  saveState('cfg-stretches', STRETCHES);

  // Care
  const newCare = [];
  document.querySelectorAll('#settings-care-list .care-item').forEach((row, i) => {
    const label = row.querySelector('.care-label').value;
    // Generate a simple id based on index
    if(label) newCare.push([`custom_care_${i}`, label]);
  });
  CARE_ITEMS = newCare;
  saveState('cfg-care', CARE_ITEMS);

  // Update UI
  renderDiet();
  renderStretches();
  renderCare();
  
  document.getElementById('settings-modal').classList.remove('active');
  showAlert('Ajustes guardados correctamente.');
}

/* ---------- EJERCICIO ---------- */
const EXERCISES = {
  caminar_20: ["Caminar en llano", "20–30 min a ritmo cómodo; se puede dividir en dos paseos. Aumenta 5 min cada 2–3 sesiones sólo si el pie está igual al día siguiente."],
  caminar_40: ["Caminar 30–40 min", "Ritmo cómodo y continuo. Sin perseguir pasos ni cuestas; detente si el síntoma se extiende hacia el pie."],
  caminar_60: ["Caminar 45–60 min", "Prueba funcional para el viaje. Otra opción es 30–40 min por la mañana y por la tarde."],
  brace: ["Brace abdominal", "5 repeticiones de 8–10 s, respirando con normalidad y sin aplastar ni arquear la zona lumbar."],
  puente_corto: ["Puente corto", "2×8–10. Eleva sólo hasta mantener la espalda neutra; baja despacio."],
  bird_dog_corto: ["Bird-dog corto", "2×5 por lado. Extiende sin elevar mucho la pierna y mantén pelvis y zona lumbar inmóviles."],
  sentarse_levantarse: ["Sentarse y levantarse", "2×8–10 desde una silla estable, con control y espalda neutra."],
  clamshell: ["Clamshell", "2×10 por lado. Pies juntos y pelvis quieta; abre la rodilla sin girarte hacia atrás."],
  talones_bilateral: ["Elevación bilateral de talones", "2×8 con apoyo en la pared. Para si aparece debilidad, dolor irradiado o aumenta claramente el hormigueo."],
  dead_bug_apoyado: ["Dead bug con apoyo", "2×5 por lado, dejando un pie apoyado. No permitas que se arquee la espalda."],
  plancha_lateral_rodillas: ["Plancha lateral desde rodillas", "3×10–15 s por lado, cuerpo alineado y respiración normal."],
  sentadilla: ["Sentadilla", "3×10–12, primero sin peso. Mantén la espalda neutra y el control durante todo el recorrido."],
  zancada_corta: ["Zancada estática corta", "2×6–8 por lado, recorrido cómodo y tronco estable."],
  hip_thrust: ["Puente / hip thrust", "3×10–12, sin hiperextender la zona lumbar al final."],
  bird_dog_completo: ["Bird-dog controlado", "3×8 por lado, 3–5 s por repetición y pelvis inmóvil."],
  dead_bug: ["Dead bug", "3×6–8 por lado. Reduce la palanca o vuelve a apoyar un pie si la zona lumbar pierde el control."],
  plancha_frontal: ["Plancha frontal", "3×15–20 s con buena técnica; no hace falta prolongarla más."],
  piscina_suave: ["Piscina suave", "15–25 min de crol o espalda, usando el estilo que mantenga el pie estable. Sin braza, virajes agresivos, saltos ni series rápidas."],
  piscina_progresiva: ["Piscina progresiva", "25–45 min suaves. Puedes probar 50–100 m de braza sólo si llevas semanas estable y no empeoras ese día ni el siguiente."],
  bici_15: ["Bicicleta estática", "10–15 min, resistencia baja y postura erguida. Sólo si caminar ya resulta cómodo."],
  bici_progresiva: ["Bicicleta progresiva", "20–45 min en llano o estática. Evita MTB, baches y postura muy flexionada al principio."],
  movilidad_cadera: ["Movilidad suave de cadera", "30–40 s por lado, de pie y con apoyo. Rango pequeño, sin flexionar ni girar profundamente la columna."],
  flexor_cadera: ["Flexor de cadera", "20–30 s por lado en zancada corta, pelvis ligeramente hacia dentro y sin arquear la zona lumbar."],
  gemelo_pared: ["Gemelo en pared", "20–30 s por lado, tronco erguido y talón apoyado. Omítelo si aumenta el hormigueo del pie."],
  respiracion_descarga: ["Respiración y descarga", "1–2 min tumbado, con rodillas flexionadas y pies apoyados. Sin forzar ninguna postura."],
  rutina_viaje: ["Rutina corta de viaje", "8–10 min: brace, bird-dog corto, puente si es práctico y movilidad suave. Levántate cada 45–60 min en trayectos largos."],
  turismo_vietnam: ["Actividad del viaje: turismo y marcha", "Camina según el itinerario y el semáforo S1, sin perseguir un número de pasos. Introduce pausas, alterna días exigentes y suaves, y usa mochila ligera o maleta con ruedas."],
  descanso_activo: ["Descanso o paseo breve", "Recuperación activa 15–20 min si apetece. Revisa cómo está el pie respecto al día anterior."],
  run_walk: ["Run/walk inicial", "5 min andando + 1 min trote/2 min marcha ×8. Sólo tras cumplir los criterios funcionales y en días no consecutivos."],
  running_progresivo: ["Running progresivo", "Progresa de 2/2 a 3/1 y luego 5/1, sin aumentar también el ritmo. Retrocede si aparecen síntomas distales."],
  tenis_inicial: ["Tenis: peloteo", "15–20 min, sin partido ni desplazamientos máximos. Preferible dobles al principio."],
  tenis_progresivo: ["Tenis progresivo", "30–60 min. Aumenta por etapas y deja los partidos competitivos para cuando no haya respuesta al día siguiente."]
};

const PHASES = {
  1: {name:"Fase 1 · proteger S1 y valorar", cls:"p1", warn:"Sin running, tenis, saltos, cargas pesadas ni estiramiento neural. Solicita exploración presencial de S1.",
      week:[["brace","puente_corto","bird_dog_corto","sentarse_levantarse","clamshell","talones_bilateral"], ["caminar_20"], ["piscina_suave"], ["brace","puente_corto","bird_dog_corto","sentarse_levantarse","clamshell","talones_bilateral"], ["caminar_20"], ["piscina_suave"], ["descanso_activo"]]},
  2: {name:"Fase 2 · preparar marcha y viaje", cls:"p2", warn:"Avanza sólo con fuerza conservada y pie estable. Si está amarillo, reduce; si está rojo, para y consulta.",
      week:[["brace","puente_corto","bird_dog_corto","sentarse_levantarse","clamshell","dead_bug_apoyado","plancha_lateral_rodillas"], ["caminar_40"], ["piscina_suave"], ["brace","puente_corto","bird_dog_corto","sentarse_levantarse","clamshell","dead_bug_apoyado","plancha_lateral_rodillas"], ["caminar_60"], ["bici_15"], ["descanso_activo"]]},
  3: {name:"Fase 3 · viaje y mantenimiento", cls:"p3", warn:"El turismo ya cuenta como entrenamiento. Alterna días exigentes y suaves; mochila ligera y maleta con ruedas.",
      week:[["rutina_viaje","turismo_vietnam"], ["turismo_vietnam"], ["rutina_viaje","turismo_vietnam"], ["turismo_vietnam"], ["rutina_viaje","turismo_vietnam"], ["turismo_vietnam"], ["turismo_vietnam"]]},
  4: {name:"Fase 4 · fuerza y resistencia", cls:"p4", warn:"No aumentes duración y resistencia a la vez. Cualquier empeoramiento neurológico bloquea la progresión.",
      week:[["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["piscina_progresiva"], ["bici_progresiva"], ["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["piscina_progresiva"], ["caminar_60"], ["descanso_activo"]]},
  5: {name:"Fase 5 · retorno al deporte", cls:"p5", warn:"Running y tenis sólo tras 60 min caminando, fuerza simétrica y ausencia de empeoramiento durante 24 h.",
      week:[["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["run_walk"], ["piscina_progresiva"], ["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["bici_progresiva"], ["tenis_inicial"], ["descanso_activo"]]},
  6: {name:"Fase 6 · normalización", cls:"p5", warn:"Mantén el semáforo: una fecha nunca obliga a progresar si el nervio no está preparado.",
      week:[["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["piscina_progresiva"], ["running_progresivo"], ["sentadilla","zancada_corta","hip_thrust","bird_dog_completo","dead_bug","plancha_lateral_rodillas","plancha_frontal"], ["bici_progresiva"], ["tenis_progresivo"], ["descanso_activo"]]}
};

const PHASE_RANGES = [
  {phase:1, start:0,  end:4},
  {phase:2, start:5,  end:26},
  {phase:3, start:27, end:44},
  {phase:4, start:45, end:68},
  {phase:5, start:69, end:98},
  {phase:6, start:99, end:129}
];

const START = new Date(2026,7,24);
const END = new Date(2026,11,31);
const TOTAL_DAYS = Math.round((END-START)/86400000)+1;
const TODAY = new Date();
TODAY.setHours(0,0,0,0);

function fmtDate(d){
  const dias=["dom","lun","mar","mié","jué","vié","sáb"];
  const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}
function isSameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function localDateKey(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function dailyMobilityIds(baseExIds){
  if(baseExIds.includes('descanso_activo')) return [];
  const result=['respiracion_descarga'];
  const strengthIds=['brace','puente_corto','bird_dog_corto','sentarse_levantarse','clamshell','talones_bilateral','dead_bug_apoyado','plancha_lateral_rodillas','sentadilla','zancada_corta','hip_thrust','bird_dog_completo','dead_bug','plancha_frontal','rutina_viaje'];
  const legActivityIds=['caminar_20','caminar_40','caminar_60','turismo_vietnam','bici_15','bici_progresiva','run_walk','running_progresivo','tenis_inicial','tenis_progresivo'];
  const hasStrength=baseExIds.some(id=>strengthIds.includes(id));
  const hasLegActivity=baseExIds.some(id=>legActivityIds.includes(id));
  const hasPool=baseExIds.some(id=>id==='piscina_suave'||id==='piscina_progresiva');
  if(hasStrength) result.push('movilidad_cadera','flexor_cadera');
  if(hasLegActivity) result.push('flexor_cadera','gemelo_pared');
  if(hasPool) result.push('flexor_cadera');
  return [...new Set(result)];
}

function buildWeekdays(){
  const days=[];
  for(let i=0;i<TOTAL_DAYS;i++){
    const date=new Date(START); date.setDate(START.getDate()+i);
    const dow=date.getDay();
    const range=PHASE_RANGES.find(r=>i>=r.start&&i<=r.end);
    if(!range) continue;
    const phase=PHASES[range.phase];
    const weekdayIndex=dow===0 ? 6 : dow-1; // lunes=0 ... domingo=6
    const baseExIds=phase.week[weekdayIndex];
    const exIds=[...baseExIds,...dailyMobilityIds(baseExIds)];
    days.push({index:i,date,phaseNum:range.phase,phase,exIds,key:localDateKey(date)});
  }
  return days;
}

const SYNC_META_KEY = 'lifepilot-sync-meta';
const ITEMIZED_DATA_KEYS = ['lumbar-plan-state', 'health-log', 'care-log', 'notes-log'];

function loadState(k){ try{return JSON.parse(localStorage.getItem(k)||'{}');}catch(e){return {};} }
function loadSyncMeta(){
  try {
    return JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}');
  } catch(e) {
    return {};
  }
}
function storeSyncMeta(meta){
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta)); } catch(e) {}
}
function markStateChanged(key, previousState, nextState){
  const meta = loadSyncMeta();
  const now = new Date().toISOString();
  meta.keyUpdatedAt = meta.keyUpdatedAt || {};
  meta.keyUpdatedAt[key] = now;
  if(ITEMIZED_DATA_KEYS.includes(key) && previousState && nextState &&
      typeof previousState === 'object' && typeof nextState === 'object') {
    meta.itemUpdatedAt = meta.itemUpdatedAt || {};
    meta.tombstones = meta.tombstones || {};
    meta.itemUpdatedAt[key] = meta.itemUpdatedAt[key] || {};
    meta.tombstones[key] = meta.tombstones[key] || {};
    const itemIds = new Set([...Object.keys(previousState), ...Object.keys(nextState)]);
    itemIds.forEach(itemId => {
      if(JSON.stringify(previousState[itemId]) === JSON.stringify(nextState[itemId])) return;
      meta.itemUpdatedAt[key][itemId] = now;
      if(Object.prototype.hasOwnProperty.call(nextState, itemId)) {
        delete meta.tombstones[key][itemId];
      } else {
        meta.tombstones[key][itemId] = now;
      }
    });
  }
  meta.updatedAt = now;
  meta.changeVersion = (meta.changeVersion || 0) + 1;
  meta.dirty = true;
  storeSyncMeta(meta);
  window.dispatchEvent(new CustomEvent('lifepilot:data-changed', { detail: { key } }));
}
function saveState(k,state,options={}){
  try {
    const previousState = loadState(k);
    localStorage.setItem(k, JSON.stringify(state));
    if(!options.fromSync) markStateChanged(k, previousState, state);
  } catch(e) {}
}

function groupByWeek(days){
  const weeks=[];
  let current=[];
  let currentMonday=null;
  days.forEach(d=>{
    const monday=new Date(d.date);
    monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
    const key=localDateKey(monday);
    if(key!==currentMonday){
      if(current.length) weeks.push(current);
      current=[]; currentMonday=key;
    }
    current.push(d);
  });
  if(current.length) weeks.push(current);
  return weeks;
}

function renderExercise(){
  const days=buildWeekdays();
  const weeks=groupByWeek(days);
  const weeksEl=document.getElementById('weeks');
  weeksEl.innerHTML='';
  let wnum=0;

  weeks.forEach(chunk=>{
    wnum++;
    const weekDiv=document.createElement('div');
    weekDiv.className='week';
    const containsToday=chunk.some(d=>isSameDay(d.date,TODAY));
    if(containsToday) weekDiv.classList.add('open');

    const head=document.createElement('div');
    head.className='week-head';
    head.innerHTML=`<span><span class="wtitle">Semana ${wnum}</span><span class="wsub">${fmtDate(chunk[0].date)} &ndash; ${fmtDate(chunk[chunk.length-1].date)}</span></span><i class="ti ti-chevron-down"></i>`;
    head.addEventListener('click',()=>weekDiv.classList.toggle('open'));
    weekDiv.appendChild(head);

    const body=document.createElement('div');
    body.className='week-body';

    chunk.forEach(d=>{
      const dayDiv=document.createElement('div');
      dayDiv.className='day'+(isSameDay(d.date,TODAY)?' today':'');
      const headRow=document.createElement('div');
      headRow.className='day-head';
      headRow.innerHTML=`<span class="day-date">${fmtDate(d.date)}</span><span class="phase-tag ${d.phase.cls}">${d.phase.name}</span>`;
      dayDiv.appendChild(headRow);

      d.exIds.forEach(exId=>{
        const [name,detail]=EXERCISES[exId];
        const exKey=`${d.key}_${exId}`;
        const state=loadState('lumbar-plan-state');
        const isDone=!!state[exKey];
        const row=document.createElement('div');
        row.className='ex'+(isDone?' done':'');
        const cbId=`cb_${exKey}`;
        row.innerHTML=`<input type="checkbox" id="${cbId}" ${isDone?'checked':''}>
          <label for="${cbId}"><span class="exname">${name}</span><span class="exdetail">${detail}</span></label>`;
        const cb=row.querySelector('input');
        cb.addEventListener('change',()=>{
          const st=loadState('lumbar-plan-state');
          if(cb.checked) st[exKey]=true; else delete st[exKey];
          saveState('lumbar-plan-state',st);
          row.classList.toggle('done',cb.checked);
          updateExProgress();
        });
        dayDiv.appendChild(row);
      });

      {
        const stretchKey=`${d.key}_revision_s1`;
        const state=loadState('lumbar-plan-state');
        const isDone=!!state[stretchKey];
        const row=document.createElement('div');
        row.className='ex'+(isDone?' done':'');
        const cbId=`cb_${stretchKey}`;
        row.innerHTML=`<input type="checkbox" id="${cbId}" ${isDone?'checked':''}>
          <label for="${cbId}"><span class="exname">Revisión S1 a las 24 h</span><span class="exdetail">Compara hormigueo, adormecimiento y fuerza con el día anterior; registra el semáforo en Seguimiento diario.</span></label>`;
        const cb=row.querySelector('input');
        cb.addEventListener('change',()=>{
          const st=loadState('lumbar-plan-state');
          if(cb.checked) st[stretchKey]=true; else delete st[stretchKey];
          saveState('lumbar-plan-state',st);
          row.classList.toggle('done',cb.checked);
          updateExProgress();
        });
        dayDiv.appendChild(row);
      }

      if(d.phase.warn){
        const warn=document.createElement('p');
        warn.className='warn';
        const icon = d.phaseNum===1 ? 'ti-ban' : 'ti-alert-triangle';
        warn.innerHTML=`<i class="ti ${icon}"></i>${d.phase.warn}`;
        dayDiv.appendChild(warn);
      }

      body.appendChild(dayDiv);
    });

    weekDiv.appendChild(body);
    weeksEl.appendChild(weekDiv);
  });

  updateExProgress();
}

function updateExProgress(){
  let total=0, done=0;
  document.querySelectorAll('#weeks .ex input').forEach(cb=>{
    total++; if(cb.checked) done++;
  });
  document.getElementById('progress-text').textContent=`${done} / ${total}`;
}

document.getElementById('reset-btn').addEventListener('click',()=>{
  if(confirm('¿Borrar todas las marcas de progreso de ejercicio?')){
    saveState('lumbar-plan-state', {});
    renderExercise();
  }
});

/* ---------- DIETA ---------- */
const DEFAULT_DIET_MENU = [
  { day: "Día 1 · Lunes", breakfast: "Yogur natural, avena, manzana y canela", lunch: "Lentejas guisadas con verduras, huevo cocido y fruta", lunchWith: "Con tu hijo · 2 personas", dinner: "Merluza al horno con patata y judías verdes", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 2 · Martes", breakfast: "Tostada integral con tomate, AOVE y queso fresco", lunch: "Fajitas de pollo, pimientos y cebolla con tortillas integrales", lunchWith: "Con tu hijo · 2 personas", dinner: "Crema de calabacín y tortilla de espinacas", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 3 · Miércoles", breakfast: "Porridge de avena con plátano y nueces sin sal", lunch: "Pasta integral con atún, tomate natural, espinacas y ensalada", lunchWith: "Con tu hijo · 2 personas", dinner: "Salmón al horno con brócoli y quinoa", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 4 · Jueves", breakfast: "Huevos revueltos, tostada integral y una naranja", lunch: "Garbanzos con espinacas, bacalao y fruta", lunchWith: "Con tu hijo · 2 personas", dinner: "Albóndigas de pavo en tomate casero con verduras asadas", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 5 · Viernes", breakfast: "Yogur natural con pera, semillas y copos de avena", lunch: "Arroz integral salteado con pollo y verduras", lunchWith: "Con tu hijo · 2 personas", dinner: "Pizza casera integral de verduras y mozzarella con ensalada", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 6 · Sábado", breakfast: "Tostada integral con aguacate, huevo y tomate", lunch: "Dorada al horno con patata, cebolla y ensalada", lunchWith: "Con tu pareja · 2 personas", dinner: "Crema de calabaza con salteado de setas y huevo", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 7 · Domingo", breakfast: "Yogur natural con frutos rojos y almendras sin sal", lunch: "Arroz con verduras y marisco, acompañado de ensalada", lunchWith: "Con tu pareja · 2 personas", dinner: "Ensalada templada de garbanzos, pimiento, calabacín y queso fresco", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 8 · Lunes", breakfast: "Tostada integral con crema de cacahuete sin azúcar y plátano", lunch: "Alubias blancas con verduras y arroz integral", lunchWith: "Con tu hijo · 2 personas", dinner: "Bacalao con pisto casero y patata cocida", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 9 · Martes", breakfast: "Yogur natural, muesli sin azúcar y kiwi", lunch: "Cuscús integral con pavo, calabacín, zanahoria y garbanzos", lunchWith: "Con tu hijo · 2 personas", dinner: "Pimientos rellenos de atún, huevo y verduras", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 10 · Miércoles", breakfast: "Tortilla francesa, pan integral y fruta de temporada", lunch: "Ternera magra guisada con patata, zanahoria y guisantes", lunchWith: "Con tu hijo · 2 personas", dinner: "Pollo a la plancha con ensalada completa de aguacate y maíz", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 11 · Jueves", breakfast: "Avena nocturna con yogur, melocotón y canela", lunch: "Bol de salmón, arroz, pepino, zanahoria y edamame", lunchWith: "Con tu hijo · 2 personas", dinner: "Sopa de verduras y tortilla de calabacín", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 12 · Viernes", breakfast: "Tostada integral con hummus, tomate y fruta", lunch: "Espaguetis integrales con boloñesa de lentejas y carne magra", lunchWith: "Con tu hijo · 2 personas", dinner: "Hamburguesa casera de pavo con verduras asadas y pan integral opcional", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 13 · Sábado", breakfast: "Yogur natural con plátano, cacao puro y avellanas", lunch: "Pollo asado con boniato y ensalada de col casera", lunchWith: "Con tu pareja · 2 personas", dinner: "Tacos de pescado con col, tomate y salsa de yogur", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 14 · Domingo", breakfast: "Pan integral con ricota, pera y canela", lunch: "Lasaña de verduras y carne magra con ensalada", lunchWith: "Con tu pareja · 2 personas", dinner: "Crema de lentejas rojas con verduras y yogur natural", dinnerWith: "Con tu pareja · 2 personas" },
  { day: "Día 15 · Lunes", breakfast: "Yogur natural con avena, piña y semillas", lunch: "Curry suave de garbanzos y verduras con arroz basmati", lunchWith: "Con tu hijo · 2 personas", dinner: "Merluza en papillote con verduras y patata pequeña", dinnerWith: "Con tu pareja · 2 personas" }
];
const DIET_PLAN_VERSION = 'family-15-v1';
let DIET_MENU = loadState('cfg-diet');
if(localStorage.getItem('cfg-diet-version') !== DIET_PLAN_VERSION || !Array.isArray(DIET_MENU) || DIET_MENU.length !== 15) {
  DIET_MENU = DEFAULT_DIET_MENU;
  saveState('cfg-diet', DIET_MENU, { fromSync: true });
  localStorage.setItem('cfg-diet-version', DIET_PLAN_VERSION);
}

function renderDiet(){
  const tbody = document.getElementById('diet-menu-body');
  if(tbody) {
    tbody.innerHTML = DIET_MENU.map(d => `<tr><td>${d.day}</td><td>${d.breakfast}</td><td>${d.lunch}<span class="meal-for">${d.lunchWith || ''}</span></td><td>${d.dinner}<span class="meal-for">${d.dinnerWith || ''}</span></td></tr>`).join('');
  }
}

/* ---------- ESTIRAMIENTOS ---------- */
const DEFAULT_STRETCHES = [
  ["Movilidad suave de cadera", "De pie y con apoyo, mueve cada cadera en un rango pequeño y cómodo durante 30–40 segundos. Sin flexionar ni girar profundamente la columna."],
  ["Flexor de cadera", "Zancada corta, pelvis ligeramente hacia dentro. 20–30 segundos por lado, sin arquear la zona lumbar."],
  ["Gemelo en pared", "Pierna atrás, talón apoyado y tronco erguido. 20–30 segundos por lado. Elimínalo si reproduce hormigueo en el pie."],
  ["Respiración y descarga", "Tumbado con rodillas flexionadas y pies apoyados, respira lentamente durante 1–2 minutos sin forzar ninguna postura."]
];
const STRETCH_PLAN_VERSION = 's1-v2';
let STRETCHES = loadState('cfg-stretches');
if(localStorage.getItem('cfg-stretches-version') !== STRETCH_PLAN_VERSION || !Array.isArray(STRETCHES) || STRETCHES.length === 0) {
  STRETCHES = DEFAULT_STRETCHES;
  saveState('cfg-stretches', STRETCHES, { fromSync: true });
  localStorage.setItem('cfg-stretches-version', STRETCH_PLAN_VERSION);
}

function renderStretches(){
  const el=document.getElementById('stretch-list');
  el.innerHTML=STRETCHES.map(([name,detail])=>
    `<div class="ex"><div><span class="exname">${name}</span><span class="exdetail">${detail}</span></div></div>`
  ).join('');
}

/* ---------- SEGUIMIENTO DIARIO ---------- */
function todayStr(){ return localDateKey(new Date()); }
function fmtDateStr(s){
  const [y,m,d]=s.split('-').map(Number);
  const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${meses[m-1]} ${y}`;
}

function renderHealth(){
  document.getElementById('h-fecha').value = document.getElementById('h-fecha').value || todayStr();
  const hist = document.getElementById('health-hist');
  const data = loadState('health-log');
  const dates = Object.keys(data).sort().reverse();
  if(!dates.length){ hist.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Todavía no hay registros.</p>'; return; }
  let html = '<div class="table-scroll"><table class="hist"><tr><th>Fecha</th><th>Peso</th><th>TA</th><th>Pulso</th><th>Sueño</th><th>Agua</th><th>Dolor</th><th>Parestesia</th><th>24 h</th><th>Alertas</th><th>Dieta</th><th>Medic.</th><th></th></tr>';
  dates.forEach(dt=>{
    const r=data[dt];
    const alerts = [r.adormecimiento?'Adormecimiento':'', r.debilidad?'Debilidad':''].filter(Boolean).join(' · ');
    const traffic = r.semaforo ? `<span class="status-dot ${r.semaforo}">${r.semaforo}</span>` : '';
    const dietMark = r.dieta === true ? '<i class="ti ti-check"></i>' : (r.dieta === false ? '<i class="ti ti-minus"></i>' : '');
    html += `<tr><td>${fmtDateStr(dt)}</td><td>${r.peso??''}</td><td>${(r.tasis||r.tadia)?(r.tasis||'')+'/'+(r.tadia||''):''}</td><td>${r.pulso??''}</td><td>${r.sueno??''}</td><td>${r.agua??''}</td><td>${r.dolor??''}</td><td>${r.parestesia??''}</td><td>${traffic}</td><td class="alert-cell">${alerts}</td><td>${dietMark}</td><td>${r.medicacion?'<i class="ti ti-check"></i>':''}</td><td><button class="del-btn" data-del="${dt}"><i class="ti ti-trash"></i></button></td></tr>`;
  });
  html += '</table></div>';
  hist.innerHTML = html;
  hist.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const st=loadState('health-log'); delete st[btn.dataset.del]; saveState('health-log',st); renderHealth();
    });
  });
}
document.getElementById('h-save').addEventListener('click',()=>{
  const fecha = document.getElementById('h-fecha').value || todayStr();
  const st = loadState('health-log');
  const entry = {
    peso: document.getElementById('h-peso').value || null,
    tasis: document.getElementById('h-tasis').value || null,
    tadia: document.getElementById('h-tadia').value || null,
    pulso: document.getElementById('h-pulso').value || null,
    sueno: document.getElementById('h-sueno').value || null,
    agua: document.getElementById('h-agua').value || null,
    dolor: document.getElementById('h-dolor').value || null,
    parestesia: document.getElementById('h-parestesia').value,
    semaforo: document.getElementById('h-semaforo').value,
    adormecimiento: document.getElementById('h-adormecimiento').checked,
    debilidad: document.getElementById('h-debilidad').checked,
    dieta: document.getElementById('h-dieta').checked,
    medicacion: document.getElementById('h-medicacion').checked
  };
  if(entry.parestesia === '3' || entry.adormecimiento || entry.debilidad) entry.semaforo = 'rojo';
  st[fecha] = entry;
  saveState('health-log', st);
  renderHealth();
  if(entry.debilidad || entry.adormecimiento || entry.semaforo === 'rojo') {
    showAlert('Has registrado una señal roja. No progreses el ejercicio y solicita valoración sanitaria. Si hay alteraciones de esfínteres, anestesia perineal, síntomas en ambas piernas o debilidad rápidamente progresiva, acude a urgencias.');
  } else if(entry.semaforo === 'amarillo') {
    showAlert('Respuesta amarilla registrada: reduce el volumen un 25–50% durante 2–3 días y no aumentes cargas hasta volver a verde.');
  }
});

/* ---------- CUIDADO PERSONAL ---------- */
const DEFAULT_CARE_ITEMS = [
  ["dientes_manana","Cepillado de dientes (mañana)"],
  ["dientes_noche","Cepillado de dientes (noche)"],
  ["crema_facial","Crema facial"],
  ["hidratante_corporal","Hidratante corporal"],
  ["afeitado","Afeitado / cuidado de barba"],
  ["unas","Corte o cuidado de uñas"],
  ["proteccion_solar","Protección solar"]
];
let CARE_ITEMS = loadState('cfg-care');
if(!Array.isArray(CARE_ITEMS) || CARE_ITEMS.length === 0) CARE_ITEMS = DEFAULT_CARE_ITEMS;

function renderCareChecklist(fecha){
  const data = loadState('care-log');
  const entry = data[fecha] || {};
  const el = document.getElementById('care-checklist');
  el.innerHTML = CARE_ITEMS.map(([id,label])=>
    `<div class="chk-row"><input type="checkbox" id="care_${id}" ${entry[id]?'checked':''}><label for="care_${id}">${label}</label></div>`
  ).join('');
}
function renderCareHist(){
  const hist = document.getElementById('care-hist');
  const data = loadState('care-log');
  const dates = Object.keys(data).sort().reverse();
  if(!dates.length){ hist.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Todavía no hay registros.</p>'; return; }
  let html = '<div class="table-scroll"><table class="hist"><tr><th>Fecha</th><th>Completado</th><th></th></tr>';
  dates.forEach(dt=>{
    const entry = data[dt];
    const done = CARE_ITEMS.filter(([id])=>entry[id]).length;
    html += `<tr><td>${fmtDateStr(dt)}</td><td>${done} / ${CARE_ITEMS.length}</td><td><button class="del-btn" data-del="${dt}"><i class="ti ti-trash"></i></button></td></tr>`;
  });
  html += '</table></div>';
  hist.innerHTML = html;
  hist.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const st=loadState('care-log'); delete st[btn.dataset.del]; saveState('care-log',st); renderCareHist();
    });
  });
}
function renderCare(){
  const fechaInput = document.getElementById('c-fecha');
  fechaInput.value = fechaInput.value || todayStr();
  renderCareChecklist(fechaInput.value);
  renderCareHist();
}
document.getElementById('c-fecha').addEventListener('change',()=>{
  renderCareChecklist(document.getElementById('c-fecha').value);
});
document.getElementById('c-save').addEventListener('click',()=>{
  const fecha = document.getElementById('c-fecha').value || todayStr();
  const st = loadState('care-log');
  const entry = {};
  CARE_ITEMS.forEach(([id])=>{ entry[id] = document.getElementById(`care_${id}`).checked; });
  st[fecha] = entry;
  saveState('care-log', st);
  renderCareHist();
});

/* ---------- NOTAS ---------- */
function renderNotesHist(){
  const hist = document.getElementById('notes-hist');
  const data = loadState('notes-log');
  const dates = Object.keys(data).sort().reverse();
  if(!dates.length){ hist.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Todavía no hay notas.</p>'; return; }
  hist.innerHTML = dates.map(dt=>
    `<div class="note-entry"><div class="note-date"><span>${fmtDateStr(dt)}</span><button class="del-btn" data-del="${dt}"><i class="ti ti-trash"></i></button></div><div class="note-text">${(data[dt]||'').replace(/</g,'&lt;')}</div></div>`
  ).join('');
  hist.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const st=loadState('notes-log'); delete st[btn.dataset.del]; saveState('notes-log',st); renderNotesHist();
    });
  });
}
function renderNotes(){
  document.getElementById('n-fecha').value = document.getElementById('n-fecha').value || todayStr();
  renderNotesHist();
}
document.getElementById('n-save').addEventListener('click',()=>{
  const fecha = document.getElementById('n-fecha').value || todayStr();
  const texto = document.getElementById('n-texto').value.trim();
  if(!texto) return;
  const st = loadState('notes-log');
  st[fecha] = texto;
  saveState('notes-log', st);
  document.getElementById('n-texto').value='';
  renderNotesHist();
});

/* ---------- SINCRONIZAR ENTRE DISPOSITIVOS ---------- */
const DATA_KEYS = [
  'lumbar-plan-state', 'health-log', 'care-log', 'notes-log',
  'cfg-diet', 'cfg-stretches', 'cfg-care'
];

// Funciones de exportación locales eliminadas en favor de Dropbox

/* ---------- ESTADISTICAS ---------- */
let charts = {};
function initOrUpdateChart(id, config) {
  const ctx = document.getElementById(id);
  if(!ctx) return;
  if(charts[id]) charts[id].destroy();
  charts[id] = new Chart(ctx, config);
}

function renderEstadisticas() {
  const filterVal = document.getElementById('chart-filter') ? document.getElementById('chart-filter').value : '30';
  const healthData = loadState('health-log');
  const dates = Object.keys(healthData).sort((a,b) => new Date(a) - new Date(b));
  
  let recentDates = dates;
  if (filterVal !== 'all') {
    recentDates = dates.slice(-parseInt(filterVal, 10));
  }
  
  const labels = recentDates.map(d => d.slice(8,10)+'/'+d.slice(5,7));
  const pesos = recentDates.map(d => healthData[d].peso || null);
  const dolores = recentDates.map(d => healthData[d].dolor || null);
  const parestesias = recentDates.map(d => healthData[d].parestesia ?? null);
  const tasis = recentDates.map(d => healthData[d].tasis || null);
  const tadia = recentDates.map(d => healthData[d].tadia || null);
  const sueno = recentDates.map(d => healthData[d].sueno || null);
  const agua = recentDates.map(d => healthData[d].agua || null);

  initOrUpdateChart('chart-peso-dolor', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Peso (kg)', data: pesos, borderColor: '#0f6e56', backgroundColor: '#0f6e56', yAxisID: 'y', spanGaps: true },
        { label: 'Dolor (0-10)', data: dolores, borderColor: '#a32d2d', backgroundColor: '#a32d2d', borderDash: [5, 5], yAxisID: 'y1', spanGaps: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { type: 'linear', display: true, position: 'left', title: {display:true, text:'Peso (kg)'} },
        y1: { type: 'linear', display: true, position: 'right', min: 0, max: 10, title: {display:true, text:'Dolor'} }
      }
    }
  });

  initOrUpdateChart('chart-parestesia', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Parestesia S1 (0 ninguna · 3 constante)',
        data: parestesias,
        borderColor: '#d97706',
        backgroundColor: 'rgba(217,119,6,.15)',
        fill: true,
        tension: .2,
        spanGaps: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { min: 0, max: 3, ticks: { stepSize: 1 } } }
    }
  });

  initOrUpdateChart('chart-tension', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Sistólica', data: tasis, borderColor: '#d4537e', backgroundColor: '#d4537e', spanGaps: true },
        { label: 'Diastólica', data: tadia, borderColor: '#85b7eb', backgroundColor: '#85b7eb', spanGaps: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  initOrUpdateChart('chart-habitos', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Sueño (h)', data: sueno, backgroundColor: '#fac775' },
        { label: 'Agua (vasos)', data: agua, backgroundColor: '#85b7eb' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const dietEntries = recentDates.map(d => healthData[d]).filter(entry => typeof entry.dieta === 'boolean');
  const dietDone = dietEntries.filter(entry => entry.dieta).length;
  const dietMissed = dietEntries.length - dietDone;
  const dietPct = dietEntries.length ? Math.round((dietDone / dietEntries.length) * 100) : 0;
  initOrUpdateChart('chart-dieta-cumplimiento', {
    type: 'doughnut',
    data: {
      labels: ['Seguido', 'No seguido'],
      datasets: [{ data: [dietDone, dietMissed], backgroundColor: ['#0f6e56', '#e0e0e0'] }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: dietPct + '% de adherencia' } }
    }
  });

  // Calculate Exercise Compliance
  let totalEx = 0;
  let doneEx = 0;
  const days = buildWeekdays();
  const stEx = loadState('lumbar-plan-state');
  for (const d of days) {
    if (d.date > TODAY) break; // Only count up to today
    d.exIds.forEach(exId => {
      totalEx++;
      if (stEx[`${d.key}_${exId}`]) doneEx++;
    });
    totalEx++; // Revisión neurológica a las 24 h
    if (stEx[`${d.key}_revision_s1`]) doneEx++;
  }
  const pctEx = totalEx === 0 ? 0 : Math.round((doneEx/totalEx)*100);

  initOrUpdateChart('chart-ejercicio-cumplimiento', {
    type: 'doughnut',
    data: {
      labels: ['Completado', 'Pendiente'],
      datasets: [{
        data: [doneEx, Math.max(0, totalEx - doneEx)],
        backgroundColor: ['#0f6e56', '#e0e0e0']
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: pctEx + '% de Cumplimiento' } }
    }
  });

}

/* ---------- TABS ---------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tabpanel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'estadisticas') renderEstadisticas();
  });
});

document.getElementById('chart-filter').addEventListener('change', renderEstadisticas);

renderExercise();
renderDiet();
renderStretches();
renderHealth();
renderCare();
renderNotes();
renderEstadisticas();

/* ---------- DROPBOX SYNC ---------- */
const CLIENT_ID = 'tn0qzpzapx2b1mw';
const DROPBOX_FILE = '/plan_lumbar_datos.json';
const DROPBOX_SESSION_KEY = 'lifepilot-dropbox-session';
const DROPBOX_PKCE_KEY = 'lifepilot-dropbox-pkce';
const DROPBOX_AUTO_ATTEMPT_KEY = 'lifepilot-dropbox-auto-attempt';
const DROPBOX_AUTO_RETRY_DELAY = 120000;
const AUTO_SYNC_DELAY = 3000;
let dbx = null;
let syncTimer = null;
let syncInProgress = false;
let syncPending = false;

function setSyncStatus(kind, text) {
  const el = document.getElementById('dbx-sync-status');
  const icons = {
    disconnected: 'ti-cloud-off', connecting: 'ti-loader-2', syncing: 'ti-refresh',
    synced: 'ti-cloud-check', offline: 'ti-wifi-off', conflict: 'ti-arrows-exchange', error: 'ti-alert-circle'
  };
  el.className = `sync-status ${kind}`;
  el.innerHTML = `<i class="ti ${icons[kind] || 'ti-cloud'}"></i> ${text}`;
}

function setDropboxConnected(connected) {
  document.getElementById('dbx-login-btn').style.display = connected ? 'none' : 'inline-block';
  document.getElementById('dbx-load-btn').style.display = connected ? 'inline-block' : 'none';
  document.getElementById('dbx-save-btn').style.display = connected ? 'inline-block' : 'none';
  if(!connected) setSyncStatus('disconnected', 'Sin conectar');
}

function ensureSyncMetadata() {
  const meta = loadSyncMeta();
  const now = new Date().toISOString();
  meta.keyUpdatedAt = meta.keyUpdatedAt || {};
  meta.itemUpdatedAt = meta.itemUpdatedAt || {};
  meta.tombstones = meta.tombstones || {};
  let migrated = false;
  DATA_KEYS.forEach(key => {
    const value = loadState(key);
    const isDefaultConfig =
      (key === 'cfg-diet' && JSON.stringify(value) === JSON.stringify(DEFAULT_DIET_MENU)) ||
      (key === 'cfg-stretches' && JSON.stringify(value) === JSON.stringify(DEFAULT_STRETCHES)) ||
      (key === 'cfg-care' && JSON.stringify(value) === JSON.stringify(DEFAULT_CARE_ITEMS));
    if(localStorage.getItem(key) !== null && !meta.keyUpdatedAt[key] && !isDefaultConfig) {
      meta.keyUpdatedAt[key] = now;
      migrated = true;
    }
    if(ITEMIZED_DATA_KEYS.includes(key)) {
      meta.itemUpdatedAt[key] = meta.itemUpdatedAt[key] || {};
      meta.tombstones[key] = meta.tombstones[key] || {};
      if(value && typeof value === 'object') {
        Object.keys(value).forEach(itemId => {
          if(!meta.itemUpdatedAt[key][itemId]) {
            meta.itemUpdatedAt[key][itemId] = meta.keyUpdatedAt[key] || now;
            migrated = true;
          }
        });
      }
    }
  });
  if(!meta.deviceId) {
    meta.deviceId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    migrated = true;
  }
  if(migrated) {
    meta.updatedAt = now;
    meta.dirty = true;
    storeSyncMeta(meta);
  }
}

function hasData(value) {
  if(Array.isArray(value)) return value.length > 0;
  if(value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== '';
}

function reloadSyncedUI() {
  const storedDiet = loadState('cfg-diet');
  const storedStretches = loadState('cfg-stretches');
  const storedCare = loadState('cfg-care');
  if(Array.isArray(storedDiet) && storedDiet.length) DIET_MENU = storedDiet;
  if(Array.isArray(storedStretches) && storedStretches.length) STRETCHES = storedStretches;
  if(Array.isArray(storedCare)) CARE_ITEMS = storedCare;
  renderExercise(); renderDiet(); renderStretches(); renderHealth(); renderCare(); renderNotes(); renderEstadisticas();
}

function makeSyncBundle() {
  const meta = loadSyncMeta();
  const data = {};
  DATA_KEYS.forEach(key => { data[key] = loadState(key); });
  return {
    schemaVersion: 2,
    app: 'Life Pilot',
    updatedAt: meta.updatedAt || new Date().toISOString(),
    deviceId: meta.deviceId,
    changeVersion: meta.changeVersion || 0,
    keyUpdatedAt: meta.keyUpdatedAt || {},
    itemUpdatedAt: meta.itemUpdatedAt || {},
    tombstones: meta.tombstones || {},
    data
  };
}

function readBlobAsText(blob) {
  if(blob && typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function applyRemoteBundle(bundle, remoteRevision, remoteModified) {
  const remoteData = bundle.data && typeof bundle.data === 'object' ? bundle.data : bundle;
  const remoteTimes = bundle.keyUpdatedAt || {};
  const remoteItemTimes = bundle.itemUpdatedAt || {};
  const remoteTombstones = bundle.tombstones || {};
  const remoteFallback = bundle.updatedAt || bundle._exportado || remoteModified || '';
  const meta = loadSyncMeta();
  meta.keyUpdatedAt = meta.keyUpdatedAt || {};
  meta.itemUpdatedAt = meta.itemUpdatedAt || {};
  meta.tombstones = meta.tombstones || {};
  let needsUpload = false;
  let changedLocal = false;

  DATA_KEYS.forEach(key => {
    const hasRemoteKey = Object.prototype.hasOwnProperty.call(remoteData, key);
    const localValue = loadState(key);
    const remoteValue = remoteData[key];
    const localTime = meta.keyUpdatedAt[key] || '';
    const remoteTime = remoteTimes[key] || remoteFallback;

    if(!hasRemoteKey) {
      if(hasData(localValue)) needsUpload = true;
      return;
    }

    if(ITEMIZED_DATA_KEYS.includes(key) && localValue && remoteValue &&
        typeof localValue === 'object' && typeof remoteValue === 'object') {
      const merged = { ...localValue };
      const localItemTimes = meta.itemUpdatedAt[key] || {};
      const localTombstones = meta.tombstones[key] || {};
      const incomingItemTimes = remoteItemTimes[key] || {};
      const incomingTombstones = remoteTombstones[key] || {};
      const itemIds = new Set([
        ...Object.keys(localValue), ...Object.keys(remoteValue),
        ...Object.keys(localTombstones), ...Object.keys(incomingTombstones)
      ]);

      itemIds.forEach(itemId => {
        const localPresent = Object.prototype.hasOwnProperty.call(localValue, itemId);
        const remotePresent = Object.prototype.hasOwnProperty.call(remoteValue, itemId);
        const localDeletedAt = localTombstones[itemId] || '';
        const remoteDeletedAt = incomingTombstones[itemId] || '';
        const localItemTime = localItemTimes[itemId] || localDeletedAt || (localPresent ? localTime : '');
        const remoteItemTime = incomingItemTimes[itemId] || remoteDeletedAt || (remotePresent ? remoteTime : '');
        const sameItem = localPresent === remotePresent &&
          (!localPresent || JSON.stringify(localValue[itemId]) === JSON.stringify(remoteValue[itemId])) &&
          Boolean(localDeletedAt) === Boolean(remoteDeletedAt);

        if(remoteItemTime && (!localItemTime || remoteItemTime > localItemTime)) {
          if(remotePresent && !remoteDeletedAt) {
            merged[itemId] = remoteValue[itemId];
            delete localTombstones[itemId];
          } else {
            delete merged[itemId];
            localTombstones[itemId] = remoteDeletedAt || remoteItemTime;
          }
          localItemTimes[itemId] = remoteItemTime;
          changedLocal = true;
        } else if(!sameItem) {
          needsUpload = true;
        }
      });

      if(changedLocal && JSON.stringify(merged) !== JSON.stringify(localValue)) {
        saveState(key, merged, { fromSync: true });
      }
      meta.itemUpdatedAt[key] = localItemTimes;
      meta.tombstones[key] = localTombstones;
      meta.keyUpdatedAt[key] = localTime > remoteTime ? localTime : remoteTime;
      return;
    }

    const remoteIsNewer = remoteTime && (!localTime || remoteTime > localTime);
    const localIsNewer = localTime && (!remoteTime || localTime > remoteTime);
    const sameData = JSON.stringify(localValue) === JSON.stringify(remoteValue);

    if(remoteIsNewer || (!localIsNewer && !sameData && !hasData(localValue))) {
      saveState(key, remoteValue, { fromSync: true });
      meta.keyUpdatedAt[key] = remoteTime || new Date().toISOString();
      changedLocal = true;
    } else if(!sameData) {
      needsUpload = true;
    }
  });

  meta.remoteRevision = remoteRevision || meta.remoteRevision || null;
  meta.remoteModified = remoteModified || meta.remoteModified || null;
  if(remoteFallback && (!meta.updatedAt || remoteFallback > meta.updatedAt)) meta.updatedAt = remoteFallback;
  meta.dirty = needsUpload;
  storeSyncMeta(meta);
  if(changedLocal) reloadSyncedUI();
  return needsUpload;
}

async function downloadAndMerge() {
  try {
    const response = await dbx.filesDownload({ path: DROPBOX_FILE });
    const result = response.result;
    const text = await readBlobAsText(result.fileBlob);
    const bundle = JSON.parse(text);
    return {
      exists: true,
      needsUpload: applyRemoteBundle(bundle, result.rev, result.server_modified)
    };
  } catch(err) {
    if(err.status === 409) {
      const meta = loadSyncMeta();
      meta.remoteRevision = null;
      meta.dirty = true;
      storeSyncMeta(meta);
      return { exists: false, needsUpload: true };
    }
    throw err;
  }
}

async function uploadBundle(retryOnConflict=true) {
  const bundle = makeSyncBundle();
  const meta = loadSyncMeta();
  const mode = meta.remoteRevision
    ? { '.tag': 'update', update: meta.remoteRevision }
    : { '.tag': 'add' };
  const file = new Blob([JSON.stringify(bundle)], { type: 'application/json' });

  try {
    const response = await dbx.filesUpload({
      path: DROPBOX_FILE,
      contents: file,
      mode,
      autorename: false,
      mute: true
    });
    const currentMeta = loadSyncMeta();
    currentMeta.remoteRevision = response.result.rev;
    currentMeta.remoteModified = response.result.server_modified;
    currentMeta.lastSyncAt = new Date().toISOString();
    currentMeta.dirty = (currentMeta.changeVersion || 0) !== bundle.changeVersion;
    storeSyncMeta(currentMeta);
  } catch(err) {
    if(err.status === 409 && retryOnConflict) {
      setSyncStatus('conflict', 'Resolviendo cambios de otro dispositivo…');
      await downloadAndMerge();
      return uploadBundle(false);
    }
    throw err;
  }
}

function clearDropboxSession() {
  sessionStorage.removeItem(DROPBOX_SESSION_KEY);
  dbx = null;
  setDropboxConnected(false);
}

function handleSyncError(err, notify) {
  console.error('Dropbox sync:', err);
  if(err && err.status === 401) {
    clearDropboxSession();
    setSyncStatus('error', 'Sesión caducada · vuelve a conectar');
    if(notify) showAlert('La sesión de Dropbox ha caducado. Vuelve a conectar la cuenta.');
    return;
  }
  setSyncStatus(navigator.onLine ? 'error' : 'offline', navigator.onLine ? 'No se pudo sincronizar' : 'Sin conexión · pendiente');
  if(notify) showAlert('No se pudo sincronizar con Dropbox. Los datos siguen guardados en este dispositivo.');
}

async function syncNow({ notify=false, uploadOnly=false }={}) {
  if(!dbx) return;
  if(!navigator.onLine) {
    setSyncStatus('offline', 'Sin conexión · pendiente');
    return;
  }
  if(syncInProgress) {
    syncPending = true;
    return;
  }

  syncInProgress = true;
  setSyncStatus('syncing', 'Sincronizando…');
  try {
    if(!uploadOnly) await downloadAndMerge();
    const meta = loadSyncMeta();
    if(uploadOnly || meta.dirty) await uploadBundle();
    setSyncStatus('synced', 'Guardado en Dropbox');
    if(notify) showAlert('Datos sincronizados con Dropbox correctamente.');
  } catch(err) {
    handleSyncError(err, notify);
  } finally {
    syncInProgress = false;
    if(syncPending) {
      syncPending = false;
      scheduleAutoSync(500);
    }
  }
}

function scheduleAutoSync(delay=AUTO_SYNC_DELAY) {
  if(!dbx) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncNow(), delay);
}

function createDropboxClient(accessToken, expiresAt) {
  const auth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });
  auth.setAccessToken(accessToken);
  if(expiresAt) auth.setAccessTokenExpiresAt(new Date(expiresAt));
  dbx = new Dropbox.Dropbox({ auth });
  setDropboxConnected(true);
}

function cleanOAuthParams() {
  const url = new URL(window.location.href);
  ['code', 'state', 'error', 'error_description'].forEach(key => url.searchParams.delete(key));
  history.replaceState(null, document.title, url.pathname + (url.search ? url.search : '') + url.hash);
}

async function connectDropbox({ automatic=false }={}) {
  if(window.location.protocol === 'file:') {
    if(!automatic) showAlert('Abre Life Pilot mediante http://localhost o desde Vercel para conectar Dropbox.');
    return;
  }
  setSyncStatus('connecting', automatic ? 'Conectando automáticamente…' : 'Abriendo Dropbox…');
  const auth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });
  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const state = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  try {
    const authUrl = await auth.getAuthenticationUrl(redirectUri, state, 'code', 'online', null, 'none', true);
    sessionStorage.setItem(DROPBOX_PKCE_KEY, JSON.stringify({
      verifier: auth.getCodeVerifier(), state, redirectUri
    }));
    sessionStorage.setItem(DROPBOX_AUTO_ATTEMPT_KEY, String(Date.now()));
    window.location.assign(authUrl);
  } catch(err) {
    handleSyncError(err, !automatic);
  }
}

async function tryAutomaticDropboxConnection() {
  if(dbx || !navigator.onLine || window.location.protocol === 'file:') return;
  const lastAttempt = Number(sessionStorage.getItem(DROPBOX_AUTO_ATTEMPT_KEY) || 0);
  if(lastAttempt && Date.now() - lastAttempt < DROPBOX_AUTO_RETRY_DELAY) {
    setDropboxConnected(false);
    return;
  }
  await connectDropbox({ automatic: true });
}

async function restoreDropboxSession() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const oauthError = params.get('error');
  const legacyParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const legacyToken = legacyParams.get('access_token');

  // Completa una autorización iniciada por la versión anterior y migra la sesión a PKCE en la próxima conexión.
  if(legacyToken) {
    const expiresIn = Number(legacyParams.get('expires_in')) || 14400;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    sessionStorage.setItem(DROPBOX_SESSION_KEY, JSON.stringify({ accessToken: legacyToken, expiresAt }));
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
    createDropboxClient(legacyToken, expiresAt);
    await syncNow();
    return;
  }

  if(oauthError) {
    const description = params.get('error_description') || 'No se autorizó el acceso a Dropbox.';
    cleanOAuthParams();
    setSyncStatus('error', 'Conexión cancelada');
    showAlert(description);
    return;
  }

  if(code) {
    setSyncStatus('connecting', 'Terminando conexión…');
    try {
      const saved = JSON.parse(sessionStorage.getItem(DROPBOX_PKCE_KEY) || '{}');
      if(!saved.verifier || !saved.redirectUri || saved.state !== params.get('state')) {
        throw new Error('No se pudo validar el inicio de sesión de Dropbox.');
      }
      const auth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });
      auth.setCodeVerifier(saved.verifier);
      const response = await auth.getAccessTokenFromCode(saved.redirectUri, code);
      const expiresAt = new Date(Date.now() + (response.result.expires_in || 14400) * 1000).toISOString();
      sessionStorage.setItem(DROPBOX_SESSION_KEY, JSON.stringify({
        accessToken: response.result.access_token,
        expiresAt
      }));
      sessionStorage.removeItem(DROPBOX_PKCE_KEY);
      cleanOAuthParams();
      createDropboxClient(response.result.access_token, expiresAt);
      await syncNow();
      return;
    } catch(err) {
      cleanOAuthParams();
      handleSyncError(err, true);
      return;
    }
  }

  try {
    const saved = JSON.parse(sessionStorage.getItem(DROPBOX_SESSION_KEY) || '{}');
    if(saved.accessToken && saved.expiresAt && new Date(saved.expiresAt).getTime() > Date.now() + 60000) {
      createDropboxClient(saved.accessToken, saved.expiresAt);
      await syncNow();
    } else {
      sessionStorage.removeItem(DROPBOX_SESSION_KEY);
      setDropboxConnected(false);
      await tryAutomaticDropboxConnection();
    }
  } catch(err) {
    clearDropboxSession();
    await tryAutomaticDropboxConnection();
  }
}

ensureSyncMetadata();
document.getElementById('dbx-login-btn').addEventListener('click', () => connectDropbox());
document.getElementById('dbx-load-btn').addEventListener('click', () => syncNow({ notify: true }));
document.getElementById('dbx-save-btn').addEventListener('click', () => syncNow({ notify: true, uploadOnly: true }));
window.addEventListener('lifepilot:data-changed', () => scheduleAutoSync());
window.addEventListener('online', () => {
  if(dbx) scheduleAutoSync(250);
  else tryAutomaticDropboxConnection();
});
window.addEventListener('offline', () => {
  if(dbx) setSyncStatus('offline', 'Sin conexión · pendiente');
});
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible') scheduleAutoSync(250);
});
restoreDropboxSession();
/* ---------- PWA INSTALL ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registrado', reg.scope);
    }).catch(err => console.log('SW registro falló', err));
  });
}
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.style.display = 'none';
    deferredPrompt = null;
  }
});
