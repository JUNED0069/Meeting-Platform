import React, { Component } from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Router } from '../routes';
import Link from 'next/link';
class Head extends Component {

    constructor(props) {
        super(props);

        this.state = {
            Loader: false,
            isLoggedIn: props.isLoggedIn,
            account: props.account,
            button: props.isLoggedIn ? 'Log out' : null,
            userHash: props.userHash
        };
    }

    logOut = () => {
        this.setState({ Loader: true });
        setTimeout(() => {
            this.setState({ Loader: false });

            (this.state.button == 'Log out') ?
                Router.pushRoute('/') :
                Router.pushRoute(`/users/${this.state.account}`);
        }, 2000);

    }

    render() {

        return (
            <Menu inverted pointing style={{ height: '60px' }}>
                <Menu.Menu >
                    <Link href="/" >
                        <img
                            src='../icons/icon.png'
                            style={{ cursor: 'pointer', width: '60px', height: '60px', padding: '10px', marginLeft: '10px' }}
                            onClick={this.login} />

                    </Link>
                    <label style={{ marginTop: '20px', fontSize: 20, color: 'white' }}>MEETY</label>
                </Menu.Menu>

                {this.state.isLoggedIn &&
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            My recordings
                        </Menu.Item>
                        <Menu.Item>
                            <Button onClick={this.logOut} loading={this.state.Loader} >{this.state.button}</Button>

                        </Menu.Item>

                        <Menu.Item>
                            <Icon name='user' onClick={this.routeUserPage} />
                        </Menu.Item>
                    </Menu.Menu>
                }

            </Menu >

        );
    }
}

export default Head;