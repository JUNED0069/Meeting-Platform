const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const Meet = require("./build/CreateMeet.json");

const provider = new HDWalletProvider(
    'mechanic language security immune win robust scare vendor brave tattoo useful tent',
    "https://sepolia.infura.io/v3/e5be8253deb043babb64f733b4ba5fb0"
);
const web3 = new Web3(provider);
const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();

        console.log("Attempting to deploy from account", accounts[0]);

        const meetResult = await new web3.eth.Contract(Meet.abi)
            .deploy({
                data: Meet.evm.bytecode.object
            })
            .send({ gas: 5000000, from: accounts[0] });

        console.log("CreateMeet contract deployed to", meetResult.options.address);

        provider.engine.stop();
    } catch (error) {
        console.error("Error during deployment:", error);
    }
};

deploy().catch((error) => {
    console.error("Unhandled promise rejection:", error);
});
