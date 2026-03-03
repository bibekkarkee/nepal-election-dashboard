const mainURL = "/api/proxy";

async function loadDashboard() {
    const res = await fetch(mainURL);
    const data = await res.json();
 // ==== Hero Banner====
async function loadHero(data) {
    // Animated counters already in dashboard.js
    animateCounter("totalCandidates", data.length);
    animateCounter("totalParties", new Set(data.map(d=>d.PoliticalPartyName)).size);

    // Electoral Areas
    let districtSeats = {};
    data.forEach(d=>{
        const district = d.DistrictName || "Unknown";
        const seat = d.SCConstID;
        if(seat!=null){
            if(!districtSeats[district]) districtSeats[district]=new Set();
            districtSeats[district].add(seat);
        }
    });
    const totalElectoralAreas = Object.values(districtSeats)
        .reduce((sum, seatSet)=>sum+seatSet.size,0);
    animateCounter("totalConstituencies", totalElectoralAreas);

    const totalDistricts = new Set(data.map(d=>d.DistrictName)).size;
    animateCounter("totalDistricts", totalDistricts);

    // ===== TOP PARTY LOGOS =====
    const partySymbol = {};
    data.forEach(d=>{
        const party = d.PoliticalPartyName || "Unknown";
        if(!partySymbol[party] && d.SYMBOLCODE){
            partySymbol[party] = d.SYMBOLCODE;
        }
    });

    // Sort top 5 parties
    const sortedParties = Object.entries(partySymbol)
        .slice(0,5);

    const container = document.getElementById("heroTopParties");
    container.innerHTML = "";

    sortedParties.forEach(([partyName, code])=>{
        const img = document.createElement("img");
        img.src = `https://result.election.gov.np/Images/Symbols/${code}.jpg`;
        img.alt = partyName;
        img.title = partyName;
        container.appendChild(img);
    });
}

// Call after fetching data
loadHero(data);

    

// ===== SHOW 8 RANDOM CANDIDATES =====
function showRandomCandidateProfiles(data, count = 8) {
    const container = document.getElementById("candidateGrid");
    container.innerHTML = "";

    // Shuffle array
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    selected.forEach(d => {
        const candidateImg = `https://result.election.gov.np/Images/Candidate/${d.CandidateID}.jpg`;
        const partyLogo = d.SYMBOLCODE 
            ? `https://result.election.gov.np/Images/Symbols/${d.SYMBOLCODE}.jpg` 
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
        `;

        container.appendChild(card);
    });
}

// Call this instead of showing all candidates
showRandomCandidateProfiles(data, 4);
    
    
    // ==== TOTAL CANDIDATES & PARTIES ====
    const totalCandidates = data.length;
    const totalParties = new Set(data.map(d => d.PoliticalPartyName)).size;

    // ==== TOTAL ELECTORAL AREAS (165) ====
    let districtSeats = {};
    data.forEach(d => {
        const district = d.DistrictName || "Unknown";
        const seat = d.SCConstID;
        if (seat !== null && seat !== undefined) {
            if (!districtSeats[district]) districtSeats[district] = new Set();
            districtSeats[district].add(seat);
        }
    });
    const totalElectoralAreas = Object.values(districtSeats)
        .reduce((sum, seatSet) => sum + seatSet.size, 0);

    // ==== TOTAL DISTRICTS ====
    const totalDistricts = new Set(data.map(d => d.DistrictName)).size;

    // ==== ANIMATED COUNTERS ====
    animateCounter("totalCandidates", totalCandidates);
    animateCounter("totalParties", totalParties);
    animateCounter("totalConstituencies", totalElectoralAreas);
    animateCounter("totalDistricts", totalDistricts);

    // ==== COUNT HELPERS ====
    const countBy = (key) => {
        const obj = {};
        data.forEach(d => {
            const val = d[key] || "Unknown";
            obj[val] = (obj[val] || 0) + 1;
        });
        return obj;
    };

    // ==== GENDER PIE ====
    createPieChart("genderChart", countBy("Gender"));

    // ==== AGE BAR ====
    const ageGroups = { "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
    data.forEach(d => {
        const age = d.AGE_YR || 0;
        if (age <= 30) ageGroups["18-30"]++;
        else if (age <= 45) ageGroups["31-45"]++;
        else if (age <= 60) ageGroups["46-60"]++;
        else ageGroups["60+"]++;
    });
    createBarChart("ageChart", ageGroups);

    // ==== STATE BAR ====
    createBarChart("stateChart", countBy("StateName"));

    // ==== TOP PARTY PIE ====
    const partyCount = countBy("PoliticalPartyName");
    const sortedParties = Object.fromEntries(
        Object.entries(partyCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
    );
    createPieChart("partyChart", sortedParties);

    // ==== TOP PARTIES CARDS ====
    showTopPartiesCards(data, 5);
}

// ===== TOP PARTIES CARDS FUNCTION =====
function showTopPartiesCards(data, topN = 5) {
    const countByParty = {};
    const partySymbol = {};

    data.forEach(d => {
        const party = d.PoliticalPartyName || "Unknown";
        countByParty[party] = (countByParty[party] || 0) + 1;

        if (!partySymbol[party] && d.SYMBOLCODE) {
            partySymbol[party] = d.SYMBOLCODE;
        }
    });

    const sortedParties = Object.entries(countByParty)
        .sort((a,b)=>b[1]-a[1])
        .slice(0, topN);

    const container = document.getElementById("topPartiesContainer");
    container.innerHTML = "";

    sortedParties.forEach(([partyName, candidateCount])=>{
        const symbolCode = partySymbol[partyName];
        const logoURL = symbolCode 
            ? `https://result.election.gov.np/Images/Symbols/${symbolCode}.jpg` 
            : "https://via.placeholder.com/50";

        const card = document.createElement("div");
        card.className = "party-card";
        card.innerHTML = `
            <img src="${logoURL}" alt="${partyName}" class="party-logo">
            <div class="party-info">
                <h4>${partyName}</h4>
                <p>Candidates: ${candidateCount}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// ===== ANIMATED COUNTER FUNCTION =====
function animateCounter(id, target) {
    const el = document.getElementById(id);
    let count = 0;
    const step = target / 50;
    const interval = setInterval(() => {
        count += step;
        if (count >= target) {
            el.innerText = target;
            clearInterval(interval);
        } else {
            el.innerText = Math.floor(count);
        }
    }, 20);
}

// ===== CHART FUNCTIONS =====
function createPieChart(canvasId, dataObj) {
    new Chart(document.getElementById(canvasId), {
        type: 'pie',
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                data: Object.values(dataObj),
                backgroundColor: generateColors(Object.keys(dataObj).length)
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function createBarChart(canvasId, dataObj) {
    new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: 'Count',
                data: Object.values(dataObj),
                backgroundColor: generateColors(Object.keys(dataObj).length)
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ===== RANDOM COLOR HELPER =====
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(Math.random() * 360);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

// ===== DARK MODE TOGGLE =====
document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

loadDashboard();
