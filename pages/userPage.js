import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import Layout from '../Components/layout';
import meet from '../Ethereum/CreateMeet';
import web3 from '../Ethereum/web3';
import { Grid, Header, Button, Modal, Form, Breadcrumb, Label, Input } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import Tabs from '../Components/Tabs';
import { Router } from '../routes';

const UserPage = () => {
    const router = useRouter();
    const { userHash } = router.query;

    const [name, setName] = useState('');
    const [organizationName, setOrg] = useState('');
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [stTime, setStTime] = useState('');
    const [duration, setDuration] = useState('');
    const [maxAtt, setMaxAtt] = useState('');
    const [loading, setLoading] = useState(false);
    const [meetingsCount, setMeetingsCount] = useState(0);
    const [currAcc, setCurrAcc] = useState('');
    let [address, setAddress] = useState('');
    let [accDontMatch, setAccDontMatch] = useState(false);
    const [modalAccnt, setModalAccnt] = useState(false);
    const [codeCreated, setCodeCreated] = useState(false);
    const [joiningCode, setJoiningCode] = useState(0);
    const [clickedJoinButton, setClickedJoinButton] = useState(false);
    let [inputCode, setInputCode] = useState('');
    const [invalidCode, setInvalidCode] = useState(false);
    const [joinMeetLoader, setJoinMeetLoader] = useState(false);
    const [successMssg, setSuccessMssg] = useState('');

    const clearForm = () => {
        setOpen(false);
        setLoading(false);
        setTitle('');
        setStTime('');
        setDuration('');
        setMaxAtt('');
    };

    const joinMeeting = async () => {
        setLoading(true);

        if (step === 3) {
            if (title === '' || stTime === '' || duration === '') {
                alert('Please fill in all the information');
                setLoading(false);
                return;
            }
        } else if (step === 2) {
            if (title === '' || duration === '') {
                alert('Please fill in all the information');
                setLoading(false);
                return;
            }
        }

        if (maxAtt == 0) {
            alert('there cannt be 0 attendies');
            setLoading(false);
            return;
        } else if (maxAtt < 0) {
            alert('Number of Attendees should be positive');
            setLoading(false);
            return;
        }

        let stTimeinMinutes;
        let durationinMinutes;

        if (stTime === '') {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            setStTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            stTimeinMinutes = hours * 60 + minutes;
        } else if (!isValidTimeFormat(stTime)) {
            alert('Enter in hh:mm format. h=hour, m=minute');
            setLoading(false);
            return;
        } else {
            const hours = parseInt(stTime.substring(0, 2));
            const minutes = parseInt(stTime.substring(3, 5));
            stTimeinMinutes = hours * 60 + minutes;
        }

        if (!isValidTimeFormat(duration)) {
            alert('Please fill the duration in proper format (hh:mm)');
            setLoading(false);
            return;
        } else {
            const hrs = parseInt(duration.substring(0, 2));
            const mins = parseInt(duration.substring(3, 5));
            durationinMinutes = hrs * 60 + mins;
        }

        const returnCode = await meet.methods.createMeeting(title, stTimeinMinutes, durationinMinutes, maxAtt).send({
            from: currAcc
        });

        let code = returnCode.events.MeetingCreated.returnValues.code;
        code = parseInt(code);
        console.log(code);
        setJoiningCode(code);

        const meetingCount = await meet.methods.getMeetingCount().call();
        setMeetingsCount(meetingCount);

        setLoading(false);
        clearForm();
        setCodeCreated(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (userHash !== undefined) {
                const addressTemp = web3.utils.toChecksumAddress(userHash);
                setAddress(addressTemp);
                await initialize();
                if (currAcc != '') {

                    const info = await meet.methods.users(currAcc).call();
                    const meetingCount = await meet.methods.getMeetingCount().call();
                    setMeetingsCount(parseInt(meetingCount));
                    setName(info.name);
                    setOrg(info.organization);
                }
                if (address != currAcc) {
                    setAccDontMatch(true);
                    setModalAccnt(true);
                }
            }
        };

        if (userHash !== undefined) {
            fetchData();
        }
    }, [currAcc, router, userHash]);

    const ariseAccntErr = () => {
        return (
            <Modal
                size='small'
                open={modalAccnt}
                onClose={() => setModalAccnt(false)}
            >
                <Modal.Header>Your account {currAcc} is not registered.</Modal.Header>
                <Modal.Content>
                    <p>Please signup and continue</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={() => { setModalAccnt(false); Router.push('/'); }}>
                        Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    const initialize = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                setCurrAcc(accounts[0]);
                console.log("Current account:" + accounts[0]);
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
    };

    const isValidTimeFormat = (time) => {
        if (time.length !== 5) {
            return false;
        }
        const regex = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(time);
    };

    const handleInputChange = (e) => {
        setStTime(e.target.value);
    };

    const form = () => {
        return (
            <Form style={{ marginTop: '20px' }}>
                <Form.Field style={{ marginTop: '10px' }}>
                    <Form.Group widths="equal">
                        <Form.Field>
                            <Label style={{ fontSize: 15 }}>Topic of discussion</Label>
                            <Input placeholder='Eg.Technologies,sports,etc.' style={{ height: '40px', width: '300px', marginTop: '10px' }} value={title} onChange={(e) => { setTitle(e.target.value) }} />
                        </Form.Field>
                        <Form.Field disabled={step == 2}>
                            <Label style={{ fontSize: 15 }}>Start Time(24hr)</Label>
                            <Input placeholder='00:00-for 12am' style={{ height: '40px', width: '300px', marginTop: '10px' }} value={stTime} onChange={handleInputChange} />
                        </Form.Field>
                    </Form.Group>
                </Form.Field>
                <Form.Field style={{ marginTop: '40px' }}>
                    <Form.Group widths="equal">
                        <Form.Field>
                            <Label style={{ fontSize: 15 }}>Duration of the meet</Label>
                            <Input placeholder='in hours' value={duration} onChange={(e) => { setDuration(e.target.value) }} style={{ height: '40px', width: '300px', marginTop: '10px' }} />
                        </Form.Field>
                        <Form.Field>
                            <Label style={{ fontSize: 15 }}>Maximum Number of attendees</Label>
                            <Input placeholder='maximum 10 attendees allowed' value={maxAtt} onChange={(e) => { setMaxAtt(e.target.value) }} style={{ height: '40px', width: '300px', marginTop: '10px' }} />
                        </Form.Field>
                    </Form.Group>
                </Form.Field>
            </Form>
        );
    };

    const modal = () => {
        return (
            <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                dimmer='blurring'
                trigger={<Button secondary style={{ marginLeft: '150px', marginTop: '5px', width: '200px', height: '40px' }}>Create a new Meeting</Button>}
            >
                <Modal.Header>Hello {name} from {organizationName} <br />
                    <h4>Fill the details real quick!</h4>
                </Modal.Header>
                <Modal.Content>
                    {step === 1 && (
                        <>
                            <label style={{ fontsize: '15px' }}>What would be your choice for the meeting?</label>
                            <div>
                                <Button
                                    style={{ marginLeft: '30px', marginTop: '20px' }}
                                    content='Create and join an instant meet'
                                    color='red'
                                    onClick={() => { setStep(2) }}
                                />
                                <Button
                                    style={{ marginLeft: '30px' }}
                                    content='Schedule a meeting for later'
                                    primary
                                    onClick={() => { setStep(3) }}
                                />
                            </div>
                        </>
                    )}
                    {step === 2 &&
                        <>
                            <Breadcrumb>
                                <Breadcrumb.Divider icon='left arrow' />
                                <Breadcrumb.Section link onClick={() => { setStep(1) }}>Go back</Breadcrumb.Section>
                            </Breadcrumb>
                            {form()}
                        </>
                    }
                    {step === 3 &&
                        <>
                            <Breadcrumb>
                                <Breadcrumb.Divider icon='left arrow' />
                                <Breadcrumb.Section link onClick={() => { setStep(1) }}>Go back</Breadcrumb.Section>
                            </Breadcrumb>
                            {form()}
                        </>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={clearForm}>
                        Exit
                    </Button>
                    <Button
                        content="Start a new Meet"
                        onClick={joinMeeting}
                        loading={loading}
                        positive
                        disabled={step == 1}
                    />
                </Modal.Actions>
            </Modal>
        );
    };

    const createCode = () => {
        return (
            <Modal
                onClose={() => setCodeCreated(false)}
                onOpen={() => setCodeCreated(true)}
                open={codeCreated}
                dimmer='blurring'
            >
                <Modal.Header style={{ color: 'green' }}>
                    Meeting has been created successfully
                </Modal.Header>

                <Modal.Content style={{ textAlign: 'center' }}>
                    <span>Share this code to let people join this meeting!</span>
                    <br />
                    <label style={{ fontSize: '60px', fontWeight: 'bold' }}>{joiningCode}</label>
                </Modal.Content>

                <Modal.Actions style={{ justifyContent: 'center' }}>
                    <Button onClick={() => { setCodeCreated(false) }} secondary>
                        Exit
                    </Button>
                </Modal.Actions>
            </Modal>

        )
    }

    const handleJoinMeet = async () => {
        //To handle what happens when you submit the code on the 'join the meet' button
        console.log(inputCode);
        if (inputCode == '') {
            alert('Please enter the 5 digit room code ');
        } else {
            setInputCode(parseInt(inputCode));
            setJoinMeetLoader(true);
            const isValid = await meet.methods.isCodeValid(inputCode).call();
            if (!isValid) {
                setInvalidCode(true);
                setJoinMeetLoader(false);
            } else {
                const currAttendees = await meet.methods.getMeetingAttendees(inputCode).call();
                console.log(currAttendees);
                if (currAttendees.includes(currAcc)) {
                    console.log('You have already joined the meeting.');
                    Router.push({ pathname: '/videoMeet/conference' });
                    return;
                } else {
                    await meet.methods.joinMeeting(inputCode).send({ from: currAcc });
                }
                try {
                    await meet.methods.getMeetingAttendees(inputCode).call();
                    setSuccessMssg('Joined the meet successfully!');
                } catch (err) {
                    console.log(err);
                }
                Router.push({ pathname: '/videoMeet/conference' });
            }
            setJoinMeetLoader(false);
        }

    }
    const handleCodeInputChange = (e) => {
        setInvalidCode(false);
        const inputValue = e.target.value;
        if (!inputValue || /^\d+$/.test(inputValue)) {
            setInputCode(inputValue);
        }
    };
    const joinTheMeet = () => {
        return (
            <Modal
                open={clickedJoinButton}
                dimmer='blurring'
            >
                <Modal.Header style={{ color: 'green' }}>
                    Enter the meeting code to join
                </Modal.Header>

                <Modal.Content style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: 20, fontFamily: 'Helvetica' }}>Enter code here:</label>
                    <br />
                    <Input
                        value={inputCode}
                        onChange={handleCodeInputChange}
                        style={{
                            height: '60px',
                            fontWeight: 'bold',
                            marginTop: '20px',
                            border: '2px solid #000',
                            borderRadius: '5px',
                            width: '200px',
                            fontSize: '24px',
                            paddingLeft: '10px',
                        }}
                    />
                    <br />
                    {invalidCode && <label style={{ color: 'red', fontSize: '15px', marginTop: '20px' }}>Invalid meeting code</label>}
                    <label style={{ color: 'Green', fontSize: '15px', marginTop: '20px' }}>{successMssg}</label>
                </Modal.Content>


                <Modal.Actions style={{ justifyContent: 'center' }}>
                    <Button onClick={handleJoinMeet} loading={joinMeetLoader} color='green' disabled={successMssg != ''}>
                        Join
                    </Button>
                    <Button onClick={() => { setClickedJoinButton(false); setInvalidCode(false); setSuccessMssg(''); setInputCode(null); }} color='black'>
                        cancel
                    </Button>
                </Modal.Actions>
            </Modal>

        )
    }
    return (
        <div>
            <Layout isLoggedIn={true} userHash={userHash}>
                {accDontMatch && ariseAccntErr()}
                {createCode()}
                {joinTheMeet()}
                <Grid columns={2}>

                    <Grid.Column>
                        <Tabs meetingsCount={meetingsCount}></Tabs>
                    </Grid.Column>
                    <Grid.Column>
                        <Header as='h1' style={{ marginLeft: '300px', marginTop: '350px', size: '50px' }}>
                            Create or join a meeting
                        </Header>
                        {modal()}
                        <Button color='blue' style={{ marginLeft: '200px', width: '200px', height: '40px' }} onClick={() => setClickedJoinButton(true)}>Join a meeting</Button>
                    </Grid.Column>
                </Grid>
            </Layout>
        </div >
    );
};

export default UserPage;