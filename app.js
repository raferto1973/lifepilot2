/* ---------- CUSTOM MODALS ---------- */
function showAlert(msg) {
  const modal = document.getElementById('custom-modal');
  document.getElementById('modal-title').innerText = 'Life Pilot';
  document.getElementById('modal-body').innerHTML = `<p>${msg}</p>`;
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
        <input type="text" class="diet-d" value="${d.dinner}" placeholder="Cena">
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
  document.querySelectorAll('#settings-diet-list .settings-row').forEach(row => {
    newDiet.push({
      day: row.querySelector('strong').innerText,
      breakfast: row.querySelector('.diet-b').value,
      lunch: row.querySelector('.diet-l').value,
      dinner: row.querySelector('.diet-d').value
    });
  });
  DIET_MENU = newDiet;
  saveState('cfg-diet', DIET_MENU);

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
  caminar_suave: ["Caminar suave", "10-20 min en llano, ritmo cómodo. Espalda erguida, pasos cortos y regulares. Si notas molestia, baja el ritmo pero no pares del todo."],
  caminar_moderado: ["Caminar moderado", "25-35 min, puedes incluir alguna cuesta suave. Respiración relajada; si aparece dolor agudo, vuelve a terreno llano."],
  caminar_normal: ["Caminar a ritmo normal", "30-40 min al ritmo que llevabas antes de la lesión, prestando atención a cómo responde la zona lumbar."],
  caminar_rapido: ["Caminar rápido / a paso ligero", "30-40 min a un ritmo que te suba algo la pulsación pero te permita hablar sin ahogarte."],
  piscina_caminar: ["Piscina: caminar en el agua", "15-20 min caminando en agua a la altura del pecho, avanzando despacio con los brazos relajados."],
  piscina_nado_suave: ["Piscina: nado suave", "15-20 min de espalda o crol relajado. Evita braza con latigazo fuerte de piernas."],
  piscina_aquagym: ["Piscina: aquagym o sesión larga", "20-30 min combinando nado suave con ejercicios de piernas y core en el agua."],
  plancha_rodillas: ["Plancha de rodillas", "Apóyate en antebrazos y rodillas, zona lumbar neutra, abdomen ligeramente activado. 3-4 series de 10-15 segundos."],
  puente_gluteo: ["Puente de glúteo", "Tumbado boca arriba, rodillas flexionadas, eleva la cadera apretando glúteos 10 segundos y baja despacio. 8 repeticiones."],
  puente_una_pierna: ["Puente a una pierna", "Igual que el puente de glúteo pero con una pierna estirada en el aire. 6-8 repeticiones por lado."],
  estiramiento_cadera: ["Estiramiento de cadera", "De rodillas, adelanta una pierna en 90°, estira la otra hacia atrás e inclina el peso hacia delante. 30 segundos por lado."],
  estiramiento_piriforme: ["Estiramiento de piriforme", "Tumbado boca arriba, cruza un tobillo sobre la rodilla contraria y tira de la pierna de abajo hacia el pecho. 30 segundos por lado."],
  estiramiento_isquios: ["Estiramiento de isquiotibiales", "Tumbado, eleva una pierna estirada sujetando con una toalla detrás del muslo, sin forzar la rodilla. 30 segundos por lado."],
  estiramientos_generales: ["Estiramientos generales", "Rutina corta de 5-8 minutos: cuello, hombros, espalda, isquios y gemelos, cada uno 20-30 segundos."],
  gato_camello: ["Gato-camello", "A cuatro patas, alterna arquear la espalda hacia arriba y hundirla suavemente hacia abajo, movimiento lento. 10 repeticiones."],
  bird_dog: ["Bird-dog", "A cuatro patas, extiende brazo y pierna contraria a la vez, zona lumbar estable sin rotar la cadera. Mantén 10 segundos, 8 repeticiones por lado."],
  sentadilla_silla: ["Sentadilla a silla", "De pie frente a una silla, baja controladamente sin llegar a tocar, y vuelve a subir. 10-12 repeticiones."],
  plancha_lateral_corta: ["Plancha lateral corta", "Apoyado de lado sobre el antebrazo, eleva la cadera manteniendo el cuerpo en línea recta. 10-15 segundos por lado."],
  foam_roller: ["Foam roller en glúteo/cadera", "Pasa el rodillo de espuma por glúteo y zona lateral de la cadera, despacio, sin llegar a dolor agudo. 1-2 min por lado."],
  bici_suave: ["Bici suave", "15-20 min en bici estática o llano, resistencia baja, sillín a la altura correcta."],
  fuerza_funcional: ["Rutina de fuerza funcional", "Sentadilla a silla, puente de glúteo, plancha y remo con banda o botellas de agua, 2-3 series de 10-12 repeticiones cada uno."],
  moto_corta: ["Moto: sesión corta", "Solo si tu fisio o médico te ha dado el ok. Trayecto corto en llano, evitando baches. Para de inmediato si notas molestia."]
};

