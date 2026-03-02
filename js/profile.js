const params = new URLSearchParams(window.location.search);
const candidateID = params.get("id");

const mainURL = "/api/proxy";

async function loadCandidateProfile() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        const candidate = data.find(c => String(c.CandidateID) === candidateID);

        if (!candidate) return;

        const container = document.getElementById("candidateProfile");
        container.innerHTML = `
            <img src="https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg" alt="${candidate.CandidateName}">
            <h2>${candidate.CandidateName}</h2>
            <table>
                <tr><td>Political Party</td><td>${candidate.PoliticalPartyName}</td></tr>
                <tr><td>Province</td><td>${candidate.StateName}</td></tr>
                <tr><td>District</td><td>${candidate.DistrictName}</td></tr>
                <tr><td>Constituency</td><td>${candidate.SCConstID}</td></tr>
                <tr><td>Gender</td><td>${candidate.Gender}</td></tr>
                <tr><td>Symbol</td><td>${candidate.SymbolName}</td></tr>
                <tr><td>Total Votes</td><td>${candidate.TotalVoteReceived}</td></tr>
                <tr><td>Rank</td><td>${candidate.Rank || candidate.R}</td></tr>
                <tr><td>Qualification</td><td>${candidate.QUALIFICATION}</td></tr>
                <tr><td>Experience</td><td>${candidate.EXPERIENCE}</td></tr>
                <tr><td>Father Name</td><td>${candidate.FATHER_NAME}</td></tr>
                <tr><td>Spouse Name</td><td>${candidate.SPOUCE_NAME}</td></tr>
                <tr><td>Address</td><td>${candidate.ADDRESS}</td></tr>
                <tr><td>Other Details</td><td>${candidate.OTHERDETAILS}</td></tr>
                <tr><td>Birth Year / DOB</td><td>${candidate.DOB || candidate.AGE_YR}</td></tr>
                <tr><td>Institution</td><td>${candidate.NAMEOFINST}</td></tr>
                <tr><td>Remarks</td><td>${candidate.Remarks || '-'}</td></tr>
            </table>
        `;
    } catch(err) { console.error(err); }
}

loadCandidateProfile();
