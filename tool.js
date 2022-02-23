const crypto = require('crypto');

require('./utils.js')();

class AES {
  #cipher;
  #decipher;
  #iv;
  #key;
  SetIV(iv2go) {
    if (iv2go.length != 16) {
      throw new Error("Invalid IV provided");
    } else {
      this.iv = iv2go;
    }
  }
  SetKey(key2go) {
    if (key2go.length != 16) {
      throw new Error("Invalid key provided");
    } else {
      this.key = key2go;
    }
  }
  ProcessBlockEncrypt(data) {
    return this.cipher.update(data, 'binary', 'latin1');
  }
  ProcessBlockDecrypt(data) {
    let temp = this.decipher.update(data, 'binary', 'latin1');
    if (temp.length < 16) {
      temp = this.decipher.final('latin1');
      this.decipher = crypto.createDecipheriv("AES-128-ECB", this.key, Buffer.alloc(0));
    }
    return temp;
  }
  Encrypt(data) {}
  constructor(key2go) {
    if (this.constructor == AES) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.SetKey(key2go);
    this.cipher = crypto.createCipheriv("AES-128-ECB", this.key, Buffer.alloc(0));
    this.decipher = crypto.createDecipheriv("AES-128-ECB", this.key, Buffer.alloc(0));
    this.decipher.setAutoPadding(false);
  }
}

class AES_ECB extends AES {
  constructor(key2go) {
    super(key2go);
  }
  Encrypt(data) {
    let buffer = "";
    data = AddPadding(data);
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      buffer += this.ProcessBlockEncrypt(data.substring(i*16, i*16+16));
    }
    return toHex(buffer);
  }
  Decrypt(data) {
    let buffer = "";
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      buffer += this.ProcessBlockDecrypt(data.substring(i*16, i*16+16));
    }
    buffer = DeletePadding(buffer);
    return buffer;
  }
}

class AES_CBC extends AES {
  constructor(key2go, iv) {
    super(key2go);
    if (iv === undefined) {
      this.iv = crypto.randomBytes(16).toString('latin1');
    } else {
      SetIV(iv);
    }
  }
  Encrypt(data) {
    let current_data = "", buffer = this.iv;
    data = AddPadding(data);
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      current_data = XorBlocks(data.substring(i*16, i*16+16), this.iv);
      this.iv = this.ProcessBlockEncrypt(current_data);
      buffer += this.iv;
    }
    return toHex(buffer);
  }
  Decrypt(data) {
    let current_data = "", buffer = "";
    this.iv = data.substring(0, 16);
    data = data.substring(16, data.length);
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      current_data = this.ProcessBlockDecrypt(data.substring(i*16, i*16+16));
      buffer += XorBlocks(current_data, this.iv);
      this.iv = data.substring(i*16, i*16+16)
    }
    buffer = DeletePadding(buffer);
    return buffer;
  }
}

class AES_CFB extends AES {
  constructor(key2go, iv) {
    super(key2go);
    if (iv === undefined) {
      this.iv = crypto.randomBytes(16).toString('latin1');
    } else {
      SetIV(iv);
    }
  }
  Encrypt(data) {
    let current_data = "", buffer = this.iv;
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      let current_length = data.substring(i*16, i*16+16).length;
      current_data = this.ProcessBlockEncrypt(this.iv);

      if (current_length < 16) {
        current_data = current_data.substring(0, current_length);
      }

      this.iv = XorBlocks(data.substring(i*16, i*16+16), current_data);
      buffer += this.iv;
    }
    return toHex(buffer);
  }
  Decrypt(data) {
    let current_data = "", buffer = "";
    this.iv = data.substring(0, 16);
    data = data.substring(16, data.length);
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      let current_length = data.substring(i*16, i*16+16).length;
      current_data = this.ProcessBlockEncrypt(this.iv);

      if (current_length < 16) {
        current_data = current_data.substring(0, current_length);
      }

      buffer += XorBlocks(data.substring(i*16, i*16+16), current_data);
      this.iv = data.substring(i*16, i*16+16);
    }
    return buffer;
  }
}

class AES_OFB extends AES {
  constructor(key2go, iv) {
    super(key2go);
    if (iv === undefined) {
      this.iv = crypto.randomBytes(16).toString('latin1');
    } else {
      SetIV(iv);
    }
  }
  Encrypt(data) {
    let current_data = "", buffer = this.iv;
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      let current_length = data.substring(i*16, i*16+16).length;
      this.iv = this.ProcessBlockEncrypt(this.iv);

      current_data = this.iv;
      if (current_length < 16) {
        current_data = current_data.substring(0, current_length);
      }
      buffer += XorBlocks(data.substring(i*16, i*16+16), current_data);
    }
    return toHex(buffer);
  }
  Decrypt(data) {
    this.iv = data.substring(0, 16);
    data = data.substring(16, data.length);
    return hex2a(this.Encrypt(data)).substring(16);
  }
}

class AES_CTR extends AES {
  #counter;
  constructor(key2go, iv) {
    super(key2go);
    this.counter = -1;
    if (iv === undefined) {
      this.iv = crypto.randomBytes(12).toString('latin1');
    } else {
      SetIV(iv);
    }
  }
  get_next_iv() {
    let nonce = this.iv.substring(0, 12);
    this.counter++;
    this.iv = nonce + hex2a(this.counter.toString(16).padStart(8));
    return this.iv;

  }
  Encrypt(data) {
    let current_data = "", buffer = this.get_next_iv();
    for (let i = 0; i < Math.ceil(data.length / 16); i++) {
      let current_length = data.substring(i*16, i*16+16).length;

      current_data = this.ProcessBlockEncrypt(this.iv);
      if (current_length < 16) {
        current_data = current_data.substring(0, current_length);
      }
      buffer += XorBlocks(data.substring(i*16, i*16+16), current_data);
      this.iv = this.get_next_iv();
    }
    return toHex(buffer);
  }
  Decrypt(data) {
    this.iv = data.substring(0, 12);
    this.counter = parseInt(toHex(data.substring(12, 16)), 16) - 1;
    data = data.substring(16, data.length);
    return hex2a(this.Encrypt(data)).substring(16);
  }
}

module.exports = function() {
    this.AES = AES;
    this.AES_ECB = AES_ECB;
    this.AES_CBC = AES_CBC;
    this.AES_CFB = AES_CFB;
    this.AES_OFB = AES_OFB;
    this.AES_CTR = AES_CTR;
}
