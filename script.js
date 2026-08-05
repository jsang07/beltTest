// --- 1. 품/단 옵션 ---
const RANKS = [
  "무급", "9급", "8급", "7급", "6급", "5급", "4급", "3급", "2급", "1급",
  "1품", "2품", "3품", "4품",
  "1단", "2단", "3단", "4단", "5단", "6단", "7단", "8단", "9단"
];

const COUNTDOWN_INTERVAL = 1250; // 1.35초 간격

let candidates = Array.from({ length: 10 }, () => ({
  name: "",
  prev: "1품",
  next: "2품",
  isPass: true
}));

let activeCandidates = [];
let currentIndex = 0;

// --- 2. 명단 입력 테이블 ---
function renderCandidateTable() {
  const tbody = document.getElementById('candidateTableBody');
  tbody.innerHTML = '';

  candidates.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" value="${c.name}" class="table-input" placeholder="수련생 이름"
          onchange="updateCandidate(${idx}, 'name', this.value)">
      </td>
      <td>
        <select class="table-select" onchange="updateCandidate(${idx}, 'prev', this.value)">
          ${RANKS.map(r => `<option value="${r}" ${r === c.prev ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="table-select" onchange="updateCandidate(${idx}, 'next', this.value)">
          ${RANKS.map(r => `<option value="${r}" ${r === c.next ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </td>
      <td class="text-center">
        <button class="btn-toggle ${c.isPass ? 'pass' : 'fail'}" onclick="togglePass(${idx})">
          ${c.isPass ? '합격' : '불합격'}
        </button>
      </td>
      <td class="text-center">
        <button class="btn-del" onclick="removeRow(${idx})">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addRow() {
  candidates.push({ name: "", prev: "1품", next: "2품", isPass: true });
  renderCandidateTable();
  const wrapper = document.querySelector('.table-wrapper');
  wrapper.scrollTop = wrapper.scrollHeight;
}

function removeRow(idx) {
  if (candidates.length <= 1) {
    alert("최소 한 개의 행은 유지되어야 합니다.");
    return;
  }
  candidates.splice(idx, 1);
  renderCandidateTable();
}

function updateCandidate(idx, key, value) {
  candidates[idx][key] = value;
}

function togglePass(idx) {
  candidates[idx].isPass = !candidates[idx].isPass;
  renderCandidateTable();
}

renderCandidateTable();

// --- 3. 발표 시작 시퀀스 ---
function startPresentation() {
  activeCandidates = candidates.filter(c => c.name.trim() !== "");

  if (activeCandidates.length === 0) {
    alert('최소 한 명 이상의 수련생 이름을 입력해 주세요!');
    return;
  }

  currentIndex = 0;
  document.getElementById('inputScreen').classList.remove('active');
  document.getElementById('inputScreen').classList.add('hidden');
  
  processCandidateFlow(activeCandidates[currentIndex]);
}

function processCandidateFlow(student) {
  runIntro(student, () => {
    runMainCountdown(student, () => {
      document.getElementById('resultScreen').classList.remove('hidden');
      document.getElementById('resultScreen').classList.add('active');
      showCard(currentIndex);
    });
  });
}

// 1단계 수련생 소개 (3, 2, 1)
function runIntro(student, onComplete) {
  const overlay = document.getElementById('introOverlay');
  const numberEl = document.getElementById('introNumber');
  
  document.getElementById('introNameVal').innerText = student.name;
  document.getElementById('introRankVal').innerText = student.next;

  overlay.classList.remove('hidden');

  let count = 3;
  numberEl.innerText = count;

  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      numberEl.innerText = count;
    } else {
      clearInterval(timer);
      overlay.classList.add('hidden');
      onComplete();
    }
  }, COUNTDOWN_INTERVAL);
}

// 2단계 메인 카운트다운 (5, 4, 3, 2, 1)
function runMainCountdown(student, onComplete) {
  const overlay = document.getElementById('countdownOverlay');
  const numberEl = document.getElementById('countdownNumber');
  
  document.getElementById('cdName').innerText = student.name;
  document.getElementById('cdRank').innerText = student.next;

  overlay.classList.remove('hidden');

  let count = 5;
  numberEl.innerText = count;

  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      numberEl.innerText = count;
    } else {
      clearInterval(timer);
      overlay.classList.add('hidden');
      onComplete();
    }
  }, COUNTDOWN_INTERVAL);
}

