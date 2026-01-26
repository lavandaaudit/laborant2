// BACKGROUND
const c = document.getElementById("bg");
const x = c.getContext("2d");
let W, H, p = [];

function rs() {
  W = c.width = innerWidth;
  H = c.height = innerHeight;
  p = Array.from({length: 120}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random() * W
  }));
}
rs();
addEventListener("resize", rs);

function draw() {
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#ffd166";
  p.forEach(s => {
    s.z -= 0.4;
    if (s.z < 1) s.z = W;
    const k = 120 / s.z;
    const X = (s.x - W / 2) * k + W / 2;
    const Y = (s.y - H / 2) * k + H / 2;
    if (X > 0 && Y > 0 && X < W && Y < H) x.fillRect(X, Y, 1.5, 1.5);
  });
  requestAnimationFrame(draw);
}
draw();

// TIME
setInterval(() => {
  document.getElementById("time").textContent = new Date().toLocaleTimeString("uk-UA");
}, 1000);

// PHYSICS FAKE DATA
function physicsAPI() {
  return {
    photon: (Math.random() * 800 + 200).toFixed(0),
    field: (Math.random() * 50).toFixed(2),
    entropy: (Math.random() * 1.5).toFixed(3)
  };
}
function updatePhysics() {
  const d = physicsAPI();
  document.getElementById("physData").innerHTML = `
    <div class="row"><span>photon flux</span><span>${d.photon}</span></div>
    <div class="row"><span>field strength</span><span>${d.field}</span></div>
    <div class="row"><span>entropy drift</span><span>${d.entropy}</span></div>
  `;
}
setInterval(updatePhysics, 3000);
updatePhysics();

// TOTOBI PARSER + LEARNING
const msgs = document.getElementById("msgs");
const q = document.getElementById("q");
const sendBtn = document.getElementById("sendBtn");

async function fetchWithProxy(url) {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  try {
    const r = await fetch(proxy);
    if (!r.ok) throw new Error('Proxy error');
    return await r.text();
  } catch (e) {
    return `Помилка завантаження: ${e.message}`;
  }
}

const categoryMap = {
  "ручк": "https://totobi.com.ua/ruchki/",
  "pen": "https://totobi.com.ua/ruchki/",
  "олів": "https://totobi.com.ua/ruchki/olvc/",
  "горнят": "https://totobi.com.ua/posud/gornyatka/",
  "mug": "https://totobi.com.ua/posud/gornyatka/",
  "термокруж": "https://totobi.com.ua/podorozh-ta-vdpochinok/termosi-ta-termokruzhki/",
  "рюкзак": "https://totobi.com.ua/sumki/ryukzaki/",
  "сумк": "https://totobi.com.ua/sumki/",
  "футболк": "https://totobi.com.ua/odyag/futbolki/",
  "одяг": "https://totobi.com.ua/odyag/",
  "брел": "https://totobi.com.ua/personaln-aksessuari-uk/brelki/",
};

async function searchProducts(query) {
  let url = null;
  const qLower = query.toLowerCase();

  for (let key in categoryMap) {
    if (qLower.includes(key)) {
      url = categoryMap[key];
      break;
    }
  }

  if (!url) return "Не знайшов категорію. Спробуйте: ручки, горнятка, рюкзаки, футболки, брелки...";

  const html = await fetchWithProxy(url);
  if (typeof html !== 'string' || html.includes('Помилка')) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const items = doc.querySelectorAll('.ty-grid-list__item, .ty-product-list__item, article');
  if (items.length === 0) return `Категорія: ${url.split('/').filter(Boolean).pop() || 'Товари'}<br>Товарів не знайдено.`;

  let result = `<strong>Товари (${url.split('/').filter(Boolean).pop().replace(/-/g, ' ')}):</strong><br><br>`;
  let count = 0;

  items.forEach(item => {
    if (count >= 4) return;

    const img = item.querySelector('img')?.src || '';
    const titleEl = item.querySelector('a.product-title-link, .ty-product__title a, h3 a');
    const title = titleEl?.textContent.trim() || 'Без назви';
    const link = titleEl?.href || '#';
    const price = item.querySelector('.ty-price-num, span.price')?.textContent.trim() || '—';

    if (title && price !== '—') {
      result += `
        <div style="margin:12px 0; padding-bottom:10px; border-bottom:1px solid #ffd16633;">
          <a href="${link}" target="_blank" style="color:#ffd166;text-decoration:underline;">${title}</a><br>
          <strong>${price}</strong><br>
          ${img ? `<img src="${img}" style="max-width:180px; margin-top:6px; border:1px solid #ffd16644;" loading="lazy">` : ''}
        </div>`;
      count++;
    }
  });

  return result || "Не вдалося витягнути товари.";
}

let knowledgeBase = JSON.parse(localStorage.getItem('knowledgeBase')) || {};
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || {};

async function getAnswer(m) {
  m = m.trim();
  const lower = m.toLowerCase();

  if (chatHistory[m]) return chatHistory[m];
  if (knowledgeBase[lower]) return knowledgeBase[lower];

  if (m.startsWith("додай:")) {
    const parts = m.replace("додай:", "").split("=");
    if (parts.length === 2) {
      const key = parts[0].trim().toLowerCase();
      const value = parts[1].trim();
      knowledgeBase[key] = value;
      localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
      return `Додано: "${key}" → "${value}"`;
    }
    return "Формат: додай: ключ = відповідь";
  }

  // Фізика
  if (lower.includes("світл")) return "світло — це потік фотонів.\nя аналізую його як енергію, хвилю і подію.";
  if (lower.includes("поле")) return "поле — носій взаємодій.\nелектромагнітне, гравітаційне, фазове.";
  if (lower.includes("ентроп")) return "ентропія — міра невизначеності.\nїї ріст показує напрям часу.";
  if (lower.includes("хвил")) return "хвиля — коливання стану середовища.\nможе бути світловою або матеріальною.";

  // Totobi товари
  if (Object.keys(categoryMap).some(k => lower.includes(k)) ||
      lower.includes("товар") || lower.includes("купити") || lower.includes("ціна")) {
    return await searchProducts(m);
  }

  return "Не розумію. Спробуйте: світло, поле, ентропія, ручки, горнятка, рюкзаки... або додай: знання";
}

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.innerHTML = text.replace(/\n/g, "<br>");
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function ask() {
  const v = q.value.trim();
  if (!v) return;

  addMessage(v, "user");
  q.value = "";

  const temp = document.createElement("div");
  temp.className = "msg bot";
  temp.textContent = "Аналізую...";
  msgs.appendChild(temp);
  msgs.scrollTop = msgs.scrollHeight;

  const answer = await getAnswer(v);
  chatHistory[v] = answer;
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  temp.innerHTML = answer.replace(/\n/g, "<br>");
}

sendBtn.onclick = ask;
q.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    ask();
  }
});
