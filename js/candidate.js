const mainURL = "/api/proxy";

function getCandidateID() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadCandidate() {
    const id = getCandidateID();
    if (!id) return;

    const res = await fetch(mainURL);
    const data = await res.json();

    const candidate = data.find(c => c.CandidateID == id);
    if (!candidate) return;

    // Candidate Image
    const candidateImg = document.getElementById("candidateImage");
    candidateImg.src = `https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg`;
    candidateImg.onerror = () => candidateImg.src = "https://via.placeholder.com/180x220?text=No+Image";

    // Party Logo
    const partyLogo = document.getElementById("partyLogo");
    partyLogo.src = `https://result.election.gov.np/Images/Symbols/${candidate.SYMBOLCODE}.jpg`;
    partyLogo.onerror = () => partyLogo.style.display = "block";

    // Basic Info
    document.getElementById("candidateName").innerText = candidate.CandidateName || "-";
    document.getElementById("partyName").innerText = candidate.PoliticalPartyName || "-";
    document.getElementById("symbolName").innerText = "चिन्ह: " + (candidate.SymbolName || "-");

    document.getElementById("province").innerText = candidate.StateName || "-";
    document.getElementById("district").innerText = candidate.DistrictName || "-";

    // Votes
    const votes = candidate.TotalVoteReceived || 0;
    document.getElementById("votes").innerText = votes + " मत प्राप्त";

    // Animate vote bar (demo percentage)
    const voteBar = document.getElementById("voteProgress");
    setTimeout(() => {
        voteBar.style.width = votes > 0 ? "70%" : "5%";
    }, 300);

    // Details
    document.getElementById("age").innerText = candidate.AGE_YR || "-";
    document.getElementById("gender").innerText = candidate.Gender || "-";
    document.getElementById("education").innerText = candidate.QUALIFICATION || "-";
    document.getElementById("address").innerText = candidate.ADDRESS || "-";
    document.getElementById("father").innerText = candidate.FATHER_NAME || "-";
    document.getElementById("spouse").innerText = candidate.SPOUCE_NAME || "-";
}

loadCandidate();
