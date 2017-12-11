const APP_NAME = 'videocall';

function connect() {
  easyrtc.setPeerListener(addToConversation, 'message')
  easyrtc.setRoomOccupantListener(callEverybodyElse);
  easyrtc.easyApp(APP_NAME, "selfVideo",
    ["callerVideo1", "callerVideo2", "callerVideo3"],
    loginSuccess, loginFailure);
}

function enableVideo () {
  easyrtc.enableCamera(true);
}

function muteVideo () {
  easyrtc.enableCamera(false);
}

function enableAudio () {
  easyrtc.enableMicrophone(true);
}

function muteAudio () {
  easyrtc.enableMicrophone(false)
}

function listVideoDevices () {
  easyrtc.getVideoSourceList(list => {
    let devices = document.getElementById('devices');
    console.log(list);
    for (let i = 0; i < list.length; i++) {
      console.log(list[i].label);
      let button = document.createElement('button');
      button.appendChild(document.createTextNode(list[i].label));
      button.onclick = () => {
        easyrtc.setVideoSource(list[i].deviceId);
        easyrtc.initMediaSource(() => {
          let self = document.getElementById('selfVideo');
          easyrtc.setVideoObjectSrc(self, easyrtc.getLocalStream());
          easyrtc.connect(APP_NAME, console.log('success!'), console.log('fail :('))
        }, console.log('init failed'), '')
      }
      devices.appendChild(button);
    }
  })
}

function callEverybodyElse(roomName, otherPeople) {

  easyrtc.setRoomOccupantListener(null);

  let users = [];
  let connectCount = 0;
  for(let id in otherPeople ) {
    users.push(id);
  }

  function establishConnection(position) {

    function callSuccess() {
      connectCount++;

      if(connectCount < 3 && position > 0)
        establishConnection(position - 1);

    }

    function callFailure(errorCode, errorText) {
      easyrtc.showError(errorCode, errorText);

      if(connectCount < 3 && position > 0)
        establishConnection(position - 1);
    }

    easyrtc.call(users[position], callSuccess, callFailure);
  }

  if(users.length > 0)
    establishConnection(users.length - 1);
}

function sendMessage () {
  let msg = document.getElementById('messages').value;

  if(msg.replace(/\s/g, "").length === 0)
    return;

  addToConversation('Me', 'message', msg);

  let listIds = easyrtc.getRoomOccupantsAsArray('default');
  console.log(listIds);

  for(let i = 0; i < listIds.length; i++) {
    easyrtc.sendDataWS(listIds[i], 'message', msg);
  }
}

function addToConversation (id, type, text) {
  text = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  text = text.replace(/\n/g, "<br />");
  document.getElementById("conversation").innerHTML +=
    "<b>" + id + ":</b>&nbsp;" + text + "<br />";
}

function loginSuccess(id) {
  console.log(id + " connected");
}

function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}