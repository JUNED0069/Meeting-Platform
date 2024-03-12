import React, { Component } from 'react';
import { Header, Grid, Button, Message, Dimmer, Loader, Statistic, Form } from 'semantic-ui-react';
import Head from 'next/head';
import Layout from '../Components/layout';
import 'semantic-ui-css/semantic.min.css';
import styles from '../Components/layout.module.css';
import web3 from '../Ethereum/web3';
import { Router } from '../routes';
import createMeet from '../Ethereum/CreateMeet';

class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoggedIn: false,
            isSignedUp: false,
            account: '',
            contract: '',
            loaderLogging: false,
            loaderSigning: false,
            errLoggedIn: false,
            errSigningUp: false,
            userCount: 0,
            name: '',
            organizationName: '',
            isFormFrozen: false
        };
    }

    async componentDidMount() {
        this.initialize();
        this.showUserCount();
        this.interval = setInterval(() => this.showUserCount(), 5000);
        const meet = createMeet;
        console.log(meet);
    }

    initialize = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                this.setState({ account: accounts[0] }, () => {
                    console.log(`Your account address is ${this.state.account}`);
                });
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
    }

    checkLogging = async () => {

        let hasRegistered = await createMeet.methods.isRegistered(this.state.account).call();
        console.log(hasRegistered);
        return hasRegistered;
    }

    login = async () => {

        this.setState({ errSigningUp: false })
        const hasRegistered = await this.checkLogging();

        if (hasRegistered) {

            this.setState({ loaderLogging: true, isLoggedIn: true });
            setTimeout(() => {
                this.setState({ loaderLogging: false }, () => {
                    Router.push({
                        pathname: '/details',
                        query: { userHash: this.state.account }
                    });
                });
            }, 3000);
        } else {
            this.setState({ errLoggedIn: true });
        }
    }


    signUp = async () => {
        if (this.state.name != null && this.state.organizationName != null) {

            let hasRegistered;
            this.setState({ errLoggedIn: false });
            this.setState({ loaderSigning: true, isSignedUp: false });

            hasRegistered = await this.checkLogging();

            if (hasRegistered == 0) {

                try {
                    const { name, organizationName } = this.state;
                    await createMeet.methods.register(name, organizationName, this.state.account).send({
                        from: this.state.account
                    });

                    this.setState({ isSignedUp: true });
                } catch (error) {
                    console.error("Login transaction failed:", error);
                }

            } else {
                this.setState({ errSigningUp: true });
            }

            this.setState({ loaderSigning: false });
        } else {
            alert('Please fill the form and submit to signUp')
        }
    }

    showUserCount = async () => {
        try {
            let userCount = await (async () => {
                return await createMeet.methods.usersCount().call();
            })();
            userCount = Number(userCount);
            this.setState({ userCount });
        } catch (error) {
            console.error('Error fetching user count:', error);
        }
    }

    handleChange = (e, data) => {
        if (e && e.target) {
            const { name, value } = e.target;
            this.setState({ [name]: value });
        } else if (data && data.name && data.value) {
            const { name, value } = data;
            this.setState({ [name]: value });
        }
    };

    updateUserInfo = () => {
        this.setState({ isFormFrozen: true });
        alert('Form has been submitted')
    }

    render() {
        const warningMssg = `We couldnt find you account ${this.state.account} in our database.`
        const warningRegistered = `The account ${this.state.account} is already registered`
        return (
            <Layout isLoggedIn={this.state.isLoggedIn}>
                <Head>
                    <title>Meety</title>
                </Head>
                <Header
                    style={{
                        marginTop: '60px',
                        fontSize: '3em',
                        paddingLeft: '300px',
                        paddingRight: '300px',
                    }}
                >
                    <span style={{ fontFamily: 'Tahoma' }}>
                        An online conferencing platform that lets you connect with people without having to care about
                        security issues
                    </span>
                </Header>
                {
                    this.state.loaderLogging &&
                    <Dimmer active page>
                        <Loader size="massive">Logging in</Loader>
                    </Dimmer>
                }
                <Grid columns={2} className={styles.full}>

                    <Grid.Column>

                        <Grid.Row style={{ marginTop: '50px' }}>

                            <Statistic style={{ fontFamily: 'Trajan Pro, sans-serif', fontWeight: 'bold', fontSize: 20, marginLeft: '50px' }}>
                                <Statistic.Value>{this.state.userCount}</Statistic.Value>
                                <Statistic.Label>People connected</Statistic.Label>
                            </Statistic>
                        </Grid.Row>

                        <Grid.Row style={{ marginLeft: '150px', marginTop: '50px' }}>

                            <Form>
                                <Form.Field>
                                    <label>Name</label>
                                    <input
                                        placeholder='First name'
                                        disabled={this.state.isFormFrozen}
                                        name='name'
                                        value={this.state.name}
                                        onChange={this.handleChange}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Organization/company Name</label>
                                    <input
                                        placeholder='Organization/company'
                                        disabled={this.state.isFormFrozen}
                                        name='organizationName'
                                        value={this.state.organizationName}
                                        onChange={this.handleChange}></input>
                                </Form.Field>

                                <Button
                                    type='submit'
                                    content="Submit"
                                    onClick={this.updateUserInfo}
                                    loading={this.state.formLoader}
                                    disabled={this.state.isFormFrozen}
                                />
                            </Form>
                        </Grid.Row>

                        <Grid.Row>

                            <label
                                style={{
                                    position: 'absolute',
                                    marginTop: '50px',
                                    fontSize: '25px',
                                    marginLeft: '50px',
                                    fontFamily: 'Tahoma',
                                    fontWeight: 'bold'
                                }}>
                                Login to begin the meeting</label>
                        </Grid.Row>

                        <Grid.Row style={{ marginTop: '85px' }}>

                            <Button
                                primary
                                onClick={this.login}
                                loading={this.state.loaderLogging}
                                style={{
                                    position: 'absolute',
                                    marginLeft: '50px'
                                }}>Login</Button>

                            <Button
                                secondary
                                loading={this.state.loaderSigning}
                                onClick={this.signUp}
                                style={{
                                    position: 'absolute',
                                    marginLeft: '150px'
                                }}>SignUp</Button>
                        </Grid.Row>

                        <Grid.Row style={{ marginTop: '120px' }}>

                            <Message
                                hidden={!this.state.errLoggedIn}
                                warning
                                style={{
                                    position: 'absolute',
                                    marginLeft: '50px'
                                }}>
                                <Message.Header>
                                    {warningMssg}
                                </Message.Header>
                                <p>Please SignUp with this account to continue</p>
                            </Message>
                            <Message
                                hidden={!this.state.errSigningUp}
                                warning
                                style={{
                                    position: 'absolute',
                                    marginLeft: '50px'
                                }}>
                                <Message.Header>
                                    {warningRegistered}
                                </Message.Header>
                                <p>Please Login with this account to continue</p>
                            </Message>
                            {
                                this.state.isSignedUp &&
                                <Message
                                    success
                                    style={{
                                        position: 'absolute',
                                        marginLeft: '50px'
                                    }}>
                                    <Message.Header>
                                        Your account has been registered successfully.
                                    </Message.Header>
                                    <p>Please Login with this account to continue</p>
                                </Message>
                            }
                        </Grid.Row>
                    </Grid.Column>

                    <Grid.Column className={styles.fullSegment} >
                        <img src="../icons/meety.png" style={{ width: '900px', height: '600px', marginLeft: '0px' }} />
                    </Grid.Column>

                </Grid>
            </Layout >
        );
    }
};

export default HomePage;