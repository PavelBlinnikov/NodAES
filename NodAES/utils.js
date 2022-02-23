function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function toHex(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return result;
}

function XorBlocks(b1, b2) {
  if (b1.length != b2.length) {
    throw new Error("Blocks are not equal");
  }
  let result = "";
  for (let i = 0; i < b1.length; i++) {
    result += String.fromCharCode(b1.charCodeAt(i) ^ b2.charCodeAt(i));
  }
  return result;
}

function AddPadding(data) {
  return data+String.fromCharCode(16-(data.length%16)).repeat(16-(data.length%16));
}

function DeletePadding(data) {
  return data.substring(0, data.length-data.charCodeAt(data.length-1));
}

function hexstr2buf(data) {
  return Buffer.from(hex2a(data), 'binary')
}

module.exports = function() {
    this.hex2a = hex2a;
    this.toHex = toHex;
    this.hexstr2buf = hexstr2buf;
    this.AddPadding = AddPadding;
    this.DeletePadding = DeletePadding;
    this.XorBlocks = XorBlocks;
}
