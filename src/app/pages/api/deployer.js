// pages/api/deployer.js
import { StellarSdk } from 'stellar-sdk';
import formidable from 'formidable';
import fs from 'fs';

// Configuration
const HORIZON_URL = 'https://horizon-futurenet.stellar.org'; // Futurenet
const NETWORK_PASSPHRASE = StellarSdk.Networks.FUTURENET; // Futurenet
const server = new StellarSdk.Server(HORIZON_URL);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the form:', err);
        return res.status(500).send('Error parsing the form');
      }

      try {
        // Get the private key
        const pk = fields.textField[0];

        const file = files.file;
        // Get the wasm file buffer
        const data = fs.readFileSync(file[0].filepath);

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
        try {
            const preparedTransaction = await server.prepareTransaction(tx);
            preparedTransaction.sign(sourceKeypair);
            const uploadResp = await server.sendTransaction(preparedTransaction);
            while (true) {
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
            }
        } catch (error) {
            console.log("error uploading", error);
            return res.status(500).send('Error uploading the contract wasm file');
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
        try {
            const preparedTransaction = await server.prepareTransaction(contractTx);
            preparedTransaction.sign(sourceKeypair);
            const contractResp = await server.sendTransaction(preparedTransaction);
            while (true) {
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
            }
        } catch (error) {
            console.log("error creating", error);
            return res.status(500).send('Error deploying the contract');
        }

        res.status(201).send({
            wasmHash: contractHash,
            id: contractID
        });

      } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('Error processing form');
      }
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
