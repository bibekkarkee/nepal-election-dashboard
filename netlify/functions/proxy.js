// Node 18+ on Netlify supports global fetch, no need to import node-fetch

exports.handler = async function(event, context) {
  try {
    const url = "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt";
    
    // Fetch the election data
    const res = await fetch(url);
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: `Failed to fetch data: ${res.statusText}`
      };
    }

    const data = await res.text(); // Government JSON is plain text

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Allow frontend requests from any origin
      },
      body: data
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: `Server Error: ${err.message}`
    };
  }
};
