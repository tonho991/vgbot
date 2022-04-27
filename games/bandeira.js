const { getBuffer } = require("../lib/fetch");
const fs = require("fs");

var db_flag_path = "./db/bandeira.json";
var gm_db_path = "./db/games.json";

function bandeira(conn, body, enviar, enviarImg, id){
  
  var db_flag = JSON.parse(fs.readFileSync(db_flag_path, "UTF-8"));
  var gm_db = JSON.parse(fs.readFileSync(gm_db_path, "UTF-8"));
  var word = body.replace(".bandeira", "").trim();
  console.log(word)
  if(word === "" || !db_flag[id] || db_flag[id].status === "stopped"){
    enviar("⏳ | CARREGANDO...");
    var paises = JSON.parse(fs.readFileSync("./listas/paises.json"));
    var keys = Object.keys(paises);
    var list = [];
    
    for(let i = 0; i < keys.length; i++) {
      list.push(paises[keys[i]]);
    }
    var position = random(0, list.length);
    var game = list[position];
      
    db_flag[id] = {
      "name": game.pais,
      "status": "gaming"
    };
    fs.writeFileSync(db_flag_path, JSON.stringify(db_flag, null, 4));
    enviarImg(game.img);
    
  }else{
    console.log("\nrun\n")
    if(word.toLowerCase() === db_flag[id].name.toLowerCase()){
      console.log("nice")
       enviar("🎉 *PARABÉNS VOCÊ ACERTOU A BANDEIRA 🎉*");
       db_flag[id] = {
         "name": "",
         "status": "stopped"
       };
       fs.writeFileSync(db_flag_path, JSON.stringify(db_flag, null, 4));
  
    }else{
      console.log("err")
      
       var erros = [
         "Que pena você errou!",
         "Ta faltando aula de geografia?",
         "Affs, vou ter que virar Professor.",
         "🧐",
         "Errou dnv kkkkkk",
         "Que burrico"
       ];
      try{
        enviar(erros[random(0, erros.length)]);
      }catch(e){
        enviar("Que pena você errou!");
      }
    }
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  bandeira
}