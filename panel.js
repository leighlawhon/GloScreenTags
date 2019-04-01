
chrome.identity.launchWebAuthFlow(
  { 'url': 'https://app.gitkraken.com/oauth/authorize?client_id=bn68kgxxiikgfjj8dh41&redirect_uri=https://laakphkcneokcnkadpjncgidbmeghpbg.chromiumapp.org/provider_cb&response_type=code&scope=board:read board:write user:read', 'interactive': true },
  function (redirect_url) {

    const code = getUrlVars(redirect_url, "code");
    const url = "https://api.gitkraken.com/oauth/access_token";
    const bodyData = {
      grant_type: "authorization_code",
      client_id: "bn68kgxxiikgfjj8dh41",
      client_secret: "4ff9504tgy3f0k3w7dla5rfl7ix13v2zl0rsvjp5",
      code: code,
      scope: "board:read board:write user:read",
    }
    postData(url, bodyData)
      .then(data => {
        const baseUrl = 'https://gloapi.gitkraken.com/v1/glo/'
        const accessToken = '?access_token=' + data.access_token;

        getData(baseUrl + '/boards' + accessToken)
          .then(data => {
            const boardSelect = document.getElementById('board_select');
            createBoardDropDown(data, boardSelect);
            listenToBoardSelect(boardSelect, baseUrl, accessToken);
          })
      })
      .catch(error => console.error(error));
  });

function getUrlVars(url_string, v) {
  var url = new URL(url_string);
  var code = url.searchParams.get(v);
  return code;
}

function postData(url, data) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json());
}

function getData(url) {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.json());
}

function createBoardDropDown(data, boardSelect) {
  const contentDiv = document.getElementById('board_content');
  contentDiv.innerHTML = data[0].name;
  data.forEach((opt, i) => {
    boardSelect.options[i] = new Option(opt.name, opt.id);
  });
}

function listenToBoardSelect(boardSelect, baseUrl, accessToken) {
  boardSelect.addEventListener('change', (e) => {
    const boardId = e.target.value;
    getData(baseUrl + 'boards/' + boardId + accessToken + '&fields=columns')
    getData(baseUrl + 'boards/' + boardId + '/cards' + accessToken)
      .then((cards) => {
        const columns = parseColumns(cards);
        const contentCont = document.getElementById('board_content');
        contentCont.innerHTML = '';
        columns.forEach(column => {
          let colDiv = document.createElement('div');
          getData(baseUrl + 'boards/' + boardId + '/columns/' + column.column_id + '/cards' + accessToken)
            .then(cards => {
              listenForChanges(baseUrl, boardId, accessToken);
              cards.forEach(card => {
                const commentUrl = baseUrl + 'boards/' + boardId + '/cards/' + card.id + '/comments' + accessToken;
                const attachmentsUrl = baseUrl + 'boards/' + boardId + '/cards/' + card.id + '/attachments' + accessToken;
                renderComment(card, colDiv, commentUrl)
              })
            })
            .then(() => {
              colDiv.className = "col";
              contentCont.appendChild(colDiv)
            });

        })

      });
  })
}
function listenForChanges(baseUrl, boardId, accessToken) {
  chrome.runtime.onMessage.addListener(
    function (msg, sender, sendResponse) {
      if (msg.from = "content") {
        if (msg.subject = "editCommentPosition") {
          const url = baseUrl + "boards/" + boardId + "/cards/" + msg.message.cardId + "/comments/" + msg.message.id + accessToken;
          chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            const commentBody = {
              text: 'gloScreenTag=' + tabs[0].url + '?gloScreenTag=true&x=' + msg.message.posX + '&y=' + msg.message.posY + ' ' + 'gloScreenTagText=' + msg.message.comment,
            }
            postData(url, commentBody)
              .then((comment) => {
                checkForTags([comment], msg.message.cardId)
              })
          });

        }
        if (msg.subject = "saveComment") {
          chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            const commentBody = {
              text: 'gloScreenTag=' + tabs[0].url + '?gloScreenTag=true&x=' + msg.message.posX + '&y=' + msg.message.posY + ' ' + 'gloScreenTagText=' + msg.message.comment,
            }
            const url = baseUrl + "boards/" + boardId + "/cards/" + msg.message.cardId + "/comments/" + msg.message.id + accessToken;
            postData(url, commentBody)
              .then((comment) => {
                // checkForTags([comment], msg.message.cardId)
              })
          });

        }
      }
      return true;
    });
}
function renderComment(card, col, commentUrl) {
  const cardCont = document.createElement('div');
  cardCont.className = "border row p-3";
  const addCommentTagBtn = document.createElement('button');
  addCommentTagBtn.className = "btn btn-link float-right pt-0 pb-0"
  addCommentTagBtn.innerHTML = "+";
  addCommentTagBtn.addEventListener('click', (e) => addCommentTag(e, card.id, commentUrl))
  const nameCont = document.createElement('div');
  nameCont.className = "float-left"
  nameCont.innerHTML = card.name;

  // cardCont.style.border = "thin blue solid";
  // cardCont.addEventListener('click', (e) => {
  createCard(card, commentUrl);
  //   // chrome.tabs.create({ url: 'https://www.cnn.com', active: true });
  // }, false)
  cardCont.appendChild(nameCont);
  cardCont.appendChild(addCommentTagBtn);

  col.appendChild(cardCont);
}
function createCard(card, commentUrl) {
  // e.stopPropagation();
  const mainCont = document.getElementById('card');
  mainCont.innerHTML = '';
  getData(commentUrl)
    .then((comments) => {
      const cardDiv = document.createElement('div');
      cardDiv.id = card.id;
      const nameCont = document.createElement('h3');

      const commentsCont = document.createElement('div');
      // commentsCont.appendChild(commentP);
      nameCont.innerHTML = card.name;
      cardDiv.appendChild(nameCont)
      cardDiv.appendChild(commentsCont);
      mainCont.appendChild(cardDiv);
      checkForTags(comments, card.id);
    })
}
function parseColumns(cards) {
  const result = [];
  const map = new Map();
  for (const card of cards) {
    if (!map.has(card.column_id)) {
      map.set(card.column_id, true);    // set any value to Map
      result.push({
        column_id: card.column_id,
      });
    }
  }
  return result
}

