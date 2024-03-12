// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CreateMeet {
    address public creator;
    uint public usersCount = 0;

    struct User {
        string name;
        string organization;
        address userHash;
    }

    struct Meeting {
        address organizer;
        string title;
        uint startTime;
        uint duration;
        mapping(address => bool) attendees;
        address[] attendeesList;
        uint maxAttendees;
        uint attendeesCount;
        uint joiningCode;
    }

    Meeting[] public meetings;

    mapping(address => User) public users;
    mapping(address => bool) public registeredUsers;
    mapping(address => mapping(uint => uint))
        public organizerToMeetingCodeToIndex;

    mapping(uint => address) public codeToOraganizer;
    uint[] public codes;

    event MeetingCreated(
        uint indexed meetingIndex,
        address indexed organizer,
        string title,
        uint startTime,
        uint duration,
        uint code
    );

    event UserRegistered(
        address indexed user,
        string name,
        string organization,
        address userHash
    );

    event AttendeeRegistered(
        uint indexed meetingIndex,
        address indexed attendee
    );

    modifier onlyOwner() {
        require(msg.sender == creator, "Only the owner can call this function");
        _;
    }

    function getUserInfo(address user) public view returns (User memory) {
        User memory curr = users[user];
        return curr;
    }

    function register(string memory name, string memory organization) public {
        require(!registeredUsers[msg.sender], "User is already registered");

        users[msg.sender] = User({
            name: name,
            organization: organization,
            userHash: msg.sender
        });

        registeredUsers[msg.sender] = true;
        creator = msg.sender;
        usersCount++;
        emit UserRegistered(msg.sender, name, organization, msg.sender);
    }

    function _generateRandomNumber() private view returns (uint16) {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint16 randomNumber = uint16(blockValue % 1000000);
        return randomNumber;
    }

    function createMeeting(
        string memory title,
        uint startTimeInMinutes,
        uint durationInMinutes,
        uint maxAttendees
    ) public returns (uint passCode) {
        require(registeredUsers[msg.sender], "User is not registered");
        require(
            maxAttendees > 0 && maxAttendees <= 10,
            "Invalid maxAttendees value"
        );

        uint startTime = startTimeInMinutes * 60;
        uint duration = durationInMinutes * 60;

        uint code = _generateRandomNumber();
        codes.push(code);

        Meeting storage newMeeting = meetings.push();
        newMeeting.organizer = msg.sender;
        newMeeting.title = title;
        newMeeting.startTime = startTime;
        newMeeting.duration = duration;
        newMeeting.joiningCode = code;
        newMeeting.maxAttendees = maxAttendees;

        uint newIndex = meetings.length - 1;

        organizerToMeetingCodeToIndex[msg.sender][code] = newIndex;
        codeToOraganizer[code] = msg.sender;

        emit MeetingCreated(
            newIndex,
            msg.sender,
            title,
            startTime,
            duration,
            code
        );

        return code;
    }

    function joinMeeting(uint code) public {
        address invitor = codeToOraganizer[code];
        uint meetingIndex = organizerToMeetingCodeToIndex[invitor][code];

        Meeting storage meeting = meetings[meetingIndex];

        require(registeredUsers[msg.sender], "User is not registered");
        require(
            !meeting.attendees[msg.sender],
            "User is already registered for this meeting"
        );
        require(
            meeting.maxAttendees >= meeting.attendeesCount,
            "No room for more attendees in the meeting"
        );

        meeting.attendeesCount++;
        meeting.attendeesList.push(msg.sender);
        meeting.attendees[msg.sender] = true;
        emit AttendeeRegistered(meetingIndex, msg.sender);
    }

    function getMeetingAttendees(
        uint code
    ) public view returns (address[] memory) {
        address invitor = codeToOraganizer[code];
        uint meetingIndex = organizerToMeetingCodeToIndex[invitor][code];
        require(meetingIndex < meetings.length, "Invalid meeting index");
        Meeting storage meeting = meetings[meetingIndex];

        return meeting.attendeesList;
    }

    function getMeetingCount() public view returns (uint) {
        return meetings.length;
    }

    function isRegistered(address user) public view returns (uint) {
        if (registeredUsers[user] == true) {
            return 1;
        } else {
            return 0;
        }
    }

    function getMeetings() public view returns (MeetingInfo[] memory) {
        uint meetingsCount = meetings.length;
        MeetingInfo[] memory meetingsInfo = new MeetingInfo[](meetingsCount);

        for (uint i = 0; i < meetingsCount; i++) {
            meetingsInfo[i] = MeetingInfo({
                organizer: meetings[i].organizer,
                title: meetings[i].title,
                startTime: meetings[i].startTime,
                duration: meetings[i].duration,
                maxAttendees: meetings[i].maxAttendees,
                attendeesCount: meetings[i].attendeesCount
            });
        }

        return meetingsInfo;
    }

    function isCodeValid(uint code) public view returns (bool) {
        for (uint i = 0; i < codes.length; i++) {
            if (codes[i] == code) {
                return true;
            }
        }
        return false;
    }

    receive() external payable {
        revert("Fallback function not allowed");
    }

    struct MeetingInfo {
        address organizer;
        string title;
        uint startTime;
        uint duration;
        uint maxAttendees;
        uint attendeesCount;
    }
}
