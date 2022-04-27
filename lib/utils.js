const getAdmins = (members) => {
  var admins = [];
  for (let i of members) {
       if (i.admin == 'admin' || i.admin == 'superadmin') {
        admins.push(i.id);
     }
  }
  return admins;
};

const getMembers = (members) => {
   var member = [];
  for (let i of members) {
    member.push(i.id);
  }
  return member;
};
const getId = (mek) =>{
  return mek.key.remoteJid.replace("@g.us", "")

};

module.exports = { getAdmins, getMembers, getId };