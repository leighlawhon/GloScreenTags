

// chrome.browserAction.onClicked.addListener(function (activeTab) {
//   var newURL = "http://stackoverflow.com/";
//   chrome.tabs.create({ url: newURL });
// });

// chrome.browserAction.onClicked.addListener(function (tab) {
//   // for the current tab, inject the "inject.js" file & execute it

//   chrome.tabs.executeScript(tab.ib, {
//     file: 'inject.js'
//   });

// });
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function (response) {
//     alert("message sent");
//   });
// });
// chrome.runtime.onConnect.addListener(function (port) {
//   port.onMessage.addListener(function (msg) {
//     // alert("message recieved BACKGROUND!!!!!" + msg);
//     port.postMessage("Hi Popup.js");
//     if (msg.panel) {
//       chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function (response) {

//           alert("success" + msg.panel)


//         });
//       });
//     }
//   });
// })

// chrome.runtime.onMessage.addListener(function (msg, sender) {
//   // First, validate the message's structure
//   if (msg.from === 'panel') {
//     // Enable the page-action for the requesting tab
//     alert('panel received in background')
//   }
//   return true;
// });