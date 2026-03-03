// netlify/functions/proxy.js

const fetch = require("node-fetch"); // Node 18+ may not need this, Netlify supports fetch globally

exports.handler = async function(event, context) {
  try {
    const url = "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt";
    
    const res = await fetch(url);
    
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: `Failed to fetch data: ${res.statusText}`
      };
    }

    const data = await res.text(); // the gov JSON is plain text

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // allow any frontend
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