// 3단계 결과 카드
function showCard(index) {
  const student = activeCandidates[index];
  const topTitle = document.getElementById('resultTopTitle');
  const cardName = document.getElementById('cardName');
  const cardBadge = document.getElementById('cardBadge');
  const nextBtn = document.getElementById('nextBtn');

  cardName.innerText = student.name;

  if (student.isPass) {
    topTitle.innerText = "🎉 합격 🎉";
    cardBadge.innerText = `${student.next} 승품을 축하합니다`;
    startFireworks();
  } else {
    topTitle.innerText = "❌ 아쉬운 결과 ❌";
    cardBadge.innerText = "다음 기회에 꼭 승품해요!";
    stopFireworks();
  }

  if (index === activeCandidates.length - 1) {
    nextBtn.innerText = '🔄 처음으로 돌아가기';
  } else {
    nextBtn.innerText = '잠시 후 다음 순서가 진행됩니다.';
  }
}

function nextCandidateProcess() {
  if (currentIndex < activeCandidates.length - 1) {
    currentIndex++;
    stopFireworks();
    
    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('hidden');

    processCandidateFlow(activeCandidates[currentIndex]);
  } else {
    stopFireworks();

    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('inputScreen').classList.remove('hidden');
    document.getElementById('inputScreen').classList.add('active');
  }
}

// 키보드 엔터/스페이스 이벤트
window.addEventListener('keydown', (e) => {
  const resultScreen = document.getElementById('resultScreen');
  const introOverlay = document.getElementById('introOverlay');
  const cdOverlay = document.getElementById('countdownOverlay');

  if (resultScreen.classList.contains('active') && 
      introOverlay.classList.contains('hidden') && 
      cdOverlay.classList.contains('hidden')) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      nextCandidateProcess();
    }
  }
});

// --- 4. 불꽃놀이 (Canvas) ---
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class BigParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 4 + 3;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 15 + 4;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    this.alpha = 1;
    this.friction = 0.94;
    this.gravity = 0.15;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.012;
  }
}

function createGrandFirework(customX, customY) {
  const x = customX || Math.random() * canvas.width;
  const y = customY || Math.random() * (canvas.height * 0.55);
  const colorSets = [
    ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'],
    ['#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
    ['#38bdf8', '#818cf8', '#ffffff']
  ];
  const selectedSet = colorSets[Math.floor(Math.random() * colorSets.length)];

  for (let i = 0; i < 100; i++) {
    const color = selectedSet[Math.floor(Math.random() * selectedSet.length)];
    particles.push(new BigParticle(x, y, color));
  }
}

function animateFireworks() {
  ctx.fillStyle = 'rgba(13, 18, 29, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.18) {
    createGrandFirework();
  }

  particles.forEach((particle, index) => {
    if (particle.alpha > 0) {
      particle.update();
      particle.draw();
    } else {
      particles.splice(index, 1);
    }
  });

  animationId = requestAnimationFrame(animateFireworks);
}

function startFireworks() {
  if (!animationId) {
    particles = [];
    setTimeout(() => createGrandFirework(canvas.width * 0.2, canvas.height * 0.3), 0);
    setTimeout(() => createGrandFirework(canvas.width * 0.8, canvas.height * 0.3), 100);
    setTimeout(() => createGrandFirework(canvas.width * 0.5, canvas.height * 0.2), 200);
    animateFireworks();
  }
}

function stopFireworks() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}