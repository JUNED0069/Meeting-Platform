import React, { useEffect, useState } from 'react';
import web3 from '../../Ethereum/web3';
import dynamic from 'next/dynamic';

const DynamicComponentWithNoSSR = dynamic(() => import('agora-rtc-sdk-ng'), {
    ssr: false,
});

const MeetPage = () => {
    const [account, setAccount] = useState(null);
    const [client, setClient] = useState(null);
    const [agora, setAgora] = useState(null);

    const APP_ID = "b81053e90307440381920a540ba00586";
    const TOKEN = "007eJxTYKjMOz5pQkjM7QNNZQ/OecvyXHzcKLV6yaY2LWFGud9mazgUGJIsDA1MjVMtDYwNzE1MDIwtDC2NDBJNTQySEg0MTC3Mru5PTG0IZGTwmv6XkZEBAkF8FobcxMw8BgYAGsIecQ==";
    const CHANNEL = "main";

    let localTracks = [];
    let remoteUsers = {};

    useEffect(() => {
        const initialize = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
                } catch (err) {
                    if (err.code === 4001) {
                        console.log('User rejected the request.');
                    } else {
                        console.log(err);
                    }
                }
            } else {
                console.log('Install Metamask');
            }
            console.log("Current account:", account);
        };
        const loadAgoraRTC = async () => {
            const AgoraRTC = await import('agora-rtc-sdk-ng');
            setAgora(AgoraRTC);
            const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            setClient(client);
        };

        initialize();

        if (typeof window !== 'undefined') {
            loadAgoraRTC();
        }

        console.log("Current account:", account);
    }, []);

    useEffect(() => {
        const displayMeet = async () => {
            if (client && agora) {
                const UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
                localTracks = await agora.createMicrophoneAndCameraTracks();
                const player = (
                    <div className="video-container" id={`user-container-${UID}`}>
                        <div className="video-player" id={`user-${UID}`}></div>
                    </div>
                );
                document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
            }
        };

        displayMeet();
    }, [client, agora]);

    return (
        <div>
            <h1>This is your meet!</h1>
            <div id="video-streams"></div>
        </div>
    );
};

export default MeetPage;
