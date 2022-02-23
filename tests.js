const crypto = require('crypto')
require('./tool.js')();

function test1() {
  let my_key = "sixteen-byte-key";
  let object = new AES_CBC(hexstr2buf(toHex(my_key)));
  let kek = object.Encrypt("test-message1");
  console.log(kek, object.Decrypt(hex2a(kek)));
  kek = object.Encrypt("test-message2");
  console.log(kek, object.Decrypt(hex2a(kek)));
  kek = object.Encrypt("test-message3456");
  console.log(kek, object.Decrypt(hex2a(kek)));
  kek = object.Encrypt("qwdqiqdiuqwhdiuqwhdiuqwhdiquwhdiquwhiqwdhiqhdiehriuerghierhgieruhgierghierhgiwehhiwhfiuwhefiwehfihew");
  console.log(kek, object.Decrypt(hex2a(kek)));
}

function test2() {
  let cipher = new AES_CBC(hexstr2buf("140b41b22a29beb4061bda66b6747e14"));
  console.log('Result is:', cipher.Decrypt(hex2a("4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81")));
}

function test3() {
  let cipher = new AES_CBC(hexstr2buf("140b41b22a29beb4061bda66b6747e14"));
  console.log('Result is:', cipher.Decrypt(hex2a("5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253")));
}

function test4() {
  let cipher = new AES_CTR(hexstr2buf("36f18357be4dbd77f050515c73fcf9f2"));
  console.log('Result is:', cipher.Decrypt(hex2a("69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329")));
}

function test5() {
  let cipher = new AES_CTR(hexstr2buf("36f18357be4dbd77f050515c73fcf9f2"));
  console.log('Result is:', cipher.Decrypt(hex2a("770b80259ec33beb2561358a9f2dc617e46218c0a53cbeca695ae45faa8952aa0e311bde9d4e01726d3184c34451")));
}

function test6() {
  let modes = [AES_ECB, AES_CBC, AES_CFB, AES_CTR, AES_OFB];
  let my_key = "sixteen-byte-key";
  let message = "A".repeat(40);
  let msg = 0;

  for (let i = 0; i < modes.length; i++) {
    let cipher = new modes[i](hexstr2buf(toHex(my_key)));
    msg = cipher.Encrypt(message);
    console.log(msg);
    console.log(cipher.Decrypt(hex2a(msg)));
  }
}

function main() {
  console.log("===TEST 1===");
  test1();
  console.log("===TEST 2===");
  test2();
  console.log("")
  console.log("===TEST 3===");
  test3();
  console.log("")
  console.log("===TEST 4===");
  test4();
  console.log("")
  console.log("===TEST 5===");
  test5();
  console.log("")
  console.log("===TEST 6===");
  test6();
}

main();
