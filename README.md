# POAP APP

The web app for Proof of Attendance Protocol

## Requirements
- Node.js `v18.16.0+`
- Yarn `v1.22.19+`
- Running POAP API 2.0 server (backend), for details see [here](https://github.com/rikublock/POAP-API2)

## Getting Started
- Install dependencies with `yarn install`
- Rename `.env.example` to `.env` (change values as needed)
  - `REACT_APP_URL_POAP_API` (backend server URL)
  - `REACT_APP_KEY_XUMM_API` (Xumm App API key, needs to match the key configured in the backend)
- Ensure the backend service is running
- Run the app with `yarn start`

## Available Scripts

In the project directory, you can run:

### `yarn install`

Install dependencies.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Supported Wallets
- Xumm (installation details [here](https://xumm.app/))
- GemWallet (installation details [here](https://gemwallet.app/))
