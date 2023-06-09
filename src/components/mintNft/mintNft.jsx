import './MintNft.scss';

import { Button, Form, Input } from 'semantic-ui-react';
import { useCallback, useRef, useState } from 'react';

import { ApiCall } from '../../utils/interceptor';
import { MINT_NFT_INPUT_DETAILS } from '../../utils/constants';
import { isValidClassicAddress } from 'xrpl';
import { toast } from 'react-toastify';
import useMergedState from '../../utils/useMergedState';

const INITIAL_STATE = {
    url: '',
    walletAddress: '',
    tokenCount: '',
    title: '',
    desc: '',
    loc: '',
    type: '',
    eventId: '',
};

const MintNft = () => {
    const [formState, setFormState] = useMergedState(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [mintedNftDetails, setMintedNftDetails] = useState(null);
    const toastId = useRef(null);

    const handleChange = (e) => {
        setFormState({ [e.target.name]: e.target.value });
    };

    const handleValidation = useCallback(() => {
        let formIsValid = true;
        let err = {};

        const urlPattern = new RegExp(
            // eslint-disable-next-line no-control-regex
            '(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})'
        );
        if (!urlPattern.test(formState.url)) {
            formIsValid = false;
            err['url'] = 'Please enter a valid URL.';
        }

        if (!isValidClassicAddress(formState.walletAddress)) {
            formIsValid = false;
            err['walletAddress'] = 'Please enter a valid XRPL wallet address.';
        }

        if (
            isNaN(formState.tokenCount) ||
            parseInt(formState.tokenCount) <= 0
        ) {
            formIsValid = false;
            err['tokenCount'] = 'Please enter a valid number for token count.';
        }

        setErrors(err);
        return formIsValid;
    }, [formState, setErrors]); // dependencies

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const isValid = handleValidation();
            if (isValid) {
                toastId.current = toast('Minting NFT...', {
                    type: 'info',
                    autoClose: false,
                    isLoading: true,
                });
                const r = await ApiCall({
                    url: `/api/mint`,
                    method: 'GET',
                    params: formState,
                });
                console.log(r);
                setMintedNftDetails(r.data.result);
                setFormState(INITIAL_STATE);
                toast.update(toastId.current, {
                    type: 'success',
                    isLoading: false,
                    render: 'NFT minted successfully! ✅',
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.log(error);
            toast.update(toastId.current, {
                type: 'error',
                isLoading: false,
                render: error.response.data.statusText.replaceAll('Error:', ''),
                autoClose: 5000,
            });
            setMintedNftDetails(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = useCallback(() => {
        navigator.clipboard
            .writeText(JSON.stringify(mintedNftDetails, null, 2))
            .then(() => {
                // Successful copy
                toast('Copied to clipboard!', {
                    type: 'success',
                    autoClose: 3000,
                });
            })
            .catch((err) => {
                // Failed to copy
                console.error('Failed to copy text: ', err);
            });
    }, [mintedNftDetails]);

    const goBack = useCallback(() => {
        setFormState(INITIAL_STATE);
        setErrors({});
        setMintedNftDetails(null);
        setIsSubmitting(false);
    }, [setMintedNftDetails, setFormState]);

    return (
        <div className="mint-nft-form">
            {mintedNftDetails ? (
                <div className="response-container">
                    <h3>Your Minted NFT Details:</h3>
                    <pre className="response-details">
                        {JSON.stringify(mintedNftDetails, null, 2)}
                    </pre>
                    <div className="button-container">
                        <button onClick={copyToClipboard}>
                            Copy to Clipboard
                        </button>
                        <button onClick={goBack}>Back</button>
                    </div>
                </div>
            ) : (
                <>
                    <h2>Mint NFTs</h2>
                    <Form onSubmit={handleSubmit}>
                        {Object.keys(formState).map((key) => (
                            <Form.Field
                                key={key}
                                error={errors[key] ? true : false}
                            >
                                <label htmlFor={key}>
                                    {MINT_NFT_INPUT_DETAILS[key].label}
                                </label>
                                <Input
                                    name={key}
                                    placeholder={
                                        MINT_NFT_INPUT_DETAILS[key].placeholder
                                    }
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                                {errors[key] && (
                                    <div style={{ color: 'red' }}>
                                        {errors[key]}
                                    </div>
                                )}
                            </Form.Field>
                        ))}
                        <Button
                            type="submit"
                            color="teal"
                            disabled={isSubmitting}
                        >
                            Submit
                        </Button>
                    </Form>
                </>
            )}
        </div>
    );
};

export default MintNft;
