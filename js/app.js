const mainURL = "/api/proxy";  // serverless API to fetch JSON
let originalData = [];
let refreshTime = 30;

// Nepal Provinces
const provinces = ["Province 1","Province 2","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"];

// Countdown timer
function startCountdown() {
    const timer = document.getElementById("countdownTimer");
    setInterval(() => {
        refreshTime--;
        if(refreshTime < 0) refreshTime = 30;
        timer.textContent = refreshTime;
    }, 1000);
}
startCountdown();

// Load data
async function loadData() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;
        generateFilters(data);
        renderProvinces();
        filterData();
    } catch(err) {
        console.error(err);
    }
}
loadData();
setInterval(loadData, 30000); // refresh every 30s

// Filters
function generateFilters(data) {
    populateSelect("provinceFilter", provinces);
    populateSelect("districtFilter", [...new Set(data.map(d => d.DistrictName).filter(Boolean))].sort());
    populateSelect("partyFilter", [...new Set(data.map(d => d.PoliticalPartyName).filter(Boolean))].sort());
}
function populateSelect(id, values) {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">All</option>`;
    values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
    });
}

// Filter data
function filterData() {
    if (!originalData.length) return;

    const s = (document.getElementById("search")?.value || "").toLowerCase();
    const p = document.getElementById("provinceFilter")?.value || "";
    const d = document.getElementById("districtFilter")?.value || "";
    const pa = document.getElementById("partyFilter")?.value || "";

    const filtered = originalData.filter(row =>
        JSON.stringify(row).toLowerCase().includes(s) &&
        (!p || row.StateName === p) &&
        (!d || row.DistrictName === d) &&
        (!pa || row.PoliticalPartyName === pa)
    );

    renderTable(filtered);
    renderSeatSummary(filtered);
    renderHotSeats(filtered);
    highlightProvinceMap(filtered);
}

// Render table
function renderTable(data) {
    const header = document.getElementById("tableHeader");
    const body = document.getElementById("tableBody");
    header.innerHTML = ""; body.innerHTML = "";
    if (!data.length) return;

    const headers = ["Photo","Name","Party","Votes","Position","Province","District"];
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        header.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement("tr");
        if (row.R === 1) tr.classList.add("winner");
        tr.addEventListener("click", () => showCandidateDetail(row));

        // Candidate Photo
        const tdPhoto = document.createElement("td");
        const img = document.createElement("img");
        img.src = row.CandidateID ? `https://result.election.gov.np/Images/Candidate/${row.CandidateID}.jpg` : "assets/candidate-placeholder.png";
        img.className = "candidate-img";
        tdPhoto.appendChild(img);
        tr.appendChild(tdPhoto);

        // Name, Party, Votes, Position, Province, District
        const cols = ["CandidateName","PoliticalPartyName","TotalVoteReceived","R","StateName","DistrictName"];
        cols.forEach(k => {
            const td = document.createElement("td");
            td.textContent = row[k];
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

// Candidate detail panel
function showCandidateDetail(candidate) {
    const panel = document.getElementById("candidateDetail");
    panel.innerHTML = `
        <img src="https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg">
        <h3>${candidate.CandidateName}</h3>
        <p>Party: ${candidate.PoliticalPartyName}</p>
        <p>Votes: ${candidate.TotalVoteReceived}</p>
        <p>Position: ${candidate.R}</p>
        <p>Province: ${candidate.StateName}</p>
        <p>District: ${candidate.DistrictName}</p>
        <p>Gender: ${candidate.Gender || '-'} | Age: ${candidate.AGE_YR || '-'} | Education: ${candidate.QUALIFICATION || '-'}</p>
    `;
}

