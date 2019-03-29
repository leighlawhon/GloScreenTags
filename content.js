
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // alert(msg.subject)
  if (msg.from === 'panel') {
    if (msg.subject === "addComment") {
      alert(msg.message)
      const drawDiv = document.createElement('div');
      drawDiv.style.width = "20px";
      drawDiv.style.height = "20px";
      drawDiv.style.position = 'absolute';
      drawDiv.textContent = JSON.stringify(msg.message);
      drawDiv.style.top = "50px";
      drawDiv.style.left = "50px";
      drawDiv.style.border = "solid 2px blue";
      drawDiv.style.zIndex = 2000000089;
      document.body.appendChild(drawDiv);
    }
    if (msg.subject === "renderComment") {
      const commentUrl = msg.message.gloScreenTag.url
      const currentUrl = window.location.toString();
      if (commentUrl === currentUrl) {
        const renderDiv = document.createElement('div');
        renderDiv.style.width = msg.message.gloScreenTag.w + "px";
        renderDiv.style.height = msg.message.gloScreenTag.h + "px";
        renderDiv.style.position = 'absolute';
        renderDiv.textContent = JSON.stringify(msg.message);
        renderDiv.style.top = msg.message.gloScreenTag.y + "px";
        renderDiv.style.left = msg.message.gloScreenTag.x + "px";
        renderDiv.style.border = "solid 2px blue";
        renderDiv.style.zIndex = 2000000089;
        document.body.appendChild(renderDiv);
      }
    }
  }
  return true;
});
