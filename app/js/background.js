var port = chrome.runtime.connectNative('com.project.native_messaging_host');

port.onMessage.addListener(function onNativeMessage(msg) {
    alert(JSON.stringify(msg, null, 2));
});

port.onDisconnect.addListener(function() {
    console.log("Disconnected");
});

let ids2filename = {};

chrome.downloads.onChanged.addListener(function(delta) {
  if (!delta.state ||
      (delta.state.current != 'complete')) {
    if (delta.filename) {
        ids2filename[delta.id] = delta.filename.current;
    }
    return;
  }
  if (delta.state.current == 'complete') {
    port.postMessage({"request" : "Check certificate in file", "filepath" : ids2filename[delta.id]});
  }
});

function openAndCheckCertificate() {
    port.postMessage({"request" : "Open and check certificate"});
}

function openAndSignCertificate() {
    chrome.storage.sync.get({
        privateKey: "",
        certificate: "",
    }, function(items) {
        port.postMessage({"request" : "Open and sign certificate", "privateKey" : items.privateKey, "certificate" : items.certificate});
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "openAndCheck") {
      openAndCheckCertificate();
      sendResponse({message: "OK"});
    }
    else if (request.message === "openAndSign") {
        openAndSignCertificate();
        sendResponse({message: "OK"});
    }
});