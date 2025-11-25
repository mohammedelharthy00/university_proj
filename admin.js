const STORAGE_KEY = 'eelu_users_v2';

const userForm = document.getElementById('userForm');
const firstName = document.getElementById('firstName');
const middleName = document.getElementById('middleName');
const lastName = document.getElementById('lastName');
const phone = document.getElementById('phone');
const gender = document.getElementById('gender');

const email = document.getElementById('email');
const role = document.getElementById('role');
const joinCode = document.getElementById('joinCode');

const usersTbody = document.getElementById('usersTbody');
const emptyState = document.getElementById('emptyState');
const filterRole = document.getElementById('filterRole');
const searchInput = document.getElementById('search');
const clearFormBtn = document.getElementById('clearForm');
const genManyBtn = document.getElementById('genMany');
const clearAllBtn = document.getElementById('clearAll');

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

let users = loadUsers();
render();


userForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const f = firstName.value.trim();
  const m = middleName.value.trim();
  const l = lastName.value.trim();
  const mail = email.value.trim();
  const r = role.value;
  const ph = phone.value.trim();
  const g = gender.value;

  if (!f || !l) {
    alert("Please enter first and last name.");
    return;
  }

  let code = joinCode.value.trim();
  if (code && users.some(u => u.joinCode === code)) {
    alert("The join code already exists.");
    return;
  }
  if (!code) code = generateCode();

  const id = Date.now().toString();

  const fullName = `${f} ${m ? m + " " : ""}${l}`.trim();

  const user = {
    id,
    firstName: f,
    middleName: m,
    lastName: l,
    fullName,
    phone: ph,
    gender: g,
    email: mail,
    role: r,
    joinCode: code
  };

  users.push(user);
  saveUsers();
  render();
  userForm.reset();
});

clearFormBtn.addEventListener('click', () => userForm.reset());

genManyBtn.addEventListener('click', () => {
  const samples = [
    ["Mahmoud", "", "Fares", "0100000001", "male", "student"],
    ["Sara", "Ali", "Hassan", "0100000002", "female", "student"],
    ["Mariam", "", "Abd", "0100000003", "female", "ta"],
    ["Ahmed", "", "Noor", "0100000004", "male", "prof"],
    ["Khaled", "", "Samir", "0100000005", "male", "ta"]
  ];

  samples.forEach(s => {
    const id = (Date.now() + Math.random()).toString();
    users.push({
      id,
      firstName: s[0],
      middleName: s[1],
      lastName: s[2],
      fullName: `${s[0]} ${s[1]} ${s[2]}`.trim(),
      phone: s[3],
      gender: s[4],
      email: "",
      role: s[5],
      joinCode: generateCode()
    });
  });

  saveUsers();
  render();
});

clearAllBtn.addEventListener('click', () => {
  if (confirm("Delete ALL users?")) {
    users = [];
    saveUsers();
    render();
  }
});

filterRole.addEventListener('change', render);
searchInput.addEventListener('input', render);

exportBtn.addEventListener('click', () => {
  const csv = toCSV(users);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "users.csv";
  a.click();

  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    const parsed = fromCSV(text);

    parsed.forEach(p => {
      if (!users.some(u => u.joinCode === p.joinCode)) users.push(p);
    });

    saveUsers();
    render();
    alert("Users imported successfully");
  };

  reader.readAsText(file, "utf-8");
});


function render() {
  const q = searchInput.value.trim().toLowerCase();
  const fr = filterRole.value;

  usersTbody.innerHTML = "";

  const filtered = users.filter(u => {
    if (fr !== "all" && u.role !== fr) return false;
    if (!q) return true;

    return (
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.joinCode || "").toLowerCase().includes(q)
    );
  });

  emptyState.style.display = filtered.length ? "none" : "block";

  filtered.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div style="font-weight:600">${escapeHtml(u.fullName)}</div>
        <div style="font-size:12px;color:#94a3b8">${escapeHtml(u.gender)} • ${escapeHtml(u.phone)}</div>
      </td>

      <td>${escapeHtml(u.email || "—")}</td>
      <td>${roleBadge(u.role)}</td>

      <td>
          <span class="code-pill">${escapeHtml(u.joinCode)}</span>
          <button class="btn-copy" data-code="${escapeHtml(u.joinCode)}">Copy</button>
      </td>

      <td>
        <button class="small ghost" data-id="${u.id}" data-action="edit">Edit</button>
        <button class="small" data-id="${u.id}" data-action="delete">Delete</button>
      </td>
    `;

    usersTbody.appendChild(tr);
  });

  usersTbody.querySelectorAll("button").forEach(b => {
    const action = b.dataset.action;

    if (action === "delete")
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (!confirm("Delete this user?")) return;
        users = users.filter(x => x.id !== id);
        saveUsers();
        render();
      });

    if (action === "edit")
      b.addEventListener("click", () => {
        const u = users.find(x => x.id === b.dataset.id);
        if (!u) return;

        firstName.value = u.firstName;
        middleName.value = u.middleName;
        lastName.value = u.lastName;
        phone.value = u.phone;
        gender.value = u.gender;

        email.value = u.email;
        role.value = u.role;
        joinCode.value = u.joinCode;

        window.scrollTo({ top: 0, behavior: "smooth" });
      });

    if (b.classList.contains("btn-copy"))
      b.addEventListener("click", () => {
        copyToClipboard(b.dataset.code);
        alert("Code copied");
      });
  });
}


function roleBadge(r) {
  if (r === "student") return `<span class="role-badge role-student">Student</span>`;
  if (r === "ta") return `<span class="role-badge role-ta">TA</span>`;
  return `<span class="role-badge role-prof">Professor</span>`;
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function generateCode(len = 6) {
  const chars = "0123456789S";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  if (users.some(u => u.joinCode === out)) return generateCode(len);
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text);
}


function toCSV(arr) {
  const header =
    "id,firstName,middleName,lastName,fullName,phone,gender,email,role,joinCode";

  const lines = arr.map(u =>
    [
      u.id,
      u.firstName,
      u.middleName,
      u.lastName,
      u.fullName,
      u.phone,
      u.gender,
      u.email,
      u.role,
      u.joinCode
    ]
      .map(x => `"${String(x || "").replace(/"/g, '""')}"`)
      .join(",")
  );

  return header + "\n" + lines.join("\n");
}

function fromCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const out = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 10) continue;

    out.push({
      id: cols[0],
      firstName: cols[1],
      middleName: cols[2],
      lastName: cols[3],
      fullName: cols[4],
      phone: cols[5],
      gender: cols[6],
      email: cols[7],
      role: cols[8],
      joinCode: cols[9]
    });
  }

  return out;
}

function parseCSVLine(line) {
  const res = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      res.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  res.push(cur);
  return res.map(s => s.trim());
}
