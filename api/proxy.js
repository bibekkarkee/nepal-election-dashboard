export default async function handler(req, res) {
  const url = "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt";

  try {
    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch or parse JSON" });
  }
}
