import React, { useState, useEffect } from 'react';
import * as Icons from '../icons';

const ClientRegistrationSettings: React.FC = () => {
    const [registrationLink, setRegistrationLink] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const link = `${window.location.origin}/member-signup`;
        setRegistrationLink(link);
        // Using a free QR code API
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(link)}`);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(registrationLink).then(() => {
            setCopySuccess('Link copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Failed to copy link.');
            console.error('Could not copy text: ', err);
        });
    };

    const handleDownloadQr = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'fitable-registration-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Client Registration Link</h1>
            <p className="text-text-dark-secondary mt-1 mb-8">Share this link or QR code with prospective clients to let them sign up directly.</p>

            <div className="bg-card-dark rounded-lg shadow-md border border-border-dark p-6">
                <h2 className="text-lg font-semibold mb-4">Registration Link</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={registrationLink}
                        readOnly
                        className="flex-grow p-3 bg-background-dark rounded-md border border-border-dark text-text-dark-secondary"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center justify-center bg-primary-500 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600 w-full sm:w-auto"
                    >
                        <Icons.LinkIcon className="w-5 h-5 mr-2" />
                        {copySuccess ? copySuccess : 'Copy Link'}
                    </button>
                </div>
                
                <div className="border-t border-border-dark my-8"></div>

                <h2 className="text-lg font-semibold mb-4">QR Code</h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white p-4 rounded-lg">
                        {qrCodeUrl && <img src={qrCodeUrl} alt="Registration QR Code" width="256" height="256" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-text-dark-secondary mb-4">
                            Download this QR code and print it for your front desk, flyers, or posters. 
                            Clients can scan it with their phone to go directly to the sign-up page.
                        </p>
                        <button
                            onClick={handleDownloadQr}
                            className="flex items-center justify-center bg-card-dark text-text-dark-primary px-4 py-2 rounded-md font-medium hover:bg-border-dark border border-border-dark w-full md:w-auto"
                        >
                            <Icons.DownloadIcon className="w-5 h-5 mr-2" />
                            Download QR Code (.png)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientRegistrationSettings;
