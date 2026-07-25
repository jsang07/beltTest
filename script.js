// --- 1. 국기원 표준 품/단 옵션 배열 ---
const RANKS = [
  "무급", "9급", "8급", "7급", "6급", "5급", "4급", "3급", "2급", "1급",
  "1품", "2품", "3품", "4품",
  "1단", "2단", "3단", "4단", "5단", "6단", "7단", "8단", "9단"
];

let candidates = Array.from({ length: 10 }, () => ({
  name: "",
  prev: "1품",
  next: "2품",
  isPass: true
}));

let activeCandidates = [];
let currentIndex = 0;

// --- 2. 테이블 랜더링 ---
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

// --- 3. 발표 및 카운트다운 ---
function startPresentation() {
  activeCandidates = candidates.filter(c => c.name.trim() !== "");

  if (activeCandidates.length === 0) {
    alert('최소 한 명 이상의 수련생 이름을 입력해 주세요!');
    return;
  }

  currentIndex = 0;
  document.getElementById('inputScreen').classList.remove('active');
  document.getElementById('inputScreen').classList.add('hidden');
  
  runCountdown(activeCandidates[currentIndex], () => {
    document.getElementById('resultScreen').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('active');
    showCard(currentIndex);
  });
}

function runCountdown(student, onComplete) {
  const overlay = document.getElementById('countdownOverlay');
  const numberEl = document.getElementById('countdownNumber');
  const infoEl = document.getElementById('countdownInfo');

  infoEl.innerHTML = `<span class="highlight">${student.name}</span> (${student.prev} ➔ ${student.next})`;
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
  }, 800);
}

function showCard(index) {
  const student = activeCandidates[index];
  const cardEl = document.getElementById('fifaCard');
  const statusBadge = document.getElementById('cardStatusBadge');
  const heroTitle = document.getElementById('heroResultTitle');
  const badgeBanner = document.getElementById('resultBadge');
  const nextBtn = document.getElementById('nextBtn');

  document.getElementById('currentIndex').innerText = index + 1;
  document.getElementById('totalCount').innerText = activeCandidates.length;

  document.getElementById('cardName').innerText = `${student.name} 수련생`;
  document.getElementById('cardPrev').innerText = student.prev;
  document.getElementById('cardNext').innerText = student.next;

  heroTitle.style.animation = 'none';
  heroTitle.offsetHeight;
  heroTitle.style.animation = null;

  if (student.isPass) {
    cardEl.className = 'fifa-card pass';
    statusBadge.innerText = 'PASSED';
    heroTitle.innerText = `🎉 ${student.next} 승급 합격! 🎉`;
    badgeBanner.innerText = `🔥 축하합니다! 멋진 태권도인! 🔥`;
    startFireworks(); // 초대형 불꽃놀이 팡파르!
  } else {
    cardEl.className = 'fifa-card fail';
    statusBadge.innerText = 'FAILED';
    heroTitle.innerText = `💪 아쉬운 도전!`;
    badgeBanner.innerText = `다음 심사에 다시 도전해요!`;
    stopFireworks();
  }

  if (index === activeCandidates.length - 1) {
    nextBtn.innerText = '🔄 처음으로 돌아가기';
  } else {
    nextBtn.innerText = '다음 응시자 (Space / Enter) ➔';
  }
}

function nextCandidateProcess() {
  if (currentIndex < activeCandidates.length - 1) {
    currentIndex++;
    stopFireworks();
    
    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('hidden');

    runCountdown(activeCandidates[currentIndex], () => {
      document.getElementById('resultScreen').classList.remove('hidden');
      document.getElementById('resultScreen').classList.add('active');
      showCard(currentIndex);
    });
  } else {
    stopFireworks();

    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('inputScreen').classList.remove('hidden');
    document.getElementById('inputScreen').classList.add('active');
  }
}

window.addEventListener('keydown', (e) => {
  const resultScreen = document.getElementById('resultScreen');
  const overlay = document.getElementById('countdownOverlay');

  if (resultScreen.classList.contains('active') && overlay.classList.contains('hidden')) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      nextCandidateProcess();
    }
  }
});

// --- 4. 🎆 [재설계] 대형 축하 불꽃놀이 (High Quality Grand Fireworks) ---
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

// 커진 입자 클래스 (빛나는 잔상 및 글로우 포함)
class BigParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 4 + 3.5; // 입자 크기를 3.5px ~ 7.5px로 대폭 확장
    
    // 폭발 시 강력하게 사방으로 뿜어져 나가는 속도 부여
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 16 + 4; // 확 퍼지는 강력한 폭발력
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    
    this.alpha = 1;
    this.friction = 0.94; // 천천히 퍼짐
    this.gravity = 0.15;  // 자연스러운 중력
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12; // 빛나는 시각 효과
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
    this.alpha -= 0.012; // 은은하고 길게 남는 불꽃 잔상
  }
}

// 팡!! 터지는 불꽃 폭발 생성기 (120개 입자 사방 분사)
function createGrandFirework(customX, customY) {
  const x = customX || Math.random() * canvas.width;
  const y = customY || Math.random() * (canvas.height * 0.55);
  
  // 골드, 에메랄드, 시안, 루비, 퍼플 등 고화질 컬러
  const colorSets = [
    ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'], // 골드 팡파르
    ['#38bdf8', '#818cf8', '#c084fc', '#ffffff'], // 네온 블루
    ['#4ade80', '#facc15', '#f43f5e', '#ffffff']  // 카니발 레인보우
  ];
  const selectedSet = colorSets[Math.floor(Math.random() * colorSets.length)];

  for (let i = 0; i < 120; i++) { // 입자 개수 120개로 대폭 증가
    const color = selectedSet[Math.floor(Math.random() * selectedSet.length)];
    particles.push(new BigParticle(x, y, color));
  }
}

function animateFireworks() {
  // 어두운 배경 잔상으로 깔끔한 불꽃 궤적 유지
  ctx.fillStyle = 'rgba(9, 13, 22, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 주기적으로 사방에서 대형 폭죽 팡팡 터짐
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
    
    // 시작과 동시에 좌/우/중앙 5곳에서 오프닝 대형 폭죽 동시 발사!
    setTimeout(() => createGrandFirework(canvas.width * 0.2, canvas.height * 0.3), 0);
    setTimeout(() => createGrandFirework(canvas.width * 0.8, canvas.height * 0.3), 100);
    setTimeout(() => createGrandFirework(canvas.width * 0.5, canvas.height * 0.2), 250);
    setTimeout(() => createGrandFirework(canvas.width * 0.35, canvas.height * 0.4), 400);
    setTimeout(() => createGrandFirework(canvas.width * 0.65, canvas.height * 0.4), 450);

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