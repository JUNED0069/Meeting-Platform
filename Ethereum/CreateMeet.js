import web3 from './web3';
import CreateMeet from './build/CreateMeet.json';

const instance = new web3.eth.Contract(
    CreateMeet.abi,
    '0xbF41248f8d03E8b21844cdB15B7A9331Ef6482E8'
);

export default instance;
