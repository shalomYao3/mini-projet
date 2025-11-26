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

// --- TASKS ---
// Création de tâche
const taskForm = document.getElementById("task-form");
if (taskForm) {
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    const res = await fetch(`${API_URL}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ title, description })
    });

    if (res.ok) {
      loadTasks();
    } else {
      alert("Erreur lors de la création de la tâche");
    }
  });
}

// Chargement des tâches
async function loadTasks() {
  const res = await fetch(`${API_URL}/tasks/`, {
    headers: { "Authorization": "Bearer " + token }
  });
  if (res.ok) {
    const tasks = await res.json();
    const list = document.getElementById("task-list");
    list.innerHTML = "";
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.title} - ${task.description} ${task.completed ? "✅" : "❌"}`;
      list.appendChild(li);
    });
  }
}
if (document.getElementById("task-list")) loadTasks();

// --- GROUPS ---
// Création de groupe
const createGroupForm = document.getElementById("create-group-form");
if (createGroupForm) {
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("group-name").value;

    const res = await fetch(`${API_URL}/groups/create`, {
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

    const res = await fetch(`${API_URL}/groups/join`, {
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
