// src/app/api/deployer/route.js
import { StellarSdk } from 'stellar-sdk';
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';

// Configuration
const HORIZON_URL = 'https://horizon-futurenet.stellar.org'; // Futurenet
const NETWORK_PASSPHRASE = StellarSdk.Networks.FUTURENET; // Futurenet
const server = new StellarSdk.Server(HORIZON_URL);

// tell next.js NOT to parse the body
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req, res) {
  try {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject({ err });
                return;
            }
            resolve({ fields, files });
        });
    });

    // Get the private key
    const pk = fields.textField;

    const file = files.file;

    if (!file) {
      return NextResponse.status(400).json({ error: 'No file uploaded' });
    }

    // Get the wasm file buffer
    const data = fs.readFileSync(file.filepath);

    let op = StellarSdk.Operation.uploadContractWasm({ wasm: data });

    // To store the contract hash returned by the RPC.
    let contractHash = '';
    const sourceKeypair = StellarSdk.Keypair.fromSecret(pk);
    const sourcePublicKey = sourceKeypair.publicKey();
    const account = await server.loadAccount(sourcePublicKey);

    // Build, prepare, sign and send the upload contract wasm transaction.
    let tx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(op)
        .build();

    let uploadResp;
    try {
        const preparedTransaction = await server.prepareTransaction(tx);
        preparedTransaction.sign(sourceKeypair);
        uploadResp = await server.sendTransaction(preparedTransaction);
    } catch (error) {
        console.log("error uploading", error);
        return NextResponse.status(500).json({ error: 'Error uploading the contract wasm file', details: error.message });
    }

    while (true) {
        try {
            const val = await server.fetchTransaction(uploadResp.hash);
            if (val.returnValue === undefined || val.returnValue === null) {
                console.log("continuing");
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
                continue
            } else {
                // The first 16 characters are of no importance.
                contractHash = val.returnValue.toXDR('hex').slice(16);
                console.log("contract hash", contractHash);
                break;
            }
        } catch (fetchError) {
            console.log("error fetching transaction", fetchError);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
            continue;
        }
    }

    const hash = StellarSdk.hash(data);

    // The operation to create a contract on the network.
    let contractOp = StellarSdk.Operation.createCustomContract({
        address: new StellarSdk.Address(sourcePublicKey),
        wasmHash: hash,
    });

    // To store the contract ID.
    let contractID = '';

    // Build, prepare, sign and send the create contract transaction.
    let contractTx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(contractOp)
        .build();

    let contractResp;
    try {
        const preparedTransaction = await server.prepareTransaction(contractTx);
        preparedTransaction.sign(sourceKeypair);
        contractResp = await server.sendTransaction(preparedTransaction);
    } catch (error) {
        console.log("error creating", error);
        return NextResponse.status(500).json({ error: 'Error deploying the contract', details: error.message });
    }

    while (true) {
        try {
            const val = await server.fetchTransaction(contractResp.hash);
            if (val.returnValue === undefined || val.returnValue === null) {
                console.log("continuing create");
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
                continue
            } else {
                contractID = StellarSdk.Address.contract(val.returnValue.address().contractId()).toString();
                console.log("contract id", contractID);
                break;
            }
        } catch (fetchError) {
            console.log("error fetching transaction", fetchError);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
            continue;
        }
    }

    return NextResponse.json({
        wasmHash: contractHash,
        id: contractID
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.status(500).json({ error: 'Error processing form', details: error.message });
  }
}