const PHASES = {
  1: {name:"Fase 1 · control y movilidad", cls:"p1", warn:"Evitar moto, karts, cargar peso",
      week:[["caminar_suave","plancha_rodillas","puente_gluteo"],
            ["piscina_caminar","estiramiento_cadera"],
            ["caminar_suave","estiramiento_piriforme"],
            ["caminar_suave","plancha_rodillas","puente_gluteo"],
            ["piscina_caminar","estiramiento_cadera"]]},
  2: {name:"Fase 2 · progresión activa", cls:"p2", warn:"Seguir sin moto ni karts",
      week:[["caminar_moderado","plancha_rodillas","puente_gluteo"],
            ["piscina_nado_suave","gato_camello"],
            ["bird_dog","estiramiento_isquios"],
            ["caminar_moderado","plancha_rodillas","puente_gluteo"],
            ["piscina_nado_suave","bird_dog"]]},
  3: {name:"Fase 3 · fortalecimiento", cls:"p3", warn:"Valorar con el fisio antes de probar la moto",
      week:[["sentadilla_silla","puente_una_pierna","plancha_lateral_corta"],
            ["piscina_aquagym"],
            ["bici_suave","gato_camello"],
            ["foam_roller","sentadilla_silla"],
            ["piscina_aquagym","estiramientos_generales"]]},
  4: {name:"Fase 4 · consolidación", cls:"p4", warn:"Dolor con irradiación a la pierna = parar y consultar",
      week:[["fuerza_funcional"],
            ["bici_suave"],
            ["moto_corta"],
            ["fuerza_funcional"],
            ["caminar_normal","estiramientos_generales"]]},
  5: {name:"Fase 5 · rutina de crucero", cls:"p5", warn:"Progresa poco a poco: sube repeticiones o ritmo solo si no hay molestia lumbar",
      week:[["fuerza_funcional","plancha_lateral_corta"],
            ["caminar_rapido"],
            ["fuerza_funcional","gato_camello"],
            ["piscina_nado_suave"],
            ["caminar_normal","estiramientos_generales"]]}
};

const PHASE_RANGES = [
  {phase:1, start:0,   end:10},
  {phase:2, start:11,  end:24},
  {phase:3, start:25,  end:38},
  {phase:4, start:39,  end:51},
  {phase:5, start:52,  end:153}
];

const START = new Date(2026,6,31);
const END = new Date(2026,11,31);
const TOTAL_DAYS = Math.round((END-START)/86400000)+1;
const TODAY = new Date(2026,6,31);

function fmtDate(d){
  const dias=["dom","lun","mar","mié","jué","vié","sáb"];
  const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}
function isSameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}

function buildWeekdays(){
  const days=[];
  for(let i=0;i<TOTAL_DAYS;i++){
    const date=new Date(START); date.setDate(START.getDate()+i);
    const dow=date.getDay();
    if(dow===0||dow===6) continue; // saltar fin de semana
    const range=PHASE_RANGES.find(r=>i>=r.start&&i<=r.end);
    const phase=PHASES[range.phase];
    const weekdayIndex=dow-1; // lunes=0 ... viernes=4
    const exIds=phase.week[weekdayIndex];
    days.push({index:i,date,phaseNum:range.phase,phase,exIds,key:date.toISOString().slice(0,10)});
  }
  return days;
}

