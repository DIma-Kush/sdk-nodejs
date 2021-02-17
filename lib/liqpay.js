const axios = require('axios');

class LiqPay {
  /**
   * @constructor Creates object with helpers for accessing to LiqPay API
   *
   * @param {string} publicKey
   * @param {string} privateKey
   *
   */
  constructor(publicKey, privateKey) {
    this.host = 'https://www.liqpay.ua/api/';
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.defaultLanguage = 'ru';
  }

  /**
   * Call API
   *
   * @param {string} path
   * @param {object} params
   */
  async api(path, params) {
    let result;

    try {
      params.public_key = this.publicKey;
      this.validateParams(params);

      const { encodedData, signature } = this.cnbObject(params);

      result = axios.post(this.host + path, { form: { encodedData, signature } });
    } catch (err) {
      result = err;
    }

    return result;
  }

  /**
   * cnb_form
   *
   * @param {object} params
   *
   * @return {string}
   *
   */
  cnbForm(params) {
    params.public_key = this.publicKey;
    this.validateParams(params);

    const language = params.language ? params.language : this.defaultLanguage;
    const { encodedData, signature } = this.cnbObject(params);

    return `${'<form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">'
        + '<input type="hidden" name="data" value="'}${encodedData}" />`
        + `<input type="hidden" name="signature" value="${signature}" />`
        + `<input type="image" src="//static.liqpay.ua/buttons/p1${language}.radius.png" name="btn_text"  alt="button"/>`
        + '</form>';
  }

  /**
   * Return Form Object
   *
   * @param {object} params
   *
   * @returns {{encodedData: string, signature: string}} Form Object
   *
   */
  cnbObject(params) {
    const encodedData = Buffer.from(JSON.stringify(params)).toString('base64');

    const signature = this.strToSign(this.privateKey + encodedData + this.privateKey);

    return { encodedData, signature };
  }

  /**
   * strToSign
   *
   * @param {string} str
   *
   * @return {string}
   */
  strToSign(str) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);

    return sha1.digest('base64');
  }

  /**
   * validateParams
   *
   * @param {object} params
   *
   * @return {boolean} result of validation
   *
   */
  validateParams(params) {
    let result;

    if (!params.version) {
      throw new Error('version is null');
    }
    if (!params.amount) {
      throw new Error('amount is null');
    }
    if (!params.language) {
      throw new Error('language is null');
    }
    if (!params.currency) {
      throw new Error('currency is null');
    }
    if (!params.description) {
      throw new Error('description is null');
    }
    result = true;

    return result;
  }
}
