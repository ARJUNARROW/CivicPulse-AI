console.log("APP LOADED");

// ELEMENTS
const sendBtn =
document.getElementById("sendBtn");

const extractBtn =
document.getElementById("extractBtn");

const micBtn =
document.getElementById("micBtn");

const messageInput =
document.getElementById("message");

const chat =
document.getElementById("chat");


// =========================
// SEND MESSAGE
// =========================

async function sendMessage(text){

if(!text) return;

chat.innerHTML +=
`
<p>
<b>You:</b> ${text}
</p>
`;

messageInput.value = "";

try{

const res =
await fetch(
"http://localhost:3000/ask",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({
message:text
})

}
);

const data =
await res.json();

console.log(data);

chat.innerHTML +=
`
<p>
<b>Agent:</b> ${data.reply}
</p>
`;


// AI VOICE
const speech =
new SpeechSynthesisUtterance(
data.reply
);

speech.lang = "en-US";

window
.speechSynthesis
.speak(speech);

}
catch(error){

console.log(
"SEND ERROR:",
error
);

}

}


// =========================
// SEND BUTTON
// =========================

sendBtn.addEventListener(
"click",
()=>{

const text =
messageInput.value;

sendMessage(text);

}
);


// =========================
// VOICE INPUT
// =========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

alert(
"Speech Recognition not supported"
);

}

const recognition =
new SpeechRecognition();

recognition.lang =
"en-US";

recognition.continuous =
false;

recognition.interimResults =
false;


// MIC BUTTON
micBtn.addEventListener(
"click",
()=>{

console.log(
"LISTENING..."
);

recognition.start();

}
);


// USER SPEAKS
recognition.onresult =
(event)=>{

const transcript =
event.results[0][0].transcript;

console.log(
"USER:",
transcript
);

messageInput.value =
transcript;

sendMessage(transcript);

};


// ERRORS
recognition.onerror =
(event)=>{

console.log(
"SPEECH ERROR:",
event.error
);

};


// =========================
// GENERATE INCIDENT
// =========================

extractBtn.addEventListener(
"click",
async()=>{

try{

const res =
await fetch(
"http://localhost:3000/extract",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({})
}
);

const data =
await res.json();

document
.getElementById("incidentBox")
.innerHTML =
JSON.stringify(
data,
null,
2
);

console.log(data);

chat.innerHTML +=
`
<hr>

<pre>
${JSON.stringify(
data,
null,
2
)}
</pre>
`;

}
catch(error){

console.log(
"EXTRACT ERROR:",
error
);

}

}
);

const dispatchBox =
document.getElementById("dispatchBox");

dispatchBox.innerHTML =
`
<div class="status">
✅ Incident Registered
</div>

<div class="status">
🚒 ${data.department} Dispatched
</div>

<div class="status">
📍 Route Sent To Emergency Team
</div>

<div class="status">
🛰️ Live Tracking Activated
</div>
`;