function loadState(k){ try{return JSON.parse(localStorage.getItem(k)||'{}');}catch(e){return {};} }
function saveState(k,state){ try{localStorage.setItem(k, JSON.stringify(state));}catch(e){} }

function groupByWeek(days){
  const weeks=[];
  let current=[];
  let currentMonday=null;
  days.forEach(d=>{
    const monday=new Date(d.date);
    monday.setDate(monday.getDate()-(monday.getDay()-1));
    const key=monday.toISOString().slice(0,10);
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
      headRow.innerHTML=`<span class="day-date">${fmtDate(d.date)}</span><span class="phase-tag ${d.phase.cls}">Fase ${d.phaseNum}</span>`;
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
        const stretchKey=`${d.key}_rutina_estiramientos`;
        const state=loadState('lumbar-plan-state');
        const isDone=!!state[stretchKey];
        const row=document.createElement('div');
        row.className='ex'+(isDone?' done':'');
        const cbId=`cb_${stretchKey}`;
        row.innerHTML=`<input type="checkbox" id="${cbId}" ${isDone?'checked':''}>
          <label for="${cbId}"><span class="exname">Rutina de estiramientos</span><span class="exdetail">8 estiramientos, 5-10 min &middot; ver detalle en la pestaña Estiramientos</span></label>`;
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
        const icon = d.phaseNum===3 ? 'ti-alert-circle' : (d.phaseNum===4||d.phaseNum===5 ? 'ti-alert-triangle' : 'ti-ban');
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
    localStorage.removeItem('lumbar-plan-state');
    renderExercise();
  }
});

/* ---------- DIETA ---------- */
const DEFAULT_DIET_MENU = [
  { day: "Lunes", breakfast: "Tostada integral, tomate y AOVE + café", lunch: "Lentejas con verdura + fruta", dinner: "Pescado blanco al horno + verdura salteada" },
  { day: "Martes", breakfast: "Yogur natural con avena y fruta", lunch: "Pollo a la plancha, ensalada variada + pan integral", dinner: "Crema de verduras + tortilla francesa" },
  { day: "Miércoles", breakfast: "Tostada integral, tomate y AOVE + café", lunch: "Garbanzos con verdura + fruta", dinner: "Pavo a la plancha + ensalada" },
  { day: "Jueves", breakfast: "Huevo revuelto + fruta", lunch: "Pasta integral con verduras y atún", dinner: "Sopa de verduras + queso fresco" },
  { day: "Viernes", breakfast: "Yogur natural con avena y fruta", lunch: "Merluza o similar a la plancha + arroz integral", dinner: "Ensalada con huevo duro y aguacate" },
  { day: "Sábado", breakfast: "Tostada integral, tomate y AOVE + café", lunch: "Comida libre moderada (puedes incluir alcohol ocasional aquí)", dinner: "Verdura salteada + pescado o pollo" },
  { day: "Domingo", breakfast: "Huevo revuelto + fruta", lunch: "Arroz o legumbre con verdura", dinner: "Crema de verduras ligera" }
];
let DIET_MENU = loadState('cfg-diet');
if(!Array.isArray(DIET_MENU) || DIET_MENU.length === 0) DIET_MENU = DEFAULT_DIET_MENU;

function renderDiet(){
  const tbody = document.getElementById('diet-menu-body');
  if(tbody) {
    tbody.innerHTML = DIET_MENU.map(d => `<tr><td>${d.day}</td><td>${d.breakfast}</td><td>${d.lunch}</td><td>${d.dinner}</td></tr>`).join('');
  }

  const el=document.getElementById('diet-week');
  const state=loadState('diet-state');
  let html = '<div class="card"><p><strong>Marca los días que has seguido el menú</strong></p>';
  DIET_MENU.forEach((d,i)=>{
    const key=`dia_${i}`;
    const checked = state[key] ? 'checked' : '';
    html += `<div class="meal-check"><input type="checkbox" id="diet_${i}" data-key="${key}" ${checked}><label for="diet_${i}">${d.day}</label></div>`;
  });
  html += '</div>';
  el.innerHTML = html;
  el.querySelectorAll('input').forEach(cb=>{
    cb.addEventListener('change',()=>{
      const st=loadState('diet-state');
      if(cb.checked) st[cb.dataset.key]=true; else delete st[cb.dataset.key];
      saveState('diet-state', st);
    });
  });
}

