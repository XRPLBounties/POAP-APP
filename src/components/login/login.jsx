import './login.scss';

import { getAddress, isConnected } from '@gemwallet/api';

import { Button } from 'semantic-ui-react';
import { XummPkce } from 'xumm-oauth2-pkce';

const xumm = new XummPkce(import.meta.env.XRPL_XUMM_API_KEY);

export default function Login() {
    const xummSignInHandler = (state) => {
        if (state.me) {
            const { me } = state;
            console.log('state', me);
        }
    };

    const loginWithXumm = async () => {
        try {
            xumm.authorize().then((session) => {
                xummSignInHandler(session);
            });

            xumm.on('retrieved', async () => {
                console.log(
                    'Retrieved: from localStorage or mobile browser redirect'
                );
                xummSignInHandler(await xumm.state());
            });
        } catch (error) {
            console.log(error);
        }
    };

    const loginWithGemWallet = async () => {
        try {
            isConnected().then((isConnected) => {
                if (isConnected) {
                    getAddress().then((address) => {
                        if (!address) {
                            throw new Error(
                                'Login failed! Rejected by the user.'
                            );
                        }
                        console.log(`Your address: ${address}`);
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="login-container">
            <h1 className="styled-heading">WELCOME TO XRPL POAP WEB APP</h1>
            <div className="button-container">
                <Button
                    className="custom-button"
                    onClick={loginWithXumm}
                    inverted
                >
                    Login With Xumm
                </Button>
                <Button
                    className="custom-button"
                    onClick={loginWithGemWallet}
                    inverted
                >
                    Login With GemWallet
                </Button>
            </div>
        </div>
    );
}
