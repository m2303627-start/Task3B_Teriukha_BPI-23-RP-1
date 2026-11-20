"use strict";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";
const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

// DOM
const loadUsersBtn = document.getElementById("loadUsersBtn");
const searchInput = document.getElementById("searchInput");
const statusMessage = document.getElementById("statusMessage");
const usersList = document.getElementById("usersList");
const postsArea = document.getElementById("postsArea");

// Состояние приложения 
let allUsers = []; // загруженный список пользователей

function setStatus(text, type = "") {
  statusMessage.textContent = text;
  statusMessage.className = "status" + (type ? " " + type : "");
}

 function parseJsonOrThrow(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${response.statusText}`);
  }
  return response.json();
}

// Загрузка пользователей 

async function loadUsers() {
  // Сброс предыдущего состояния
  allUsers = [];
  usersList.innerHTML = "";
  postsArea.innerHTML = '<p class="hint">Выберите пользователя и нажмите «Показать публикации».</p>';
  searchInput.value = "";

  loadUsersBtn.disabled = true;
  setStatus("Загрузка...", "loading");

  try {
    const response = await fetch(USERS_URL);
    const users = await parseJsonOrThrow(response);

    allUsers = users;
    renderUsers(allUsers);
    setStatus(`Загружено пользователей: ${users.length}`, "success");
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
    setStatus(
      `Не удалось загрузить пользователей: ${error.message}. Попробуйте ещё раз.`,
      "error"
    );
    usersList.innerHTML = "";
  } finally {
    loadUsersBtn.disabled = false;
  }
}

//Отрисовка пользователей

function renderUsers(users) {
  usersList.innerHTML = "";

  if (users.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Пользователи не найдены";
    usersList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "user-card";

    const name = document.createElement("h3");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.className = "user-email";
    email.textContent = `✉ ${user.email}`;

    const city = document.createElement("p");
    city.className = "user-city";
    city.textContent = `📍 ${user.address?.city ?? "—"}`;

    const postsBtn = document.createElement("button");
    postsBtn.className = "btn btn-secondary";
    postsBtn.textContent = "Показать публикации";
    postsBtn.addEventListener("click", () => showUserPosts(user));

    card.append(name, email, city, postsBtn);
    fragment.appendChild(card);
  });

  usersList.appendChild(fragment);
}

// Поиск по имени

function handleSearch() {
  if (allUsers.length === 0) {
    setStatus("Сначала загрузите пользователей.", "");
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filtered);

  if (query === "") {
    setStatus(`Показаны все пользователи: ${filtered.length}`, "success");
  } else if (filtered.length === 0) {
    setStatus("Пользователи не найдены", "error");
  } else {
    setStatus(`Найдено: ${filtered.length}`, "success");
  }
}



async function showUserPosts(user) {
  postsArea.innerHTML = "";
  setStatus(`Загрузка публикаций: ${user.name}...`, "loading");

  try {
    const response = await fetch(`${POSTS_URL}?userId=${user.id}`);
    const posts = await parseJsonOrThrow(response);

    if (!Array.isArray(posts) || posts.length === 0) {
      postsArea.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "У этого пользователя нет публикаций.";
      postsArea.appendChild(empty);
      setStatus(`Публикации загружены: ${user.name}`, "success");
      return;
    }

    // Первые три публикации
    const firstThree = posts.slice(0, 3);

    const heading = document.createElement("p");
    heading.className = "hint";
    heading.textContent = `Публикации пользователя: ${user.name}`;
    postsArea.appendChild(heading);

    firstThree.forEach((post, index) => {
      const card = document.createElement("article");
      card.className = "post-card";

      const title = document.createElement("h3");
      title.textContent = `${index + 1}. ${post.title}`;

      const body = document.createElement("p");
      body.textContent = post.body;

      card.append(title, body);
      postsArea.appendChild(card);
    });

    setStatus(`Публикации загружены: ${user.name}`, "success");
  } catch (error) {
    console.error("Ошибка загрузки публикаций:", error);
    postsArea.innerHTML = "";
    const errBox = document.createElement("p");
    errBox.className = "empty-message";
    errBox.textContent = `Не удалось загрузить публикации: ${error.message}. Попробуйте ещё раз.`;
    postsArea.appendChild(errBox);
    setStatus("Ошибка загрузки публикаций", "error");
  }
}


loadUsersBtn.addEventListener("click", loadUsers);
searchInput.addEventListener("input", handleSearch);