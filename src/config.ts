type Config = {
  debug: boolean;
  apiURL: string;
  timeout: number;
  storage: Storage;
  connector: {
    xumm: {
      apiKey: string;
      options: {
        redirectUrl?: string;
        rememberJwt?: boolean;
        storage?: Storage;
        implicit?: boolean;
      };
    };
  };
};

const DEFAULT: Config = {
  debug: true,
  apiURL: process.env.REACT_APP_URL_POAP_API as string,
  timeout: 5000,
  storage: window.sessionStorage,
  connector: {
    xumm: {
      apiKey: process.env.REACT_APP_KEY_XUMM_API as string,
      options: {
        rememberJwt: true,
        storage: window.sessionStorage,
        implicit: true,
      },
    },
  },
};

const config = DEFAULT;

export default config;
