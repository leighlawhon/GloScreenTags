// var port = chrome.runtime.connect({
//   name: "panel"
// });
// port.onMessage.addListener(function (msg) {
//   alert(msg + "message in panel");
//   return true;
// });


chrome.identity.launchWebAuthFlow(
  { 'url': 'https://app.gitkraken.com/oauth/authorize?client_id=bn68kgxxiikgfjj8dh41&redirect_uri=https://oopbgfmibjiipmjepkbcefekfeogigkp.chromiumapp.org/provider_cb&response_type=code&scope=board:read board:write user:read', 'interactive': true },
  function (redirect_url) {
    // alert(redirect_url);
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
            // alert(JSON.stringify(data))
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
  // alert(url + "fetch")
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
    // .then(boards => alert(JSON.stringify(boards)))
    getData(baseUrl + 'boards/' + boardId + '/cards' + accessToken)
      .then((cards) => {
        const columns = parseColumns(cards);
        const contentCont = document.getElementById('board_content');
        contentCont.innerHTML = '';
        columns.forEach(column => {
          let colDiv = document.createElement('div');
          getData(baseUrl + 'boards/' + boardId + '/columns/' + column.column_id + '/cards' + accessToken)
            .then(cards => {
              chrome.runtime.onMessage.addListener(
                function (msg, sender, sendResponse) {
                  // alert(msg + "panel");
                  if (msg.from = "content") {
                    if (msg.subject = "editCommentPosition") {
                      const commentBody = {
                        text: '{"gloScreenTag" : {"url": "https://dog.ceo/dog-api/documentation/", "x": ' + msg.message.posX + ', "y": "100", "w": "50", "h":"50"}}'
                      }
                      postData(baseUrl + "boards/" + boardId + "/cards/" + msg.message.cardId + "/comments/" + msg.message.id + accessToken, commentBody)
                        .then((card) => {
                          alert(JSON.stringify(card) + "card recieved")
                        })
                    }
                  }

                  // chrome.runtime.sendMessage("background")
                  // Note: Returning true is required here!
                  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
                  return true;
                });
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
function renderComment(card, col, commentUrl) {
  const cardCont = document.createElement('div');
  const addCommentBtn = document.createElement('button');
  addCommentBtn.innerHTML = "+";
  addCommentBtn.addEventListener('click', (e) => addComment(e, card.id, commentUrl))
  cardCont.innerHTML = card.name;
  cardCont.style.border = "thin blue solid";
  // cardCont.addEventListener('click', (e) => {
  createCard(card, commentUrl);
  //   // chrome.tabs.create({ url: 'https://www.cnn.com', active: true });
  // }, false)
  cardCont.appendChild(addCommentBtn);
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
      comments.forEach((comment) => {
        const commentCont = document.createElement('p');
        var converter = new showdown.Converter(),
          html = converter.makeHtml(comment.text);
        checkForTags(comment.text, comment.id, card.id);
        commentCont.innerHTML = html;
        commentsCont.appendChild(commentCont);
      });
      nameCont.innerHTML = card.name;
      cardDiv.appendChild(nameCont)
      cardDiv.appendChild(commentsCont);
      mainCont.appendChild(cardDiv);
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

function checkForTags(comment, id, cardId) {
  if (comment[0] === '{' && comment[comment.length - 1] === '}' && comment.substring(2, 14) === 'gloScreenTag') {
    const json = JSON.parse(comment);
    sendMessage("renderComment", { json: json, id: id, cardId })
  }
  return;
}
function sendMessage(sub, msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { from: 'panel', subject: sub, message: msg },
      function () { });
  });
}
function addComment(e, id, url) {
  e.stopPropagation();
  sendMessage("addComment", { id, id });
  const bodyData = {
    text: '{"gloScreenTag" : {"url": "https://dog.ceo/dog-api/documentation/", "x": "100", "y": "100", "w": "50", "h":"50"}}',
  }
  postData(url, bodyData)
}
