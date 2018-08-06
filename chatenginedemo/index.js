const now = new Date().getTime();
const username = ['user', now].join('-');
const textInput = document.getElementById('chat-input');
const textOutput = document.getElementById('chat-output');
var pastMessages = [];

let sendChat = function() {}; // will be filled in when ChatEngine connects
let pastMessagesSearch = null;

const ChatEngine = ChatEngineCore.create({
    publishKey: 'pub-c-3809f124-ef23-4e94-b655-092c2b550664',
    subscribeKey: 'sub-c-3067f416-9740-11e8-9a7c-62794ce13da1'
}, {
    globalChannel: 'chat-engine-demo-js',
    debug: true
});

ChatEngine.onAny((a) => {
    console.log(a)
});

ChatEngine.connect(username, {
    signedOnTime: now
}, 'auth-key' + new Date().getTime());

ChatEngine.on('$.ready', (data) => {

    data.me.direct.onAny((a) => {
        console.log(a)
    })

    sendChat = function(e) {
        console.log('enters send chat');
        ChatEngine.global.emit('message', {
            text: textInput.value
        });

        textInput.value = '';

        return false;

    };

    checkSubmit = function(e) {

        if (e.keyCode == 13) {
            sendChat();
        }
    }

    pastMessagesSearch = ChatEngine.global.search({
        event: 'message',
        count: 10,
        pages: 1,
    });

    pastMessagesSearch.on('message', (payload) => {
      pastMessages.push(payload);
    });

    pastMessagesSearch.on('$.search.page.request', () => {
      console.log('request');
      pastMessages.forEach(showMessage);
    });

    pastMessagesSearch.on('$.search.page.response', () => {
      console.log('response');
      pastMessages = [];
    });

    pastMessagesSearch.on('$.search.finish', () => {
      console.log('Got thru all messages');
    });

    ChatEngine.global.on('message', (payload) => {
        showMessage(payload);
    });
});

function showMessage(payload)
{
  let div = document.createElement("p");
  div.innerHTML = payload.sender.uuid + ': ' + payload.data.text;
  textOutput.appendChild(div);
}
function showMore()
{
  // debugger;
  pastMessagesSearch.next();
  // if(pastMessagesSearch.hasMore)
  // {
  //   pastMessagesSearch.next();
  //   console.log('searching next 10');
  // }
  // else {
  //   console.log('no more'); // TODO for some reason the hasMore boolean keeps turning out as false
  //   // even tho there is data left to retreive.
  // }
}
