const API_URL = "http://127.0.0.1:8000";
let token = localStorage.getItem("access_token");

// --- NAVBAR ---
async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    const res = await fetch("navbar.html");
    const html = await res.text();
    navbarContainer.innerHTML = html;

    const navLinks = document.getElementById("nav-links");
    const logoutBtn = document.getElementById("logout-btn");

    if (token) {
      // Utilisateur connecté
      navLinks.innerHTML = `
        <a href="index.html">Accueil</a>
        <a href="dashboard.html">Tableau de bord</a>
        <a href="tasks.html">Mes tâches</a>
        <a href="groups.html">Mes groupes</a>
      `;
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        window.location.href = "login.html";
      });
    } else {
      // Utilisateur non connecté
      navLinks.innerHTML = `
        <a href="login.html">Connexion</a>
        <a href="register.html">Inscription</a>
      `;
      logoutBtn.style.display = "none";
    }
  }
}
loadNavbar();

// --- AUTH ---
// Connexion
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "dashboard.html";
    } else {
      alert("Échec de connexion");
    }
  });
}

// Inscription
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      alert("Inscription réussie, vous pouvez vous connecter !");
      window.location.href = "login.html";
    } else {
      alert("Erreur lors de l'inscription");
    }
  });
}

// ==============================
//      GESTION DES TÂCHES
// ==============================

const taskForm = document.getElementById("task-form");
const groupSelect = document.getElementById("group-select");

async function loadGroupsForSelect() {
  /*if (!groupSelect) return;*/
  const res = await fetch(`${API_URL}/groups/`, {
    headers: { "Authorization": "Bearer " + token }
  });
  /*groupSelect.innerHTML = `<option value="">— Aucun —</option>`;*/
  if (!res.ok) return;
  const groups = await res.json();
  const select = document.getElementById("group-select");

  if (!select) return;

  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    groupSelect.appendChild(opt);
  });
}

loadGroupsForSelect();

