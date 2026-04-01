import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = [
  {
    inputs: [
      {
        internalType: "string[]",
        name: "_candidates",
        type: "string[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "option",
        type: "uint256",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "getVotes",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidate",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "votes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCandidates",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
];

const emojis ={
  Italian: "\u{1F35D}",
  Japanese: "\u{1F363}",
  Mexican: "\u{1F32E}",
  Indian: "\u{1F35B}",
}

const App = () => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [showVotes , setShowVotes] = useState(false)

  const getContract = (signer = false) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(
      contractAddress,
      contractABI,
      signer ? provider.getSigner() : provider
    );
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      return alert("install MetaMask to use this app");
    }
    try {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(account);
      setConnected(true);

      toast.success("connected to MetaMask");
      await loadContractData();
    } catch (err) {
      console.error("some error ocurred:", err);
      setOptions(["Italian", "Japanese" , "Mexican" , "Indian"]);
      setVotes([0, 0, 0, 0]);
    }
  };

  const loadContractData = async () => {
    try {
      const contract = getContract();
      const candidates = await contract.getCandidates();
      const votesBN = await contract.getVotes();
      setOptions(candidates);
      setVotes(votesBN.map((v) => v.toNumber()));
    } catch (err) {
      console.error("the contract has an error:", err);
      setOptions(["Italian", "Japanese" , "Mexican" , "Indian"]);
      setVotes([0, 0, 0, 0]);
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      toast("confirm in your wallet");

      const contract = getContract(true);
      const tx = await contract.vote(optionIndex, { gasLimit: 300000 });
      await tx.wait();

      const updatedVotes = await contract.getVotes();
      setVotes(updatedVotes.map((v) => v.toNumber()));
    } catch (err) {
      console.error("some error ocurred:", err);
      toast.error(`some error ocurred: ${err.message}`);
    }
  };


  const handelRevealVotes = async() => {
    try{
      const contract = getContract();
      const updatedVotes = await contract.getVotes();
      setVotes(updatedVotes.map((v) => v.toNumber()));
      setShowVotes(true);
    }catch (err) {
      console.error("some error occured:" , err);
      toast.err("could not reveal votes");
    }
  };

  return (
    <div className="container">
      <h1>
        vote for your favorite cuisine
      </h1>

      {!connected ? (
        <button onClick={connectWallet}>
          connect MetaMask whallet to vote
        </button>
      ) : (
        <div>
          <p className="account-info">
            connected as: {account.slice(0, 6)}...{account.slice(-4)}
          </p>

          <div className="options-list">
            {options.length === 0 && <div>loading options...</div>}

            {options.map((option, index) => (
              <div key={index} className="option-item">

                <h3>{emojis[option]} {option}</h3>
                <button onClick={() => handleVote(index)}>
                  click to vote
                </button>
                {showVotes && (
                  <p className="n-vote">
                    number of votes: {votes[index] ?? 0} 
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="rveal-b">
                <button onClick={handelRevealVotes}>
                  Reveal number of votes!
                </button>
          </div>      
        </div>
      )}
    </div>
  );
};

export default App;
