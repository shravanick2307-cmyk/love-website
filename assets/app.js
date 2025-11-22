// assets/app.js
// Frontend JS for form handling + Firebase integration + admin view
// ----- IMPORTANT -----
// Before using, create Firebase project & Firestore and replace the firebaseConfig object below with your project's config.
// Instructions are in the next section of the guide.

// ========== Firebase config (REPLACE THIS) ==========
const firebaseConfig = {
  // Replace the values below with your Firebase project's config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
// ====================================================

// Minimal fire initialization and helpers
let db = null;
async function initFirebase() {
  if (typeof firebase === 'undefined') {
    // load Firebase SDKs dynamically if not present
    const s1 = document.createElement('script');
    s1.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js";
    document.head.appendChild(s2);
    await new Promise(r => s2.onload = r);
  }
  // init
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized");
  } catch(e) {
    console.error("Firebase init error", e);
  }
}

/* --------------------------
   Form handling (quiz.html)
   -------------------------- */
function setupForm() {
  const form = document.getElementById('love-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('status');
    status.textContent = "Saving...";

    const name = document.getElementById('name').value.trim();
    const q1 = document.querySelector('input[name="q1"]:checked')?.value || '';
    const q2 = document.querySelector('input[name="q2"]:checked')?.value || '';
    const q3 = document.querySelector('input[name="q3"]:checked')?.value || '';
    const note = document.getElementById('note').value.trim();

    const payload = {
      name, q1, q2, q3, note,
      createdAt: new Date().toISOString()
    };

    try {
      if (!db) await initFirebase();
      await db.collection('submissions').add(payload);
      status.textContent = "Sent — thank you! 💖";
      form.reset();
    } catch(err) {
      console.error(err);
      status.textContent = "Oops, something went wrong. Try again later.";
    }
  });
}

/* --------------------------
   Admin handling (admin.html)
   -------------------------- */
function setupAdmin() {
  const loginBtn = document.getElementById('admin-login');
  if (!loginBtn) return;

  // Customize this passphrase (or store securely later)
  const SECRET = "rosebud-123"; // change this before publishing
  const adminStatus = document.getElementById('admin-status');

  loginBtn.addEventListener('click', async () => {
    const pass = document.getElementById('admin-pass').value;
    if (pass !== SECRET) {
      adminStatus.textContent = "Wrong passphrase.";
      return;
    }
    adminStatus.textContent = "Unlocked — fetching submissions...";
    try {
      if (!db) await initFirebase();
      const col = await db.collection('submissions').orderBy('createdAt', 'desc').get();
      const listWrap = document.getElementById('list');
      if (!col.size) {
        document.getElementById('no-data').classList.remove('hidden');
      } else {
        document.getElementById('submissions').classList.remove('hidden');
        listWrap.innerHTML = '';
        col.forEach(doc => {
          const d = doc.data();
          const el = document.createElement('div');
          el.className = 'submission';
          el.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
          el.style.padding = '10px 0';
          el.innerHTML = `
            <div><strong>${escapeHtml(d.name || 'Unknown')}</strong> <span style="color:#bbb;font-size:12px"> — ${new Date(d.createdAt).toLocaleString()}</span></div>
            <div>1) ${escapeHtml(d.q1 || '')}</div>
            <div>2) ${escapeHtml(d.q2 || '')}</div>
            <div>3) ${escapeHtml(d.q3 || '')}</div>
            <div style="margin-top:8px">💬 ${escapeHtml(d.note || '')}</div>
          `;
          listWrap.appendChild(el);
        });
      }
      adminStatus.textContent = "Done — shown above.";
    } catch(err) {
      console.error(err);
      adminStatus.textContent = "Error loading data.";
    }
  });
}

// small utility
function escapeHtml(text) {
  return String(text)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

/* --------------------------
   Run setups if pages loaded
   -------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  setupAdmin();
  // optionally init firebase early for faster saves
  // initFirebase();
});
