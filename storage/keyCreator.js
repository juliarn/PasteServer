class KeyCreator {

    constructor(keyGeneratorConfig) {
        this.chars = keyGeneratorConfig.keyChars;
        if(keyGeneratorConfig.withToUpperCase)
            this.chars += this.chars.toUpperCase();
        this.keyLength = keyGeneratorConfig.keyLength;
    }

    create(keyLength, chars) {
        const length = keyLength || this.keyLength;
        const keyChars = chars || this.chars;
        let key = "";

        for(let i = 0; i < length; i++) {
            const random = Math.floor(Math.random() * keyChars.length);
            key += keyChars[random];
        }

        return key;
    }

}

module.exports = new KeyCreator(require("../config").keyGenerator);
