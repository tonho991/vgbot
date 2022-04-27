const {
 'default':
   makeWASocket,
   DisconnectReason,
   useSingleFileAuthState
} = require('@adiwajshing/baileys');
const fs = require('fs');
const P = require('pino');

const { state, saveState} = useSingleFileAuthState('session.json');
const { getAdmins, getMembers, getId } = require('./lib/utils');
const { fetchJson, getBuffer } = require('./lib/fetch');

//jogos
const { contexto, contextoHelp } = require('./games/contexto');
const { bandeira } = require('./games/bandeira');

async function connectToWhatsapp() {
  const conn = makeWASocket({
    printQRInTerminal: true,
    logger: P({level: 'info'}),
    auth: state,
 });
  
conn.ev.on('connection.update', update => {
  
  if (update.connection == 'close') {
    if (update.lastDisconnect.error.hasOwnProperty('output') ? update.lastDisconnect.error.output.statusCode != DisconnectReason.loggedOut : true) {
      console.log('conexão fechada, reconectando...');
      connectToWhatsapp();
    } else if (update.lastDisconnect.error.output.statusCode == DisconnectReason.loggedOut) {
      console.log('desconectado, reconectando...');
      connectToWhatsapp();
    }
  } else if (update.connection == 'open') {
    console.log('conexão aberta');
  }
});
conn.ev.on('creds.update', saveState);

conn.ev.on('messages.upsert', async updateM => {
  if (updateM.type != 'notify') return;
  const mek = updateM.messages[0];
  if (!mek.key.participant) mek.key.participant = mek.key.remoteJid;
  mek.key.participant = mek.key.participant.replace(/:[0-9]+/gi, '');
  if (mek.key.fromMe) return;
  if (!mek.message) return;
  const from = mek.key.remoteJid;
  const info = mek.message;
  const type = Object.keys(info);
  
  const body = type == 'conversation' && info.conversation ? info.conversation : type == 'extendedTextMessage' && info.extendedTextMessage.text ? info.extendedTextMessage.text : type == 'imageMessage' && info.imageMessage.caption ? info.imageMessage.caption : type == 'videoMessage' && info.videoMessage.caption ? info.videoMessage.caption : type == "buttonsResponseMessage" && info.buttonsResponseMessage.selectedButtonId ? info.buttonsResponseMessage.selectedButtonId : type == "listResponseMessage" && info.listResponseMessage.singleSelectReply.selectedRowId ? info.listResponseMessage.singleSelectReply.selectedRowId :  '';
  
   const enviar = text => {
    conn.sendMessage(from, {text: text}, {quoted: mek});
   };
   const enviarImg = async (url) =>{
     var buffer = await getBuffer(url);
     conn.sendMessage(from, {image: buffer});
   };
  
   const botNumber = conn.user.id.replace(/:[0-9]+/gi, '');
   const owner = "5565993402406@s.whatsapp.net";
   const metadata = await conn.groupMetadata(from);
   const isGroup = mek.key.remoteJid.endsWith('g.us');
   const sender = mek.key.participant;
   const pushname = mek.pushName;
   const isOwner = sender != owner;
   const groupMembers = isGroup ? metadata.participants : [];
   const isAdmins = isGroup ? getAdmins(groupMembers) : [];
   const isMemberAdmin = isGroup ? isAdmins.indexOf(sender) > -1 : false;
   const isBotAdmin = isGroup ? isAdmins.indexOf(botNumber) > -1 : false;
   const allMembers = isGroup ? getMembers(groupMembers) : [];
  
   
   const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
   const prefix = body.substring(0, 1);
 
   //log
   console.log(`- ${pushname}: ${body}\n`)
   console.log(mek)

   if(prefix === "."){
    switch (command) {
       case 'filme':
           
         break;
       case 'ctx': 
         enviar(await contexto(getId(mek), body, false, enviar));
         break;
       case 'spctx':
         enviar(await contexto(getId(mek), body, true, enviar));
       break;
       case 'ctx-help':
         enviar(contextoHelp());
         break;
       case 'bandeira':
         bandeira(conn, body, enviar, enviarImg, getId(mek));
         break;
       default:
         // code
     }
   }
  
});
}




connectToWhatsapp();