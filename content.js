const pageDiv = document.createElement('div');
pageDiv.id = "pageDiv124";
pageDiv.addEventListener("drop", drop);
pageDiv.addEventListener("dragover", allowDrop);
document.body.appendChild(pageDiv);
window.addEventListener("resize", displayWindowSize);
window.onload = displayWindowSize;

function displayWindowSize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  pageDiv.style.width = windowWidth + "px";
  pageDiv.style.height = windowHeight + "px";
};

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // alert(msg.subject)
  if (msg.from === 'panel') {

    if (msg.subject === "addComment") {
      renderComment("20", "20", "50", "50", msg.json, msg.id)
    }
    if (msg.subject === "renderComment") {
      const commentUrl = msg.message.json.gloScreenTag.url
      const currentUrl = window.location.toString();
      if (commentUrl === currentUrl) {
        const x = msg.message.json.gloScreenTag.x,
          y = msg.message.json.gloScreenTag.y,
          w = msg.message.json.gloScreenTag.w,
          h = msg.message.json.gloScreenTag.h;
        renderComment(x, y, w, h, msg.message.json, msg.message.id)
      }
    }
  }
  return true;
});
function renderComment(x, y, w, h, json, id) {

  const renderDiv = document.createElement('div');
  renderDiv.style.position = 'absolute';
  renderDiv.textContent = JSON.stringify(json);
  renderDiv.id = id;
  renderDiv.style.width = w + "px";
  renderDiv.style.height = h + "px";
  renderDiv.style.top = y + "px";
  renderDiv.style.left = x + "px";
  renderDiv.style.border = "solid 2px blue";
  renderDiv.style.zIndex = 2000000089;
  renderDiv.draggable = true;
  renderDiv.addEventListener("dragend", dragEnd);
  renderDiv.addEventListener("dragstart", dragStart);

  document.body.appendChild(renderDiv);
}

function drop(ev) {
  ev.stopPropagation()
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  alert(data + "--------")
  // ev.target.appendChild(document.getElementById(data));
}

function allowDrop(ev) {
  ev.stopPropagation()
  ev.preventDefault();
}

function dragEnd(ev) {
  var rect = ev.target.getBoundingClientRect();
  // alert(rect.left)var data = ev.dataTransfer.getData("text");
  // var data = ev.dataTransfer.getData("text");

  // alert(data + "--------")
}
function dragStart(ev) {
  ev.stopPropagation()
  // alert(ev.target.id + "+++++++")
  event.dataTransfer.setData("Text", ev.target.id);
}