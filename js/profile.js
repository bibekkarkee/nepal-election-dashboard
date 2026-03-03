// =========================
// profile.js
// =========================

// ===== HELPER FUNCTION: CREATE A CANDIDATE CARD =====
function createCandidateCard(d) {
    const candidateImg = `https://result.election.gov.np/Images/Candidate/${d.CandidateID}.jpg`;
    const partyLogo = d.SYMBOLCODE 
        ? `https://result.election.gov.np/Images/Symbol/${d.SYMBOLCODE}.jpg` 
        : "https://via.placeholder.com/40";

    const card = document.createElement("div");
    card.className = "candidate-card";

    card.innerHTML = `
        <img src="${candidateImg}" alt="${d.CandidateName}" class="candidate-img">
        <h3>${d.CandidateName}</h3>
        <p><img src="${partyLogo}" alt="${d.PoliticalPartyName}" class="party-logo"> ${d.PoliticalPartyName}</p>
        <p><strong>Province:</strong> ${d.StateName}</p>
        <p><strong>District:</strong> ${d.DistrictName}</p>
        <p><strong>Constituency:</strong> ${d.SCConstID}</p>
        <p><strong>Gender:</strong> ${d.Gender || "-"}</p>
        <p><strong>Age:</strong> ${d.AGE_YR || "-"}</p>
        <p><strong>Qualification:</strong> ${d.QUALIFICATION || "-"}</p>
    `;
    return card;
}

// ===== FUNCTION: SHOW RANDOM CANDIDATES ON HOMEPAGE =====
function showRandomCandidateProfiles(data, count = 8) {
    const container = document.getElementById("candidateGrid");
    if(!container) return;

    container.innerHTML = "";

    // Shuffle data and pick 'count' candidates
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    selected.forEach(d => {
        const card = createCandidateCard(d);
        container.appendChild(card);
    });
}

// ===== FUNCTION: SHOW ALL CANDIDATES ON CANDIDATE PAGE =====
function showAllCandidates(data) {
    const container = document.getElementById("allCandidateGrid");
    if(!container) return;

    container.innerHTML = "";

    data.forEach(d => {
        const card = createCandidateCard(d);
        container.appendChild(card);
    });
}

// ===== FUNCTION: FILTER CANDIDATES =====
function filterCandidates(data, search = "", province = "", district = "") {
    return data.filter(c => {
        const matchesSearch = !search || c.CandidateName.toLowerCase().includes(search.toLowerCase());
        const matchesProvince = !province || c.StateName === province;
        const matchesDistrict = !district || c.DistrictName === district;
        return matchesSearch && matchesProvince && matchesDistrict;
    });
}
