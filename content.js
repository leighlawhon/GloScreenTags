chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'panel') {

    if (msg.subject === "addComment") {
      // renderComment("20", "20", "50", "50", msg.json, msg.id)
    }
    if (msg.subject === "deleteCommentTag") {
      deleteCommentTag(msg.message)
    }
    if (msg.subject === "renderComment") {
      const commentUrl = msg.message.url
      const currentUrl = window.location.toString();
      if (commentUrl === currentUrl) {
        const x = msg.message.json.x,
          y = msg.message.json.y;
        renderComment(x, y, msg.message.json, msg.message.id, msg.message.cardId, msg.message.commentText)
      }
    }
  }
  return true;
});
function renderComment(x, y, json, id, cardId, commentText) {
  const renderDiv = document.createElement('div');
  renderDiv.style.position = 'absolute';
  renderDiv.id = id;
  renderDiv.setAttribute('data-modal', "closed")
  renderDiv.setAttribute('data-card', cardId);
  renderDiv.style.width = "50px";
  renderDiv.style.position = "relative";
  renderDiv.style.height = "50px";
  renderDiv.style.top = y + "px";
  renderDiv.style.left = x + "px";
  var image = document.createElement("img");
  image.src = chrome.runtime.getURL("GloScreenTags48.png");
  renderDiv.style.backgroundImage = 'url(' + chrome.runtime.getURL("GloScreenTags48.png") + ')';
  renderDiv.addEventListener("click", openModal);
  // renderDiv.appendChild(image)
  renderDiv.style.zIndex = 2000000089;
  renderDiv.draggable = true;
  renderDiv.addEventListener("dragend", dragEnd);
  document.body.appendChild(renderDiv);
}

function deleteCommentTag(id) {
  const tagToDelete = document.getElementById(id);
  if (tagToDelete) {
    tagToDelete.parentNode.removeChild(tagToDelete);
  }
}
function openModal(e) {
  const renderDiv = e.target;
  let dataModalAttr = renderDiv.getAttribute("data-modal");
  renderDiv.setAttribute("data-modal", dataModalAttr === "open" ? "closed" : "open");
  dataModalAttr = renderDiv.getAttribute("data-modal");
  if (dataModalAttr === "open") {
    const commentInput = renderCommentInput("test");
    renderDiv.appendChild(commentInput);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = "x";
    renderDiv.appendChild(closeBtn);
    const saveBtn = document.createElement('button');
    closeBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', (e) => {
      chrome.runtime.sendMessage({ from: "content", subject: "saveComment", message: { id, posX: x, posY: y, cardId: cardId, comment: commentInput.value } });
    })
    renderDiv.appendChild(saveBtn);
    renderDiv.removeEventListener('click', openModal)
  }

}
function dragEnd(ev) {
  chrome.runtime.sendMessage({ from: "content", subject: "editCommentPosition", message: { id: ev.target.id, posX: ev.clientX, posY: ev.clientY, cardId: ev.target.getAttribute('data-card') }, });
}
function closeModal(e) {
  let element = e.target.parentNode;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  element.setAttribute("data-modal", "closed");
  element.addEventListener('click', openModal);
}
function renderCommentInput(commentText) {
  const commentInput = document.createElement('input');
  commentInput.type = "textarea";
  if (commentText) {
    commentInput.value = commentText;
  }

  commentInput.style = "background-color: white; width: 100px; height: 100px; position: absolute; top: 55px; padding: 15px;"
  return commentInput
}