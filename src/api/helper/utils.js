//uuid
const { v4: uuidv4 } = require("uuid");

class Utils {
  /**
   * Remove accents from a string
   * @param str string
   * @returns
   * @example
   * removeAccents('áéíóú')
   * // returns 'aeiou'
   *  
   * */
  static removeAccents(str) {
    const with_accent =
      "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    const no_accent =
      "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";

    let newStr = "";

    for (let i = 0; i < str.length; i++) {
      let replacement = false;
      for (let a = 0; a < with_accent.length; a++) {
        if (str.charAt(i) == with_accent.charAt(a)) {
          newStr += no_accent.charAt(a);
          replacement = true;
          break;
        }
      }
      if (!replacement) {
        newStr += str.charAt(i);
      }
    }

    return newStr;
  }


  static removeSpaces(str) {
    return str.replace(/\s/g, "");
  }

  /**
* Generate a username based on the fullname
* @param fullname string
* @returns
* @example
* generateUsername('John Doe')
* // returns 'johndoe12345'
* */
  static async generateUsername(fullname) {
    let username = this.removeAccents(fullname);
    username = username.replace(/[^a-zA-Zs]/g, "").toLowerCase();
    const randomNumber = Math.floor(this.getRandomArbitrary(1, 99999));
    return username.substring(0, 13) + randomNumber;
  }

  /**
 * Generate a random uuid
 * @returns string
 * @example
 * generateUuid()
 * // returns 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 * 
 * */
  static generateUuid() {
    const uuid = uuidv4(); // Gera um UUID v4
    return uuid;
  }

  /**
  * Generate a 2fa code
  * @returns string
  * @example
  * generateCode2fa()
  * // returns '918fsy'
  * 
  * */
  static generate2faCode() {
    const code = Math.random().toString(36).substring(2, 8);
    return code;
  }
}

module.exports = Utils;