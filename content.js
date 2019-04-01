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
  // renderDiv.appendChild(image)
  renderDiv.style.zIndex = 2000000089;
  renderDiv.draggable = true;
  renderDiv.addEventListener("dragend", dragEnd);
  document.body.appendChild(renderDiv);
  renderDiv.addEventListener("click", function (e) { openModal(e, id, x, y, cardId, commentText) });
}

function deleteCommentTag(id) {
  const tagToDelete = document.getElementById(id);
  if (tagToDelete) {
    tagToDelete.parentNode.removeChild(tagToDelete);
  }
}
function openModal(e, id, x, y, cardId, commentText) {
  e.stopPropagation();
  const renderDiv = e.target;
  let dataModalAttr = renderDiv.getAttribute("data-modal");
  renderDiv.setAttribute("data-modal", "open");
  const modalDiv = document.createElement('div');
  modalDiv.className = "card";
  modalDiv.style = "position: absolute; top: 55px;"

  const modalBodyDiv = document.createElement('div');
  modalBodyDiv.style = "padding: 0px 15px 15px; border: thin solid #efefef; background-color: white "
  const commentInput = renderCommentInput(commentText);
  commentInput.className = "border"


  const closeBtn = document.createElement('button');
  closeBtn.className = "btn btn-light col pull-right"
  closeBtn.textContent = "x";
  closeBtn.addEventListener('click', closeModal);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = "Save";
  saveBtn.className = "btn btn-link col"
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ from: "content", subject: "saveComment", message: { id, posX: x, posY: y, cardId: cardId, comment: commentInput.value } });
  })
  const rowDiv = document.createElement('div');
  rowDiv.className = "row";
  rowDiv.appendChild(saveBtn);
  rowDiv.appendChild(closeBtn);
  modalBodyDiv.appendChild(rowDiv);
  modalBodyDiv.appendChild(commentInput);
  modalDiv.appendChild(modalBodyDiv);
  renderDiv.appendChild(modalDiv);

  renderDiv.removeEventListener('click', openModal)
  // }

}
function dragEnd(ev) {
  chrome.runtime.sendMessage({ from: "content", subject: "editCommentPosition", message: { id: ev.target.id, posX: ev.clientX, posY: ev.clientY, cardId: ev.target.getAttribute('data-card') }, });
}
function closeModal(e) {
  e.stopPropagation();
  let element = e.target.parentNode.parentNode.parentNode;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  element.setAttribute("data-modal", "closed");
  // element.addEventListener('click', openModal);
}
function renderCommentInput(commentText) {
  const commentInput = document.createElement('input');
  commentInput.type = "textarea";
  if (commentText) {
    commentInput.value = commentText;
  }
  commentInput.className = "clearfix border"
  return commentInput
}