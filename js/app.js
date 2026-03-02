const mainURL = "/api/proxy"; // Fetch JSON from your API

async function loadCandidates() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();

        const container = document.getElementById("candidateList");
        container.innerHTML = "";

        data.forEach(c => {
            const div = document.createElement("div");
            div.className = "candidate-card";
            div.innerHTML = `
                <img src="https://result.election.gov.np/Images/Candidate/${c.CandidateID}.jpg" alt="${c.CandidateName}">
                <h3>${c.CandidateName}</h3>
                <p>${c.PoliticalPartyName}</p>
                <p>${c.StateName} - ${c.DistrictName}</p>
            `;
            // On click → redirect to candidate profile page with CandidateID
            div.addEventListener("click", () => {
                window.location.href = `candidate.html?id=${c.CandidateID}`;
            });
            container.appendChild(div);
        });

    } catch(err) { console.error(err); }
}

loadCandidates();
