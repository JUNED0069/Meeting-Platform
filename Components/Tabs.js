import React, { Component } from 'react';
import { Tab, Sticky, Menu, Input, Segment, Item, Icon, Divider } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import meet from '../Ethereum/CreateMeet';

class Tabs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            meetingsCount: parseInt(props.meetingsCount),
            meetings: null
        };

        this.ref = React.createRef();
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.meetingsCount !== this.props.meetingsCount) {
            this.setState({ meetingsCount: parseInt(this.props.meetingsCount) }, () => {
                this.fetchData();
            });
        }
    }

    fetchData = async () => {
        const meetings = await meet.methods.getMeetings().call();
        this.setState({ meetings });
    };

    myRecordings = () => {
        return (
            <label>No recordings yet</label>
        );
    };

    displayMeetings = () => {
        if (!this.state.meetings || !Array.isArray(this.state.meetings)) {
            return <div key={10000}>No meetings available</div>;
        }
        let index = -1;
        const jsx = this.state.meetings.map((meet) => {
            index++;
            const startTime = new Date(parseInt(meet.startTime) * 1000);
            const formattedStartTime = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return (
                <Item key={index}>
                    <Item.Content>
                        <Item.Header>{meet.title}</Item.Header>
                        <label style={{ position: 'absolute', right: '150px' }}>Date: </label>
                        <Item.Meta>
                            <span>Current attendees: {parseInt(meet.attendeesCount)}</span>
                            <span>Max: {parseInt(meet.maxAttendees)}</span>
                        </Item.Meta>
                        <div style={{ marginTop: '20px' }}>
                            <Icon name='clock' />
                            <label>Started at {formattedStartTime}</label>
                        </div>
                        <Divider />
                    </Item.Content>
                </Item>
            );
        });

        return jsx;
    };

    meetingHistory = () => {
        return (
            this.state.meetingsCount === 0 ? (
                <>
                    <label>Start your first meet now:)</label>
                </>
            ) : (
                <div style={{ position: 'relative' }}>
                    <div ref={this.ref} style={{ zIndex: 1 }}>
                        <Sticky context={this.ref}>
                            <Menu attached='top' tabular>
                                <Menu.Item active as='a'>
                                    Meetings
                                </Menu.Item>
                                <Menu.Menu position='right'>
                                    <Menu.Item>
                                        <Input transparent placeholder='Search by meeting title' icon={{ name: 'search', link: true }} />
                                    </Menu.Item>
                                </Menu.Menu>
                            </Menu>
                        </Sticky>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <Segment style={{ overflowY: 'auto', maxHeight: '700px' }}>
                            <Item.Group>
                                {this.displayMeetings()}
                            </Item.Group>
                        </Segment>
                    </div>
                </div>

            )
        );
    };



    render() {
        const panes = [
            { menuItem: 'Meeting History', render: () => <Tab.Pane>{this.meetingHistory()}</Tab.Pane> },
            { menuItem: 'My Recordings', render: () => <Tab.Pane>{this.myRecordings()}</Tab.Pane> }
        ];

        return (
            <Tab
                menu={{ fluid: true, vertical: true, tabular: true }}
                panes={panes}
            />
        );
    }
}

export default Tabs;