/* ---------- ESTIRAMIENTOS ---------- */
const DEFAULT_STRETCHES = [
  ["Rodillas al pecho", "Tumbado boca arriba, lleva ambas rodillas al pecho y abraza suavemente. Descarga toda la zona lumbar. 30-40 segundos, 2 veces."],
  ["Rodilla al pecho, una pierna", "Igual que el anterior pero con una sola pierna, la otra apoyada y flexionada en el suelo. 20-30 segundos por lado."],
  ["Estiramiento de piriforme", "Tumbado boca arriba, cruza un tobillo sobre la rodilla contraria y tira suavemente de la pierna de abajo hacia el pecho. Alivia mucho la zona entre columna y nalga. 30 segundos por lado."],
  ["Estiramiento de isquiotibiales (tumbado)", "Tumbado, eleva una pierna estirada sujetando con una toalla o cinta detrás del muslo, rodilla contraria flexionada y pie apoyado. Sin forzar la rodilla elevada. 30 segundos por lado."],
  ["Gato-camello", "A cuatro patas, alterna arquear la espalda hacia arriba (como un gato) y hundirla suavemente hacia abajo. Movimiento lento, sin forzar el rango. 8-10 repeticiones."],
  ["Estiramiento de cadera (flexor)", "De rodillas, adelanta una pierna en ángulo de 90° y estira la otra hacia atrás, empuja la cadera suavemente hacia delante. 30 segundos por lado."],
  ["Postura del niño (suave)", "De rodillas, siéntate sobre los talones y estira los brazos hacia delante, dejando caer el pecho hacia el suelo sin forzar. Si molesta, reduce el rango. 30-40 segundos."],
  ["Rotación de rodillas tumbado", "Tumbado boca arriba, rodillas flexionadas juntas, deja caer ambas rodillas suavemente hacia un lado y luego hacia el otro, sin forzar el giro. 20 segundos por lado."]
];
let STRETCHES = loadState('cfg-stretches');
if(!Array.isArray(STRETCHES) || STRETCHES.length === 0) STRETCHES = DEFAULT_STRETCHES;

function renderStretches(){
  const el=document.getElementById('stretch-list');
  const state=loadState('stretch-state');
  let html='';
  STRETCHES.forEach((s,i)=>{
    const [name,detail]=s;
    const key=`st_${i}`;
    const checked = state[key] ? 'checked' : '';
    const doneClass = state[key] ? ' done' : '';
    html += `<div class="ex${doneClass}"><input type="checkbox" id="stretch_${i}" data-key="${key}" ${checked}>
      <label for="stretch_${i}"><span class="exname">${name}</span><span class="exdetail">${detail}</span></label></div>`;
  });
  el.innerHTML=html;
  el.querySelectorAll('input').forEach(cb=>{
    cb.addEventListener('change',()=>{
      const st=loadState('stretch-state');
      if(cb.checked) st[cb.dataset.key]=true; else delete st[cb.dataset.key];
      saveState('stretch-state', st);
      cb.closest('.ex').classList.toggle('done', cb.checked);
    });
  });
}