// Création d'une tâche
if (taskForm) {
  // fill group select initially
  loadGroupsForSelect();

  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;
    const deadlineRaw = document.getElementById("deadline").value;
    const group_id_raw = document.getElementById("group-select").value;

    const body = {
      title,
      description: description || null,
      status: status || "todo",
      deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : null,
      group_id: group_id_raw ? parseInt(group_id_raw) : null
    };
    const group_id = document.getElementById("group-select").value || null;

    const res = await fetch(`${API_URL}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ title, description, group_id })
    });

    if (res.ok) {
      taskForm.reset();
      loadGroupsForSelect(); // in case groups changed
      loadTasks();
    } else {
      const txt = await res.text();
      alert("Erreur lors de la création de la tâche: " + txt);
    }
  });
}


// ==============================
//      Charger les tâches
// ==============================
async function loadTasks() {
  const res = await fetch(`${API_URL}/tasks/`, {
    headers: { "Authorization": "Bearer " + token }
  });

  if (!res.ok) {
    alert("Impossible de charger les tâches");
    return;
  }

  const tasks = await res.json();
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    const deadlineText = task.deadline ? formatDateLocal(task.deadline) : "—";

    li.innerHTML = `
      <div class="task-info">
        <h3>${escapeHtml(task.title)}</h3>
        <p>${escapeHtml(task.description || "")}</p>
        <p class="task-group">Groupe : ${task.group_id || "Aucun"}</p>
        <p class="meta">Statut: <strong>${statusLabel(task.status)}</strong> • Deadline: <strong>${deadlineText}</strong> ${task.group_id ? `• Groupe: ${task.group_id}` : ""}</p>
      </div>

      <div class="task-actions">
        <button class="btn secondary edit-btn" data-id="${task.id}">Modifier</button>
        <button class="btn danger delete-btn" data-id="${task.id}">Supprimer</button>
      </div>
    `;

    list.appendChild(li);
  });

  addTaskButtonsEvents();
}

if (document.getElementById("task-list")) {
  loadTasks();
  // refresh groups select when page loaded
  loadGroupsForSelect();
}


// helper: format ISO string to local datetime-local friendly text for display
function formatDateLocal(iso) {
  try {
    const d = new Date(iso);
    // show readable: 2025-11-28 14:30
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function statusLabel(code) {
  switch (code) {
    case "in_progress": return "En cours";
    case "done": return "Terminé";
    default: return "À faire";
  }
}

// basic text escape for safe insertion
function escapeHtml(text) {
  return (text + "").replace(/[&<>"']/g, function(m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}


// ==============================
//   Ajouter les événements boutons
// ==============================
function addTaskButtonsEvents() {
  // Boutons Supprimer
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.removeEventListener?.("click", null); // best effort remove
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Confirmer la suppression ?")) return;

      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      });

      if (res.ok) {
        loadTasks();
      } else {
        alert("Erreur lors de la suppression");
      }
    });
  });

  // Boutons Modifier
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.removeEventListener?.("click", null);
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      openEditModal(id);
    });
  });
}


// ==============================
//     MODAL D'ÉDITION
// ==============================

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-task-form");
const closeModalBtn = document.getElementById("close-modal");
const editGroupSelect = document.getElementById("edit-group-select");

// Ouvrir le modal avec les données existantes
async function openEditModal(id) {
  // fetch tasks (could be optimized with /tasks/{id} route)
  const res = await fetch(`${API_URL}/tasks/`, {
    headers: { "Authorization": "Bearer " + token }
  });
  if (!res.ok) return;
  const tasks = await res.json();
  const task = tasks.find(t => t.id == id);
  if (!task) return;

  // fill edit group select
  await loadGroupsForEditSelect();

  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-description").value = task.description || "";
  document.getElementById("edit-status").value = task.status || "todo";

  // set deadline for datetime-local input: needs yyyy-MM-ddTHH:mm
  if (task.deadline) {
    const d = new Date(task.deadline);
    const local = d.toISOString().slice(0,16);
    document.getElementById("edit-deadline").value = local;
  } else {
    document.getElementById("edit-deadline").value = "";
  }

  document.getElementById("edit-task-id").value = task.id;
  // set edit-group-select value
  if (editGroupSelect && task.group_id) {
    editGroupSelect.value = task.group_id;
  } else if (editGroupSelect) {
    editGroupSelect.value = "";
  }

  editModal.classList.remove("hidden");
}


// Fermer le modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });
}

async function loadGroupsForEditSelect() {
  if (!editGroupSelect) return;
  const res = await fetch(`${API_URL}/groups/`, {
    headers: { "Authorization": "Bearer " + token }
  });
  editGroupSelect.innerHTML = `<option value="">— Aucun —</option>`;
  if (!res.ok) return;
  const groups = await res.json();
  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    editGroupSelect.appendChild(opt);
  });
}


// Soumettre la modification
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("edit-task-id").value;
    const title = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const status = document.getElementById("edit-status").value;
    const deadlineRaw = document.getElementById("edit-deadline").value;
    const groupSel = document.getElementById("edit-group-select").value;

    const body = {
      // send only fields we want to change
      ...(title ? { title } : {}),
      description: description || null,
      status: status || "todo",
      deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : null,
      group_id: groupSel ? parseInt(groupSel) : null
    };

    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      editModal.classList.add("hidden");
      loadTasks();
    } else {
      const txt = await res.text();
      alert("Erreur lors de la mise à jour de la tâche: " + txt);
    }
  });
}



// --- GROUPS ---
// Création de groupe
const createGroupForm = document.getElementById("create-group-form");
if (createGroupForm) {
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("group-name").value;

    const res = await fetch(`${API_URL}/groups/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ name })
    });

    if (res.ok) {
      loadGroups();
    } else {
      alert("Erreur lors de la création du groupe");
    }
  });
}

// Rejoindre un groupe
const joinGroupForm = document.getElementById("join-group-form");
if (joinGroupForm) {
  joinGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const group_id = document.getElementById("group-id").value;

    const res = await fetch(`${API_URL}/groups/${group_id}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ group_id: parseInt(group_id) })
    });

    if (res.ok) {
      alert("Groupe rejoint !");
      loadGroups();
    } else {
      alert("Erreur lors de l’adhésion au groupe");
    }
  });
}

// Chargement des groupes
async function loadGroups() {
  const res = await fetch(`${API_URL}/groups/`, {
    headers: { "Authorization": "Bearer " + token }
  });
  if (res.ok) {
    const groups = await res.json();
    const list = document.getElementById("group-list");
    list.innerHTML = "";
    groups.forEach(group => {
      const li = document.createElement("li");
      li.textContent = `${group.name} (ID: ${group.id})`;
      list.appendChild(li);
    });
  }
}
if (document.getElementById("group-list")) loadGroups();

async function generateInvite(groupId) {
  const res = await fetch(`${API_URL}/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();
  alert("Lien d'invitation : " + data.invite_link);
}

