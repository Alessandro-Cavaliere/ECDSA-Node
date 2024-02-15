import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState();
  const [hashedMessage, setHashedMessage] = useState();

  const setAmount = (setter) => (evt) => {
    setter(evt.target.value);
  };

  const setValue = (setter) => async (evt) => {
    const message = {
      receiver: evt.target.value,
      amount: sendAmount,
      timestamp: Date.now(),
    };
    const messageBytes = new Uint8Array(message);
    const messageHash = keccak256(messageBytes);
    ì;
    setHashedMessage(messageHash);
    const signature = await secp.sign(messageHash, privateKey, {
      recovered: true,
      extraEntropy: true,
    });
    setSignature(signature);
    setter(evt.target.value);
  };

  async function transfer(evt) {
    evt.preventDefault();
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        signature: signature,
        recipient,
        message: hashedMessage,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setAmount(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type a public key referred to an account"
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
