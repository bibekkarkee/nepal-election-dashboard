const mainURL = "/api/proxy";

async function loadDashboard() {
    const res = await fetch(mainURL);
    const data = await res.json();

    // Call existing dashboard functions (counters, charts, etc.)
    // ... your previous dashboard.js code ...

    // Call profile.js functions
    showRandomCandidateProfiles(data, 8); // homepage
}

loadDashboard();
