// proxy.js
exports.handler = async function() {
  try {
    const url = "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt";
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: res.status, body: `Failed: ${res.statusText}` };
    }

    const data = await res.text();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: data
    };
  } catch (err) {
    return { statusCode: 500, body: `Server Error: ${err.message}` };
  }
};
