const DEFAULT = {
  apiURL: process.env.REACT_APP_URL_POAP_API as string,
  timeout: 600000,

  connector: {
    xumm: {
      apiKey: process.env.REACT_APP_KEY_XUMM_API as string,
      options: {
        implicit: true,
        storage: window.sessionStorage,
      },
    },
  },
};

const config = DEFAULT;

export default config;