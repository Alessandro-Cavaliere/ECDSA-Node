const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const port = 3042;
const secp256k1 = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

const balances = {
  "0436d3312077fc0bdbd690058a92cacbed24230952b1b7167dd877ab7f98613a2c0c773108943a06bc84c50bd599dbd1435eaffd8e96c5ddf0c1dd4596d36e43f4": 100,
  "04c0e21cab7a74df3b4d4886a443ab9095c8b0f1d0dad5547dd7660e5b34ef03f216256b0555883b554b5d136d762c32d7cf006a70f9e8bfdb90cf8197516ef40f": 50,
  "047b54f654964c402f3c704a206b5e31941d0917592e4b68e48f78623e844770d4c1cf361678b419ae0517efd8f5bd4b5cd2a714c6f8fdd3ef5190c86017a69b2f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  if (!address) {
    return res.status(400).send({ error: "Indirizzo mancante o non valido" });
  }
  const balance = balances[address] || "0";
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature,message} = req.body;
  const messageBytes = new Uint8Array(Object.values(message));
  const signatureBytes = new Uint8Array(Object.values(signature[0]));
  
  const publicKeyRecovered= secp256k1.recoverPublicKey(messageBytes,signatureBytes,signature[1])
  const publicKeyhexString = Buffer.from(publicKeyRecovered).toString('hex');

  try {

    if (sender.toLowerCase() !== publicKeyhexString.toLowerCase()) {
      return res.status(400).send({ message: "Signature does not match sender address" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    res.status(400).send({ message: "Invalid signature or unable to recover public key" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
