const mainURL = "/api/proxy"; 
let originalData = [];
let filteredData = [];

// Load data
async function loadCandidates() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;

        populateProvinceFilter(data);
        renderCandidateList(data);
    } catch(err) { console.error(err); }
}

// Populate province filter
function populateProvinceFilter(data) {
    const provinceSelect = document.getElementById("provinceFilter");
    const districtSelect = document.getElementById("districtFilter");
    const partySelect = document.getElementById("partyFilter");

    const provinces = [...new Set(data.map(d=>d.StateName))].sort();
    const parties = [...new Set(data.map(d=>d.PoliticalPartyName))].sort();

    provinces.forEach(p => provinceSelect.appendChild(new Option(p,p)));
    parties.forEach(p => partySelect.appendChild(new Option(p,p)));

    // When province changes, update districts
    provinceSelect.addEventListener("change", updateDistricts);
    ["search","provinceFilter","districtFilter","partyFilter"].forEach(id=>{
        document.getElementById(id).addEventListener("input", filterCandidates);
        document.getElementById(id).addEventListener("change", filterCandidates);
    });

    updateDistricts(); // initialize districts
}

// Update districts based on selected province
function updateDistricts() {
    const provinceSelect = document.getElementById("provinceFilter");
    const districtSelect = document.getElementById("districtFilter");

    const selectedProvince = provinceSelect.value;
    let districts = [...new Set(originalData
        .filter(d => !selectedProvince || d.StateName === selectedProvince)
        .map(d => d.DistrictName))].sort();

    districtSelect.innerHTML = '<option value="">सबै जिल्ला</option>';
    districts.forEach(d => districtSelect.appendChild(new Option(d,d)));
}

// Filter candidates
function filterCandidates() {
    const s = (document.getElementById("search").value || "").toLowerCase();
    const p = document.getElementById("provinceFilter").value;
    const d = document.getElementById("districtFilter").value;
    const pa = document.getElementById("partyFilter").value;

    filteredData = originalData.filter(c => 
        (!s || c.CandidateName.toLowerCase().includes(s)) &&
        (!p || c.StateName === p) &&
        (!d || c.DistrictName === d) &&
        (!pa || c.PoliticalPartyName === pa)
    );

    renderCandidateList(filteredData);
}

// Render candidate cards
function renderCandidateList(data) {
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
        div.addEventListener("click", ()=>window.location.href=`candidate.html?id=${c.CandidateID}`);
        container.appendChild(div);
    });
}

loadCandidates();
