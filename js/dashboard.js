// dashboard.js

async function loadDashboard() {
  try {
    const res = await fetch("/.netlify/functions/proxy");
    const json = await res.json();
    const candidates = JSON.parse(json.contents);

    // ===== COUNTERS =====
    const totalCandidates = candidates.length;
    const totalDistricts = [...new Set(candidates.map(c => c.DistrictName))].length;
    const totalParties = [...new Set(candidates.map(c => c.PoliticalPartyName))].length;
    const totalConstituencies = 165;

    animateCounter("totalCandidates", totalCandidates);
    animateCounter("totalDistricts", totalDistricts);
    animateCounter("totalParties", totalParties);
    animateCounter("totalConstituencies", totalConstituencies);

    // ===== RANDOM CANDIDATES =====
    const candidateGrid = document.getElementById("candidateGrid");
    candidateGrid.innerHTML = "";
    const shuffled = candidates.sort(() => 0.5 - Math.random()).slice(0, 8);
    shuffled.forEach(c => {
      const card = document.createElement("div");
      card.className = "candidate-card";
      card.innerHTML = `
        <img src="https://result.election.gov.np/Images/Candidate/${c.CandidateID}.jpg" alt="${c.CandidateName}">
        <h3>${c.CandidateName}</h3>
        <p><strong>Province:</strong> ${c.StateName}</p>
        <p><strong>District:</strong> ${c.DistrictName}</p>
        <p><strong>Constituency:</strong> ${c.SCConstID}</p>
        <p><strong>Party:</strong> ${c.PoliticalPartyName}</p>
      `;
      card.addEventListener("click", () => window.location.href = `candidate-detail.html?id=${c.CandidateID}`);
      candidateGrid.appendChild(card);
    });

    // ===== TOP PARTIES =====
    renderTopParties(candidates);

    // ===== TOP CANDIDATES PER CONSTITUENCY =====
    renderTopCandidatesByConstituency(candidates);

    // ===== CHARTS =====
    renderGenderChart(candidates);
    renderAgeChart(candidates);
    renderStateChart(candidates);

  } catch (err) {
    console.error(err);
    document.getElementById("candidateGrid").innerHTML = "<p style='text-align:center;color:red;'>Failed to load candidates.</p>";
  }
}

// ===== COUNTER ANIMATION =====
function animateCounter(id, end) {
  const el = document.getElementById(id);
  let start = 0;
  const step = Math.ceil(end / 100);
  const interval = setInterval(() => {
    start += step;
    if (start >= end) {
      start = end;
      clearInterval(interval);
    }
    el.textContent = start;
  }, 15);
}

// ===== TOP PARTIES =====
function renderTopParties(candidates) {
  const container = document.getElementById("topPartiesContainer");
  container.innerHTML = "";

  const partyCounts = {};
  candidates.forEach(c => {
    if(c.PoliticalPartyName){
      partyCounts[c.PoliticalPartyName] = (partyCounts[c.PoliticalPartyName] || 0) + 1;
    }
  });

  const sortedParties = Object.entries(partyCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);

  sortedParties.forEach(([partyName, count])=>{
    const card = document.createElement("div");
    card.className="party-card";
    card.style = "display:flex; align-items:center; gap:10px; padding:10px; background:#fff; border-radius:8px; box-shadow:0 3px 10px rgba(0,0,0,0.1); margin-bottom:10px;";
    card.innerHTML=`
      <div style="flex-shrink:0; width:40px; height:40px; background:#1e3c72; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:50%; font-weight:bold;">${partyName[0]}</div>
      <div>
        <strong>${partyName}</strong> <br>
        Candidates: ${count}
      </div>
    `;
    container.appendChild(card);
  });
}

// ===== TOP CANDIDATES PER CONSTITUENCY =====
function renderTopCandidatesByConstituency(candidates) {
  const container = document.getElementById("topCandidatesContainer");
  container.innerHTML = "";

  const constituencyMap = {};
  candidates.forEach(c => {
    const key = c.SCConstID + " - " + c.DistrictName;
    if (!constituencyMap[key]) constituencyMap[key] = [];
    constituencyMap[key].push(c);
  });

  Object.entries(constituencyMap).forEach(([constituency, cands]) => {
    const sorted = cands.sort((a,b) => b.TotalVoteReceived - a.TotalVoteReceived).slice(0,5);
    const box = document.createElement("div");
    box.className = "constituency-box";
    box.innerHTML = `<h3>${constituency}</h3>`;

    sorted.forEach(c => {
      const row = document.createElement("div");
      row.className = "candidate-row";
      row.innerHTML = `
        <img src="https://result.election.gov.np/Images/Candidate/${c.CandidateID}.jpg" alt="${c.CandidateName}">
        <div>
          <strong>${c.CandidateName}</strong>
          Party: ${c.PoliticalPartyName}<br>
          Votes: ${c.TotalVoteReceived || 0}
        </div>
      `;
      box.appendChild(row);
    });

    container.appendChild(box);
  });
}

// ===== CHARTS =====
function renderGenderChart(candidates) {
  const male = candidates.filter(c => c.Gender === "पुरुष").length;
  const female = candidates.filter(c => c.Gender === "महिला").length;
  const other = candidates.length - male - female;

  new Chart(document.getElementById("genderChart"), {
    type: 'pie',
    data: {
      labels: ["पुरुष", "महिला", "अन्य"],
      datasets: [{
        data: [male, female, other],
        backgroundColor: ['#1e3c72','#ff9f00','#4caf50'],
      }]
    },
    options: { responsive:true }
  });
}

function renderAgeChart(candidates) {
  const ageGroups = { "<30":0, "30-40":0, "41-50":0, "51-60":0, "61+":0 };
  candidates.forEach(c=>{
    const age = parseInt(c.AGE_YR);
    if(age<30) ageGroups["<30"]++;
    else if(age<=40) ageGroups["30-40"]++;
    else if(age<=50) ageGroups["41-50"]++;
    else if(age<=60) ageGroups["51-60"]++;
    else ageGroups["61+"]++;
  });

  new Chart(document.getElementById("ageChart"), {
    type:'bar',
    data:{
      labels:Object.keys(ageGroups),
      datasets:[{
        label:'Candidates',
        data:Object.values(ageGroups),
        backgroundColor:'#1e3c72'
      }]
    },
    options:{responsive:true, scales:{y:{beginAtZero:true}}}
  });
}

function renderStateChart(candidates) {
  const states = {};
  candidates.forEach(c=>{
    if(c.StateName) states[c.StateName]=(states[c.StateName]||0)+1;
  });
  new Chart(document.getElementById("stateChart"), {
    type:'bar',
    data:{
      labels:Object.keys(states),
      datasets:[{
        label:'Candidates',
        data:Object.values(states),
        backgroundColor:'#ff9f00'
      }]
    },
    options:{responsive:true, scales:{y:{beginAtZero:true}}}
  });
}

// ===== LOAD DASHBOARD =====
loadDashboard();
