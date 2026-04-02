import express from "express";
import cors from "cors";
import {ethers} from "ethers";



const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
    {
        inputs: [],
        name: "getVotes",
        outputs: [
            {
                internalType: "uint256[]" ,
                name: "",
                type: "uint256[]"
            }
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getCandidates",
        outputs: [
            {
                internalType: "string[]" ,
                name: "",
                type: "string[]"
            }
        ],
        stateMutability: "view",
        type: "function",
    },

    {
        inputs: 
        [
            {
                internalType: "address" ,
                name: "",
                type: "address"

            }
        ],
        name: "hasVoted",
        outputs: [
            {
                internalType: "bool" ,
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function",
    },
];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract(contractAddress, contractABI, provider);

app.get("/api/candidates" , async(req, res) =>{
    try
    {
        const candidates = await contract.getCandidates();
        res.json({ candidates });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Could not fetch candidate"})
    }
});

app.get("/api/votes" , async(req, res) =>{
    try
    {
        const votesBN = await contract.getVotes();
        const votes = votesBN.map((v) => v.toString());
        res.json({ votes });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Could not fetch votes"})
    }
});

app.get("/api/results" , async(req, res) =>{
    try
    {
        const [candidates , votesBN] = await Promise.all([
            contract.getCandidates(),
            contract.getVotes(),
        ]);
        const votes = votesBN.map((v) => v.toString());
        const results = candidates.map((candidate, index) => ({
            id: index,
            candidate,
            votes: votes[index] ?? 0, 
        }));
        res.json({ results });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Could not fetch results"})
    }
});

app.get("/api/has-voted/:address" , async(req, res) =>{
    try
    {
        const { address } = req.params;
        if(!ethers.isAddress(address))
        {
        return res.status(400).json({error:"invalid Wallet address"})
        }
        const hasVoted = await contract.hasVoted(address);
        res.json({address , walletNo})

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Could not check voter status"})
    }
});

const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

