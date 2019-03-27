// var port = chrome.runtime.connect({
//   name: "panel"
// });

// port.onMessage.addListener(function (msg) {
//   // alert("message recieved devtools" + msg);
// });
chrome.identity.launchWebAuthFlow(
  { 'url': 'https://app.gitkraken.com/oauth/authorize?client_id=bn68kgxxiikgfjj8dh41&redirect_uri=https://acjimbandajfnicpmppamaihgheigooi.chromiumapp.org/provider_cb&response_type=code&scope=board:read board:write user:read&state=IleftMymittens', 'interactive': true },
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

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { from: 'panel', subject: accessToken },
            function () { });
        });

        getData(baseUrl + '/boards' + accessToken)
          .then(data => {
            const boardSelect = document.getElementById('board_select');
            alert(JSON.stringify(data))
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
      .then(boards => alert(JSON.stringify(boards)))
    getData(baseUrl + 'boards/' + boardId + '/cards' + accessToken)
      .then((cards) => {
        const columns = parseColumns(cards);
        const contentCont = document.getElementById('board_content');
        contentCont.innerHTML = '';
        columns.forEach(column => {
          let colDiv = document.createElement('div');
          getData(baseUrl + 'boards/' + boardId + '/columns/' + column.column_id + '/cards' + accessToken)
            .then(cards => {
              cards.forEach(card => {
                const commentUrl = baseUrl + 'boards/' + boardId + '/cards/' + card.id + '/comments' + accessToken;
                const attachmentsUrl = baseUrl + 'boards/' + boardId + '/cards/' + card.id + '/attachments' + accessToken;
                renderCard(card, colDiv, commentUrl)
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
function renderCard(card, col, commentUrl) {
  const cardCont = document.createElement('div');
  cardCont.innerHTML = card.name;
  cardCont.addEventListener('click', (e) => {
    createCard(card, commentUrl);
    chrome.tabs.create({ url: 'https://www.cnn.com', active: true });
  })
  col.appendChild(cardCont);
}
function createCard(card, commentUrl) {
  const mainCont = document.getElementById('card');
  mainCont.innerHTML = '';
  getData(commentUrl)
    .then((comments) => {
      const nameCont = document.createElement('h3');
      const commentsCont = document.createElement('div');
      comments.forEach((comment => {
        const commentCont = document.createElement('p');
        var converter = new showdown.Converter(),
          html = converter.makeHtml(comment.text);
        parseComments(comment.text, mainCont);
        commentCont.innerHTML = html;
        commentsCont.appendChild(commentCont);
      }))
      nameCont.innerHTML = card.name;
      mainCont.appendChild(nameCont)
      mainCont.appendChild(commentsCont)
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

function parseComments(comment, mainCont) {
  if (comment[0] === '{' && comment[comment.length - 1] === '}' && comment.substring(2, 14) === 'gloScreenTag') {
    const url = JSON.parse(comment);
    // alert(url.gloScreenTag.url)
    let iframe = document.createElement('a');
    iframe.text = "testing"
    iframe.href = 'https://app.gitkraken.com/glo/board/WpoBup0TPw8Aocqg/card/WpoCEZ0TPw8Aocql';
    // iframe.width = url.gloScreenTag.w;
    // iframe.height = url.gloScreenTag.h;
    mainCont.appendChild(iframe);
  }
}

