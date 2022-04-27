const fs = require("fs");
const { fetchJson } = require("../lib/fetch");

var ctx_db_path = "./db/ctx.json";
var gm_db_path = "./db/games.json";


async function contexto (id,body,stop, enviar){
  
  var ctx_db = JSON.parse(fs.readFileSync(ctx_db_path, "UTF-8"));
  var gm_db = JSON.parse(fs.readFileSync(gm_db_path, "UTF-8"));
  var gm_db = gm_db.contexto;
  var day = new Date().getDate();
  var gameId = "não definido";
  
  if(gm_db.day !== day){
    gm_db.game = gm_db.game + 1;
    gm_db.day = day;
    fs.writeFileSync(gm_db_path, JSON.stringify(gm_db, null, 4));
  }
  
  gameId = gm_db.game;
  var msg = `🎮 *JOGO INICIADO* 🎮\n🎫 | *JOGO #${gameId}*\n\ndigite *.ctx-help* para saber como jogar.\n\nsite: contexto.me`

  if(!ctx_db[id]){
    ctx_db[id] = {
      "status": "gaming",
      "game": gm_db.game
    };
    fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
    return msg;
  }
  
  var msg = `🎮 *JOGO INICIADO* 🎮\n🎫 | *JOGO #${gameId}*\n\ndigite *.ctx-help* para saber como jogar.\n\nsite: contexto.me`
 
    
  if(ctx_db[id].status === "stopped"){
     ctx_db[id].status = "gaming";
     ctx_db[id].game = gameId;
     fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
     return `🎮 *JOGO INICIADO* 🎮\n\n🎫 | *JOGO #${gameId}*\n\ndigite *.ctx-help* para saber como jogar.\n\nsite: contexto.me`
  }
  
  if(stop){
     ctx_db[id].status = "stopped";
     fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
     msg = "🔸 | JOGO CANCELADO!"
     return msg;
  }else{
    var word = body.replace(".ctx", "").trim();
    if(word === ""){
     return "❗ | DIGITE ALGO!"
    }
    gameId = ctx_db[id].game;
    
    if(word.startsWith("#")){
       var tag = word.replace("#", "");
       if(isNaN(tag)){
         if(tag === "dica"){
           var dica = await fetchJson(`https://contexto.me/machado/pt-br/tip/${gameId}/${random(1, 999)}`);
           return `${getEmoji(dica.distance)}| *${dica.word}* está na posição ${dica.distance} (dica).`
         }
       }else{
         ctx_db[id].game = tag;
         gameId = ctx_db[id].game;
         fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
         return `🔸 | JOGO ALTERADO PARA: #${gameId}`;
       }
    }
    
    if(ctx_db[id].status=== "stopped"){
      ctx_db[id].status = "gaming"
      fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
      return msg;
    }else{
      var url = `https://contexto.me/machado/pt-br/game/${gameId}/${word}`;
      var response = await fetchJson(url);
      response.distance = response.distance + 1;
      
      if(response.distance === 1){
        msg = `🎉 *PARABÉNS VOCÊ ACERTOU A PALAVRA* 🎉`
        ctx_db[id].status = "stopped";
        fs.writeFileSync(ctx_db_path, JSON.stringify(ctx_db, null, 4));
      }else if(response.error){
        msg = `❗ | *${response.error}*`
      }else{
        msg = `${getEmoji(response.distance)}| *${word}* está na posição ${response.distance}.`;
      }
      return msg;
    }
  }
 
}

function contextoHelp(){
  return `
------ *COMO JOGAR* ------

Descubra a palavra secreta.
Você pode tentar quantas vezes precisar.
As palavras foram ordenadas por um algoritmo de inteligência artificial de acordo com a similaridade delas com a palavra secreta.
Depois de enviar uma palavra, você verá a posição em que ela está.
A palavra secreta é a número 1.
O algoritmo analisou milhares de textos em Português.
Ele utiliza o contexto em que as palavras são utilizadas para calcular a similaridade entre elas.

------ *COMANDOS* ------

📃 | Inicar jogo:
*.ctx*

📃 | Jogar:
*.ctx (palavra)*

📃 | Cancelar o jogo:
*.spctx* 

📃 | Mudar número do jogo:
*.ctx #(número)*

site: contexto.me
`
}


function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getEmoji(index){
  var emoji = "";
  if(index < 999){
     emoji = "📗"
  }else if(index >= 1000 && index <= 9999){
     emoji = "📘"
  }else if(index >= 10000){
     emoji = "📙"
  }
  return emoji;
}

module.exports = {
  contexto,
  contextoHelp
}