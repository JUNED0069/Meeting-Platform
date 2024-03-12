const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, "contracts", "CreateMeet.sol");
const source = fs.readFileSync(campaignPath, "utf8");

const input = {
    language: "Solidity",
    sources: {
        "CreateMeet.sol": {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

try {
    const compiledOutput = JSON.parse(solc.compile(JSON.stringify(input)));

    if (compiledOutput.errors) {
        console.error("Compilation errors:", compiledOutput.errors);
        process.exit(1);
    }

    const compiledContracts = compiledOutput.contracts["CreateMeet.sol"];

    if (!compiledContracts) {
        console.error("No contracts found in the compilation output.");
        process.exit(1);
    }

    fs.ensureDirSync(buildPath);

    for (let contractFileName in compiledContracts) {
        const contractName = contractFileName.replace(".sol", "");
        const contractData = compiledContracts[contractFileName];
        fs.outputJsonSync(
            path.resolve(buildPath, contractName + ".json"),
            contractData
        );
    }

    console.log("Contracts compiled successfully.");
} catch (error) {
    console.error("Error compiling contracts:", error);
    process.exit(1);
}