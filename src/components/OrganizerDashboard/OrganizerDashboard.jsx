import './OrganizerDashboard.scss';

import { Suspense, lazy } from 'react';

import { Tab } from 'semantic-ui-react';

// Lazily load tab components
const MintNft = lazy(() => import('../mintNft/mintNft'));
// const NftDistribution = lazy(() => import('../NftDistribution/NftDistribution'));
// const AttendeeLookup = lazy(() => import('../AttendeeLookup/AttendeeLookup'));
// const NftVerification = lazy(() => import('../NftVerification/NftVerification'));

const panes = [
    {
        menuItem: 'Mint/View/Distribute XLS-20 NFTs',
        render: () => (
            <Tab.Pane>
                <Suspense fallback={<div>Loading...</div>}>
                    <MintNft />
                </Suspense>
            </Tab.Pane>
        ),
    },
    {
        menuItem: 'Distribution of NFTs',
        render: () => <Tab.Pane></Tab.Pane>,
    },
    {
        menuItem: 'Attendee Lookup & Verification',
        render: () => <Tab.Pane></Tab.Pane>,
    },
    {
        menuItem: 'Verification of NFT Ownership',
        render: () => <Tab.Pane></Tab.Pane>,
    },
];

const OrganizerDashboard = () => {
    return <Tab className="custom-tab" panes={panes} />;
};

export default OrganizerDashboard;
