function getUrl () {
  return "/todos";
}

// `window.fetch` won't be standardized for decades
function createTodo(title) {
  const req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("POST", getUrl() + "?title=" + title);
  req.send();
}
