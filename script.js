fetch("http://localhost:3000/tasks")
  .then((data) => data.json())
  .then((data) => {
    data.forEach((task) => {
      const { id, title, description, isInProgress, completed } = task;
      const toDoTask = createACard(title, description);
      toDoTask.setAttribute("data-task-id", id);
      if (completed) {
        const done = document.querySelector(".done");
        done.appendChild(toDoTask);
      } else if (isInProgress) {
        const inProgress = document.querySelector(".in-progress");
        inProgress.appendChild(toDoTask);
      } else {
        const toDo = document.querySelector(".todo");
        toDo.appendChild(toDoTask);
      }
    });
  });

function createADate() {
  let objectDate = new Date();
  let day = objectDate.getDate();
  let month = objectDate.getMonth();
  let year = objectDate.getFullYear();
  return day + "/" + (month + 1) + "/" + year;
}

function createACard(title, description) {
  const card_title = document.createElement("h2");
  card_title.textContent = title;
  const content = document.createElement("p");
  content.textContent = description;
  const date = document.createElement("small");
  date.textContent = createADate();
  const toDoTask = document.createElement("li");
  toDoTask.appendChild(card_title);
  toDoTask.appendChild(date);
  toDoTask.appendChild(content);
  toDoTask.classList.add("todo_item");
  toDoTask.addEventListener("click", (event) =>
    event.target.classList.toggle("selected")
  );
  return toDoTask;
}

function moveTodoInProgress(card) {
  const toDo = document.querySelector(".todo");
  const inProgress = document.querySelector(".in-progress");
  toDo.removeChild(card);
  inProgress.appendChild(card);
  card.classList.remove("selected");
}

function moveInProgressDone(card) {
  const done = document.querySelector(".done");
  const inProgress = document.querySelector(".in-progress");
  inProgress.removeChild(card);
  done.appendChild(card);
  card.classList.remove("selected");
  card.classList.add("to_delete");
}

function updateCardInProgress(card) {
  const body = {
    title: card.children[0].textContent,
    description: card.children[2].textContent,
    isInProgress: true,
    completed: false,
  };
  const callback = (_) => moveTodoInProgress(card);
  requestToServer(
    `http://localhost:3000/tasks/${card.getAttribute("data-task-id")}`,
    "PUT",
    body,
    callback
  );
}

function updateCardDone(card) {
  const body = {
    title: card.children[0].textContent,
    description: card.children[2].textContent,
    isInProgress: false,
    completed: true,
  };
  const callback = (_) => moveInProgressDone(card);
  requestToServer(
    `http://localhost:3000/tasks/${card.getAttribute("data-task-id")}`,
    "PUT",
    body,
    callback
  );
}

function requestToServer(url, method, body, callback) {
  fetch(url, {
    method: method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((data) => {
      if (!data.ok) {
        throw "Cannot fetch data";
      } else {
        return data.json();
      }
    })
    .finally((data) => {
      if (data !== undefined) {
        callback(data);
      }
    });
}

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const title = form.querySelector("input").value;
  const description = form.querySelector("textarea").value;
  const body = {
    title: title,
    description: description,
    isInProgress: false,
    completed: false,
  };
  const callback = (data) => {
    const { id, title, description } = data;
    const toDoTask = createACard(title, description);
    toDoTask.setAttribute("data-task-id", id);
    const toDo = document.querySelector(".todo");
    toDo.appendChild(toDoTask);
  };
  requestToServer("http://localhost:3000/tasks", "POST", body, callback);
  form.reset();
});

document
  .querySelector("#move-to-in-progress")
  .addEventListener("click", (_) => {
    const toDo = document.querySelector(".todo");
    toDo.querySelectorAll(".selected").forEach((card) => {
      updateCardInProgress(card);
    });
  });

document.querySelector("#move-to-done").addEventListener("click", (_) => {
  const inProgress = document.querySelector(".in-progress");
  inProgress.querySelectorAll(".selected").forEach((card) => {
    updateCardDone(card);
  });
});
