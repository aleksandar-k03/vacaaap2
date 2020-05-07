const { Client } = require('whatsapp-web.js');
const fs = require('fs');

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');

    client.pupPage.evaluate(()=>{

      window.getGroup = function(name){
        var conts = window.WWebJS.getContacts();
        for(var i = 0; i < conts.length; i++)
          if(conts[i].isGroup && conts[i].name == name)
              return conts[i];
        return null;
      }

      window.add = function(groupName, contacts){
        var group = window.getGroup(groupName);
        if(group == null){
          console.error('Ne postoji grupa!');
          return;
        }

        if(typeof contacts !== 'object'){
          console.error('Kontakti moraju biti array');
          return;
        }

        for(var i = 0; i < contacts.length; i++)
          contacts[i] += '@c.us';
        
        console.log('grupa', group, 'constacts', contacts);
        window.Store.Wap.addParticipants(group.id._serialized, contacts);
      }


    });

});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});


function getContact(){

}

client.initialize();