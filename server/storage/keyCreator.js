class KeyCreator {

    constructor(keyGeneratorConfig) {
        this.chars = keyGeneratorConfig.keyChars;
        if(keyGeneratorConfig.withToUpperCase)
            this.chars += this.chars.toUpperCase();
        this.keyLength = keyGeneratorConfig.keyLength;
    }

    create() {
        let key = "";

        for(let i = 0; i < this.keyLength; i++) {
            const random = Math.floor(Math.random() * this.chars.length);
            key += this.chars[random];
        }

        return key;
    }

}

module.exports = new KeyCreator(require("../config").keyGenerator);
