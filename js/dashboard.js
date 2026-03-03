async function loadDashboard() {
  try {
    const res = await fetch("/.netlify/functions/proxy");
    const json = await res.json();
    const candidates = JSON.parse(json.contents);

    // ===== COUNTERS =====
    const totalCandidates = candidates.length;
    const totalDistricts = [...new Set(candidates.map(c => c.DistrictName))].length;
    const totalParties = [...new Set(candidates.map(c => c.PoliticalPartyName))].length;
    const totalConstituencies = 165; // Nepal electoral areas

    // Animate counters
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

// ===== CHART FUNCTIONS =====
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

// Load dashboard
loadDashboard();
