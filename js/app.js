const mainURL = "/api/proxy";
let originalData = [];
let refreshTime = 30;

// Countdown Timer
function startCountdown() {
    const timer = document.getElementById("countdownTimer");
    setInterval(() => {
        refreshTime--;
        if(refreshTime<0) refreshTime=30;
        timer.textContent = refreshTime;
    },1000);
}
startCountdown();

// Load data
async function loadData(){
    try{
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;
        generateFilters(data);
        filterData();
    }catch(err){
        console.error(err);
    }
}
loadData();
setInterval(loadData, 30000);

// Filters
function generateFilters(data){
    populateSelect("provinceFilter",[...new Set(data.map(d=>d.Province).filter(Boolean))].sort());
    populateSelect("districtFilter",[...new Set(data.map(d=>d.District).filter(Boolean))].sort());
    populateSelect("partyFilter",[...new Set(data.map(d=>d.Party).filter(Boolean))].sort());
}
function populateSelect(id,values){
    const sel=document.getElementById(id); sel.innerHTML=`<option value="">All</option>`;
    values.forEach(v=>{ const opt=document.createElement("option"); opt.value=v; opt.textContent=v; sel.appendChild(opt); });
}

// Filter data
function filterData(){
    if(!originalData.length) return;
    const s=(document.getElementById("search")?.value||"").toLowerCase();
    const p=document.getElementById("provinceFilter")?.value||"";
    const d=document.getElementById("districtFilter")?.value||"";
    const pa=document.getElementById("partyFilter")?.value||"";
    const filtered = originalData.filter(row=>
        JSON.stringify(row).toLowerCase().includes(s) &&
        (!p||row.Province===p) &&
        (!d||row.District===d) &&
        (!pa||row.Party===pa)
    );
    renderTable(filtered);
    renderSeatSummary(filtered);
    renderHotSeats(filtered);
}

// Render table
function renderTable(data){
    const header=document.getElementById("tableHeader");
    const body=document.getElementById("tableBody");
    header.innerHTML=""; body.innerHTML="";
    if(!data.length) return;

    const headers=["CandidatePhoto","Name","Party","Votes","Position","Province","District"];
    headers.forEach(h=>{ const th=document.createElement("th"); th.textContent = h==="CandidatePhoto"?"":h; header.appendChild(th); });

    data.forEach(row=>{
        const tr=document.createElement("tr"); if(row.Position==="1") tr.classList.add("winner");
        tr.addEventListener("click",()=>showCandidateDetail(row));

        // Candidate Photo
        const tdPhoto = document.createElement("td");
        const imgC = document.createElement("img");
        imgC.src = row.CandidateID?`https://result.election.gov.np/Images/Candidate/${row.CandidateID}.jpg`:"assets/candidate-placeholder.png";
        tdPhoto.appendChild(imgC); tr.appendChild(tdPhoto);

        // Name
        const tdName = document.createElement("td"); tdName.textContent=row.Name; tr.appendChild(tdName);

        // Party
        const tdParty=document.createElement("td"); tdParty.textContent=row.Party; tr.appendChild(tdParty);

        // Votes
        const tdVotes=document.createElement("td"); tdVotes.textContent=row.Votes; tr.appendChild(tdVotes);

        // Position
        const tdPos=document.createElement("td"); tdPos.textContent=row.Position; tr.appendChild(tdPos);

        // Province
        const tdProv=document.createElement("td"); tdProv.textContent=row.Province; tr.appendChild(tdProv);

        // District
        const tdDist=document.createElement("td"); tdDist.textContent=row.District; tr.appendChild(tdDist);

        body.appendChild(tr);
    });
}

// Candidate detail panel
function showCandidateDetail(candidate){
    const panel=document.getElementById("candidateDetail");
    panel.innerHTML=`
        <img src="https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg">
        <h3>${candidate.Name}</h3>
        <p>Party: ${candidate.Party}</p>
        <p>Votes: ${candidate.Votes}</p>
        <p>Position: ${candidate.Position}</p>
        <p>Province: ${candidate.Province}</p>
        <p>District: ${candidate.District}</p>
        <p>Gender: ${candidate.Gender||'-'} | Age: ${candidate.Age||'-'} | Education: ${candidate.Education||'-'}</p>
    `;
}

// Summary cards
function renderSeatSummary(data){
    const container=document.getElementById("summaryCards"); container.innerHTML="";
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        if(!acc[row.Party]) acc[row.Party]={seats:0};
        acc[row.Party].seats+=1; return acc;
    },{});
    Object.entries(summary).forEach(([party,info])=>{
        const div=document.createElement("div"); div.className="card";
        div.innerHTML=`<h2>${info.seats}</h2><p>${party}</p>`; container.appendChild(div);
    });
}

// Hot seats (Position 1)
function renderHotSeats(data){
    const container=document.getElementById("hotSeatsContainer"); container.innerHTML="";
    const hot = data.filter(c=>c.Position==="1").slice(0,10); // top 10 hot seats
    hot.forEach(c=>{
        const div=document.createElement("div"); div.className="card";
        div.innerHTML=`
            <strong>${c.District}</strong> - ${c.Name} (${c.Party})<br>
            Votes: ${c.Votes}
        `;
        container.appendChild(div);
    });
}
