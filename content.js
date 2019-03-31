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
  renderDiv.textContent = commentText;
  renderDiv.id = id;
  renderDiv.setAttribute('data-card', cardId);
  renderDiv.style.width = "50px";
  renderDiv.style.height = "50px";
  renderDiv.style.top = y + "px";
  renderDiv.style.left = x + "px";
  renderDiv.style.border = "solid 2px blue";
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

function dragEnd(ev) {
  chrome.runtime.sendMessage({ from: "content", subject: "editCommentPosition", message: { id: ev.target.id, posX: ev.clientX, posY: ev.clientY, cardId: ev.target.getAttribute('data-card') }, });
}
