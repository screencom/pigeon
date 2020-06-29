const nodemailer = require('nodemailer');

const defaultEnvs = {
  host: 'PIGEON_HOST',
  port: 'PIGEON_PORT',
  secure: 'PIGEON_USE_TLS',
  authUser: 'PIGEON_AUTH_USER',
  authPass: 'PIGEON_AUTH_PASSWORD',
  from: 'PIGEON_MAIL_FROM',
};

const defaultOptions = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
};

module.exports = {
  setup: (options = {}) => {
    const copyOfDefaults = { ...defaultOptions };
    const mergedOptions = Object.assign(copyOfDefaults, options);

    // Assign these settings to our local ENV variables
    // eslint-disable-next-line no-restricted-syntax
    for (const key in mergedOptions) {
      if (typeof defaultEnvs[key] !== 'undefined' && typeof process.env[defaultEnvs[key]] === 'undefined') {
        process.env[defaultEnvs[key]] = mergedOptions[key];
      }
    }
  },

  sendMail: (data) => new Promise((resolve, reject) => {
    const options = { ...defaultOptions };

    const envKeys = Object.keys(defaultEnvs);
    const envValues = Object.values(defaultEnvs);
    for (let i = 0; i < envKeys.length; i += 1) {
      if (typeof process.env[envValues[i]] !== 'undefined') {
        options[envKeys[i]] = process.env[envValues[i]];
      }
    }

    if (typeof options.secure === 'string') {
      options.secure = options.secure.trim().toLowerCase() === 'true';
    }

    if (typeof options.port === 'string') {
      options.port = parseInt(options.port.trim(), 10);
    }

    const transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: {
        user: options.authUser,
        pass: options.authPass,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });

    if (typeof data.from === 'undefined') {
      // eslint-disable-next-line no-param-reassign
      data.from = process.env.PIGEON_MAIL_FROM;
    }

    const callback = (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    };

    transporter.sendMail(data, callback);
  }),
};