/* ---------- SEGUIMIENTO DIARIO ---------- */
function todayStr(){ const d=new Date(); return d.toISOString().slice(0,10); }
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
  let html = '<div class="table-scroll"><table class="hist"><tr><th>Fecha</th><th>Peso</th><th>TA</th><th>Pulso</th><th>Sueño</th><th>Agua</th><th>Dolor</th><th>Medic.</th><th></th></tr>';
  dates.forEach(dt=>{
    const r=data[dt];
    html += `<tr><td>${fmtDateStr(dt)}</td><td>${r.peso??''}</td><td>${(r.tasis||r.tadia)?(r.tasis||'')+'/'+(r.tadia||''):''}</td><td>${r.pulso??''}</td><td>${r.sueno??''}</td><td>${r.agua??''}</td><td>${r.dolor??''}</td><td>${r.medicacion?'<i class="ti ti-check"></i>':''}</td><td><button class="del-btn" data-del="${dt}"><i class="ti ti-trash"></i></button></td></tr>`;
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
  st[fecha] = {
    peso: document.getElementById('h-peso').value || null,
    tasis: document.getElementById('h-tasis').value || null,
    tadia: document.getElementById('h-tadia').value || null,
    pulso: document.getElementById('h-pulso').value || null,
    sueno: document.getElementById('h-sueno').value || null,
    agua: document.getElementById('h-agua').value || null,
    dolor: document.getElementById('h-dolor').value || null,
    medicacion: document.getElementById('h-medicacion').checked
  };
  saveState('health-log', st);
  renderHealth();
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
const DATA_KEYS = ['lumbar-plan-state','diet-state','stretch-state','health-log','care-log','notes-log'];

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
    totalEx++; // Stretches routine
    if (stEx[`${d.key}_rutina_estiramientos`]) doneEx++;
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

  // Calculate Care Compliance
  const stCare = loadState('care-log');
  let totalCare = 0;
  let doneCare = 0;
  Object.keys(stCare).forEach(dt => {
    const entry = stCare[dt];
    CARE_ITEMS.forEach(([id]) => {
      totalCare++;
      if(entry[id]) doneCare++;
    });
  });
  const pctCare = totalCare === 0 ? 0 : Math.round((doneCare/totalCare)*100);

  initOrUpdateChart('chart-cuidado', {
    type: 'doughnut',
    data: {
      labels: ['Completado', 'Omitido'],
      datasets: [{
        data: [doneCare, Math.max(0, totalCare - doneCare)],
        backgroundColor: ['#85b7eb', '#e0e0e0']
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: pctCare + '% de Cumplimiento' } }
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
let dbx = null;

document.getElementById('dbx-login-btn').addEventListener('click', () => {
  const dbxAuth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });
  let redirectUri = window.location.href.split('#')[0].split('?')[0];
  const authUrl = dbxAuth.getAuthenticationUrl(redirectUri, undefined, 'token');
  authUrl.then(url => { window.location.href = url; });
});

if (window.location.hash.includes('access_token')) {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get('access_token');
  if(token){
    dbx = new Dropbox.Dropbox({ accessToken: token });
    document.getElementById('dbx-login-btn').style.display = 'none';
    document.getElementById('dbx-load-btn').style.display = 'inline-block';
    document.getElementById('dbx-save-btn').style.display = 'inline-block';
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
}

document.getElementById('dbx-save-btn').addEventListener('click', () => {
  if(!dbx) return;
  const bundle = {};
  DATA_KEYS.forEach(k => { bundle[k] = loadState(k); });
  bundle._exportado = new Date().toISOString();
  const file = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
  dbx.filesUpload({ path: '/plan_lumbar_datos.json', contents: file, mode: 'overwrite' })
    .then(() => showAlert('Datos guardados en Dropbox correctamente.'))
    .catch(err => { console.error(err); showAlert('Error al guardar en Dropbox.'); });
});

document.getElementById('dbx-load-btn').addEventListener('click', () => {
  if(!dbx) return;
  dbx.filesDownload({ path: '/plan_lumbar_datos.json' })
    .then(res => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const bundle = JSON.parse(reader.result);
          DATA_KEYS.forEach(k => {
            if (bundle[k]) saveState(k, bundle[k]);
          });
          renderExercise(); renderDiet(); renderStretches(); renderHealth(); renderCare(); renderNotes(); renderEstadisticas();
          showAlert('Datos cargados de Dropbox correctamente.');
        } catch(e) {
          showAlert('Error al procesar el archivo descargado.');
        }
      };
      reader.readAsText(res.result.fileBlob);
    })
    .catch(err => {
      console.error(err);
      if(err.status===409) showAlert('El archivo no existe todavía en Dropbox. Guárdalo primero.');
      else showAlert('Error al cargar de Dropbox.');
    });
});
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