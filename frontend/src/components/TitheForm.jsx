import { useState } from "react";

const TitheForm = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Sending STK Push...");

    try {
      const res = await fetch("http://localhost:3001/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, amount }),
      });
      const data = await res.json();
      setMsg(data.message || "Check your phone.");
    } catch {
      setMsg("Failed to send. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="2547XXXXXXXX"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (KES)"
        required
      />
      <button type="submit">Send Tithe</button>
      <p>{msg}</p>
    </form>
  );
};

export default TitheForm;
