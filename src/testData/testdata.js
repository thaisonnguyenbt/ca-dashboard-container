const fs = require('fs');
String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

fs.mkdirSync('out');

const fileContent = fs.readFileSync('./0123456789_socket_e2e_thaison_origin.xml').toString();
for (let i = 101; i <= 400; i++) {
  fs.writeFileSync(`./out/0123456789_socket_e2e_thaison_${i}.xml`, fileContent.replaceAll('00000000000', '00000000000' + i).replaceAll('SOCKET TEST', 'SOCKET TEST ' + i));
}
