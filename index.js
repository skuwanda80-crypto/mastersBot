const express = require('express');
const axios  = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN||'master_tuckBot_2005';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID =  process.env.PHONE_NUMBER_ID;

// 1.VERIFICATION - facebook checks this
app.get('/webhook',(req,res)=> {

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if(mode === 'subscribe' && token === VERIFY_TOKEN){
        console.log('WEBHOOK VERIFIED!');
        res.status(200).send(challenge);
    }else {
        res.sendStatus(403)
    }
});

// RECEIVE + REPLY MESSAGES
app.post('/webhook', async (req,res) => {
    console.log('Message received:',JSON.stringify(req.body,null,2));

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.message?.[0];

    if(message){
        const from = message.from;//customer number
        const text = message.text?.body?.toLowerCase() || '';

        let replyText = `Welcome to TuckBot\n You said ${text}`;

        // Send reply via whatsApp API
        try {
            await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,{
                messaging_product:"whatsapp",
                to:from,
                text:{body:replyText}
            },{
                headers:{
                    'Authorization':`Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type':'application/json'
                }
            });
            console.log('Reply sent to',from);
        }catch(err){
            console.error('Failed to send:',err.response?.data || err.message);
        }
    }

    res.sendStatus(200);
});

app.get('/',(req,res)=>{
    res.send('TuckBot is running!');
});

const PORT = process.env.PORT||10000;
app.listen(PORT,()=>console.log(`TuckBot on port${PORT}`));