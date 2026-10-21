// 로그인 + 도장 이름 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcVT5penlJbZKKoIVOJ4JiOMDY48zO6zg",
  authDomain: "belttest-12c63.firebaseapp.com",
  projectId: "belttest-12c63",
  storageBucket: "belttest-12c63.firebasestorage.app",
  messagingSenderId: "87764787483",
  appId: "1:87764787483:web:d2bcac7a36cec284ca33be"
};

// 아이디에 @가 없으면 이 도메인을 붙여서 로그인합니다.
// (콘솔에서도 "아이디@dojo.app" 형태로 사용자를 만드세요)
const ID_DOMAIN = "dojo.app";
const REMEMBER_KEY = "dojoLoginId";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

// ---------- 화면 전환 ----------
const SCREENS = ["loadingScreen", "loginScreen", "inputScreen", "resultScreen"];

function showOnly(id) {
  SCREENS.forEach((sid) => {
    $(sid).classList.remove("active");
    $(sid).classList.add("hidden");
  });
  $(id).classList.remove("hidden");
  $(id).classList.add("active");
}

function applyDojoName(name) {
  document.querySelectorAll(".dojo-name").forEach((el) => { el.textContent = name; });
  document.title = name ? `${name} 승품·단 심사 발표` : "승품·단 심사 발표";
}

// ---------- 비밀번호 보기(눈) 버튼 ----------
const SVG_ATTR = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const EYE = `<svg class="eye" ${SVG_ATTR}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg class="eye-off" ${SVG_ATTR}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

document.querySelectorAll(".pw-wrap").forEach((wrap) => {
  const input = wrap.querySelector("input");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pw-toggle";
  btn.setAttribute("aria-label", "비밀번호 보기");
  btn.innerHTML = EYE + EYE_OFF;
  btn.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.classList.toggle("shown", show);
    btn.setAttribute("aria-label", show ? "비밀번호 숨기기" : "비밀번호 보기");
  });
  wrap.appendChild(btn);
});

// ---------- 로그인 폼 ----------
const form = $("loginForm");
const idEl = form.querySelector('[name="loginId"]');
const pwEl = form.querySelector('[name="loginPw"]');
const rememberEl = form.querySelector('[name="rememberId"]');
const loginBtn = form.querySelector('button[type="submit"]');
const errEl = form.querySelector(".login-error");

const setError = (msg) => { errEl.textContent = msg || ""; };

try {
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (saved) {
    idEl.value = saved;
    rememberEl.checked = true;
  }
} catch (e) { /* 무시 */ }

function authErrorMessage(code) {
  let msg;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      msg = "아이디 또는 비밀번호가 올바르지 않습니다."; break;
    case "auth/invalid-email":
      msg = "아이디 형식이 올바르지 않습니다."; break;
    case "auth/user-disabled":
      msg = "사용이 중지된 계정입니다."; break;
    case "auth/too-many-requests":
      msg = "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요."; break;
    case "auth/network-request-failed":
      msg = "인터넷 연결을 확인해 주세요."; break;
    case "auth/operation-not-allowed":
      msg = "이메일/비밀번호 로그인이 꺼져 있습니다. Firebase 콘솔에서 켜 주세요."; break;
    default:
      msg = "로그인에 실패했습니다.";
  }
  return `${msg} (${code})`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = idEl.value.trim();
  const pw = pwEl.value;

  if (!id || !pw) {
    setError("아이디와 비밀번호를 입력해 주세요.");
    return;
  }

  const email = id.includes("@") ? id : `${id}@${ID_DOMAIN}`;

  setError("");
  loginBtn.disabled = true;
  loginBtn.textContent = "로그인 중...";
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    try {
      if (rememberEl.checked) localStorage.setItem(REMEMBER_KEY, id);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch (e2) { /* 무시 */ }
  } catch (err) {
    console.error("로그인 실패:", err.code, err.message);
    setError(authErrorMessage(err.code));
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "로그인";
  }
});

// ---------- 로그인 상태에 따라 화면 결정 ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    applyDojoName("");
    pwEl.value = "";
    showOnly("loginScreen");
    return;
  }

  try {
    const snap = await getDoc(doc(db, "dojos", user.uid));
    const data = snap.exists() ? snap.data() : null;
    const name = data ? data.name : null;

    if (!name) {
      setError("등록되지 않은 계정입니다. 관리자에게 문의하세요.");
      await signOut(auth);
      return;
    }

    applyDojoName(name);
    $("adminLink").classList.toggle("hidden", data.admin !== true);
    setError("");
    showOnly("inputScreen");
  } catch (e) {
    console.error("도장 정보 읽기 실패:", e);
    setError(`도장 정보를 불러오지 못했습니다. (${e.code || e.message})`);
    await signOut(auth);
  }
});

// 로그아웃: 이전 도장의 입력 내용이 남지 않도록 새로고침
window.logout = async () => {
  await signOut(auth);
  location.reload();
};
