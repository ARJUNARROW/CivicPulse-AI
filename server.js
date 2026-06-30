let chatHistory = [];
let incidentCompleted = false;

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// ======================================
// Department Routing Function
// ======================================

function getDepartment(type){

switch(type){

case "building_collapse":
return "Fire + Ambulance";

case "fire":
return "Fire";

case "road_accident":
return "Ambulance + Police";

case "medical_emergency":
return "Ambulance";

case "crime":
return "Police";

default:
return "Control Room";

}

}


// ======================================
// ASK ROUTE
// ======================================

app.post("/ask", async (req, res) => {

try{

if(incidentCompleted){

return res.json({
reply:
"Incident already registered. Emergency teams have already been dispatched."
});

}

const message = req.body.message;

chatHistory.push({
role:"user",
content:message
});

const response =
await client.responses.create({

model:"gpt-4.1-mini",

instructions: `
You are a Global Emergency Response AI Agent.

Your job is to collect emergency incident information and coordinate dispatch services.

Required Information:

1. caller_name
2. caller_number
3. incident_type
4. location
5. landmark
6. pincode
7. injuries_reported
8. injured_count
9. trapped_people
10. severity


Rules:

- Speak ONLY in English.
- Ask ONLY one question at a time.
- Never repeat questions.
- Never ask for information already provided.
- Infer incident type automatically.

Examples:

"building collapse"
=> building_collapse

"fire near mall"
=> fire

"road accident"
=> road_accident

When all information is collected:

1. Generate a short summary.
2. Mention dispatch department.
3. Generate Case ID in format DG-XXXX.
4. Confirm emergency teams dispatched.
5. End conversation.

Dispatch Rules:

building_collapse
=> Fire + Ambulance

fire
=> Fire

road_accident
=> Ambulance + Police

medical_emergency
=> Ambulance

crime
=> Police

After closure do not continue the conversation.

Keep responses short and professional.
`,

input: chatHistory

});

const reply =
response.output_text;

chatHistory.push({
role:"assistant",
content:reply
});


// Mark incident completed
if(
reply.includes("Case ID") ||
reply.includes("Emergency teams dispatched") ||
reply.includes("Emergency team dispatched")
){
incidentCompleted = true;
}

res.json({
reply
});

}
catch(error){

console.log(error);

res.status(500).json({
error:error.message
});

}

});


// ======================================
// EXTRACT ROUTE
// ======================================

app.post("/extract", async (req, res) => {

try {

const response =
await client.responses.create({

model:"gpt-4.1-mini",

instructions: `
You are an emergency incident extraction engine.

Analyze the conversation carefully.

Return ONLY valid JSON.

Schema:

{
  "caller_name":"",
  "caller_number":"",
  "incident_type":"",
  "severity":"",
  "summary":"",
  "location":"",
  "landmark":"",
  "pincode":"",
  "injuries_reported":false,
  "injured_count":0,
  "trapped_people":0
}

Routing Rules:

building_collapse
=> Fire + Ambulance

fire
=> Fire

road_accident
=> Ambulance + Police

medical_emergency
=> Ambulance

crime
=> Police

Severity Rules:

critical:
- trapped people > 0
- building collapse
- major fire

high:
- injuries reported

medium:
- property damage

low:
- minor incident

Return JSON only.
`,

input: JSON.stringify(chatHistory)

});


// Parse AI JSON
let extractedData =
JSON.parse(response.output_text);


// Add Department
extractedData.department =
getDepartment(
extractedData.incident_type
);


// Generate Case ID
extractedData.case_id =
"DG-" +
Math.floor(
1000 + Math.random()*9000
);


// Add Timestamp
extractedData.timestamp =
new Date().toISOString();


// Add Transcript
extractedData.transcript =
chatHistory.map(msg => ({
speaker: msg.role,
message: msg.content
}));


// Final Response
res.json(extractedData);

}
catch(error){

console.log(error);

res.status(500).json({
error:error.message
});

}

});


// ======================================
// RESET ROUTE (Optional)
// ======================================

app.post("/reset", (req, res) => {

chatHistory = [];
incidentCompleted = false;

res.json({
message:"Conversation reset successful"
});

});


// ======================================
// SERVER START
// ======================================

app.listen(
3000,
()=>{
console.log("Running on port 3000");
}
);