function checkForTags(comments, cardId) {
  comments.forEach((comment) => {
    deleteTag(comment.id);
    // const commentP = document.createElement('p');
    //   var converter = new showdown.Converter(),
    //     html = converter.makeHtml(comment.text);
    //   commentP.innerHTML = html;
    if (comment.text && comment.text.substring(0, 13) === 'gloScreenTag=') {
      const extractedUrl = extractGloScreenTag(comment.text)
      sendMessage("renderComment", { url: extractedUrl.url, json: extractedUrl.json, id: comment.id, cardId, commentText: extractedUrl.commentText })
    }
    // commentCont.innerHTML = html;
    // commentsCont.appendChild(commentCont);
  });

  return;
}
function deleteTag(id) {
  sendMessage("deleteCommentTag", id)
}
function sendMessage(sub, msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { from: 'panel', subject: sub, message: msg },
      function () { });
  });
}
function addCommentTag(e, id, url) {
  e.stopPropagation();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const bodyData = {
      text: 'gloScreenTag=' + tabs[0].url + '?gloScreenTag=true&x=100&y=100}',
    }
    postData(url, bodyData)
      .then((comment) => {
        alert(JSON.stringify(comment))
        const extractedUrl = extractGloScreenTag(comment.text)
        sendMessage("renderComment", { url: extractedUrl.url, json: extractedUrl.json, id: comment.id, cardId: comment.card_id, commentText: extractedUrl.commentText })
      })
  });

}

function extractGloScreenTag(comment) {
  if (comment.substring(0, 13) === 'gloScreenTag=') {
    const commentUrl = comment.split("gloScreenTagText=")[0];
    const commentText = comment.split("gloScreenTagText=")[1];
    const urlString = commentUrl.substring(13, commentUrl.length);
    let json = {};
    const gloScreenTag = getUrlVars(urlString, 'gloScreenTag');
    if (gloScreenTag) {
      x = getUrlVars(urlString, 'x');
      y = getUrlVars(urlString, 'y');
    }
    const url = urlString.split('?')[0];
    json = { x, y };
    return { url, json, commentText }
  }

}
