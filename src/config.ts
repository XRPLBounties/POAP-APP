const DEFAULT = {
  apiURL: process.env.REACT_APP_URL_POAP_API as string,
  timeout: 5000,

  storage: window.sessionStorage,

  connector: {
    xumm: {
      apiKey: process.env.REACT_APP_KEY_XUMM_API as string,
      options: {
        implicit: true,
        storage: window.sessionStorage,
      },
    },
  },

  debug: false,
};

const config = DEFAULT;

export default config;
