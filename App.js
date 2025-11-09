import React, { useState } from "react";

function App() {
  const [feedback, setFeedback] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");

  // ✅ Replace this with your own Pinata JWT key
  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYTZjNzZlZi1kYzFlLTRlNzItYjk0ZC1iMjEyNjVhMjU2ZmIiLCJlbWFpbCI6InJhdGFuY2hhbmRhbmlkaGlyYWpAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRiMGFmZjczYTNkYTI4MWNjZmJhIiwic2NvcGVkS2V5U2VjcmV0IjoiYTUxZTU3ZjAwN2QyYzcxN2I5M2Y1MmNkZTA3YzM0MTk2NjMxNjViMzk1Njk5MTc1OGY5YjhlMTk4YTJiNzg1ZCIsImV4cCI6MTc5NDIzODM4NH0.I5p6xk2XDnnECsTuaZZudkuVvYIcHBGYd4hgRj5DYIc";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      alert("Please enter your feedback before submitting!");
      return;
    }

    setUploading(true);
    setIpfsUrl("");

    try {
      // Convert text feedback to a Blob file so IPFS can store it
      const blob = new Blob([feedback], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", blob, "feedback.txt");

      const metadata = JSON.stringify({
        name: "User Feedback",
        keyvalues: { timestamp: new Date().toISOString() },
      });
      formData.append("pinataMetadata", metadata);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result?.IpfsHash) {
        setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        setFeedback(""); // clear form after upload
      } else {
        console.error("Upload failed:", result);
        alert("❌ Upload failed. Check console for details.");
      }
    } catch (err) {
      console.error("❌ Error uploading to Pinata:", err);
      alert("Error uploading to Pinata. Check console.");
    }

    setUploading(false);
  };

  return (
    <div style={{ padding: "30px", textAlign: "center", maxWidth: "600px", margin: "auto" }}>
      <h1>💬 Web3 Feedback Board</h1>
      <p>Submit your feedback — it will be stored permanently on IPFS!</p>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows="5"
          cols="50"
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <br />
        <button
          type="submit"
          style={{ marginTop: "15px", padding: "10px 20px", fontSize: "16px" }}
          disabled={uploading}
        >
          {uploading ? "Uploading to IPFS..." : "Submit Feedback"}
        </button>
      </form>

      {ipfsUrl && (
        <div style={{ marginTop: "20px" }}>
          ✅ Feedback stored on IPFS:{" "}
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
            {ipfsUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;