import Head from './header';
import React, { Component } from 'react';

class Layout extends Component {

    render() {
        const isLoggedIn = this.props.isLoggedIn;
        const userHash = this.props.userHash;
        return (
            <div>
                <div>

                    <Head isLoggedIn={isLoggedIn} userHash={userHash} />
                </div>
                <div>

                    {this.props.children}
                </div>
            </div >
        );
    }

}
export default Layout;
