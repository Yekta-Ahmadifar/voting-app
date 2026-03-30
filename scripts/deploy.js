import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy([
    "Italian", 
    "Japanese" , 
    "Mexican" , 
    "Indian"
  ]);
  await voting.waitForDeployment();
  const address = await voting.getAddress();

  console.log("voting contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
