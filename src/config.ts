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
  socials: {
    discordUrl: string;
    githubUrl: string;
    twitterUrl: string;
  };
  defaultEventImageUrls: string[];
};

const DEFAULT: Config = {
  debug: false,
  apiURL: process.env.REACT_APP_URL_POAP_API as string,
  timeout: 5000,
  storage: window.sessionStorage,
  connector: {
    xumm: {
      apiKey: process.env.REACT_APP_KEY_XUMM_API as string,
      options: {
        rememberJwt: true,
        storage: window.localStorage,
        implicit: true,
      },
    },
  },
  socials: {
    discordUrl: "https://discord.gg/xrpl",
    githubUrl: "https://github.com/XRPLBounties/POAP-APP",
    twitterUrl: "https://twitter.com/",
  },
  defaultEventImageUrls: [
    "https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?&auto=format&fit=crop&w=1200&q=100",
    "https://images.unsplash.com/photo-1531315630201-bb15abeb1653?&auto=format&fit=crop&w=1200&q=100",
    "https://images.unsplash.com/photo-1517707711963-adf9078bdf01?&auto=format&fit=crop&w=1200&q=100",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?&auto=format&fit=crop&w=1200&q=100",
    "https://images.unsplash.com/photo-1588097281266-310cead47879?&auto=format&fit=crop&w=1200&q=100",
    "https://images.unsplash.com/photo-1606767041004-6b918abe92be?&auto=format&fit=crop&w=1200&q=100",
  ],
};

const config = DEFAULT;

export default config;
