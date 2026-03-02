const mainURL = "/api/proxy";
let originalData = [];
let seatChartInstance, voteChartInstance;
const partyColors = { "NC":"#2563eb", "CPN-UML":"#ef4444", "CPN-MC":"#10b981", "RPP":"#f59e0b", "Others":"#6b7280" };

// Countdown
let refreshTime = 30;
function startCountdown() {
    const timer = document.getElementById("countdownTimer");
    setInterval(() => { refreshTime--; if(refreshTime<0) refreshTime=30; timer.textContent=refreshTime; },1000);
}
startCountdown();

// Load data
async function loadData(){
    try{
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;
        document.getElementById("loading").style.display="none";
        document.getElementById("table").style.display="table";
        generateFilters(data);
        filterData();
    }catch(err){ console.error(err); document.getElementById("loading").innerText="⚠ Error loading data."; }
}
setInterval(loadData,30000);

// Filters
function generateFilters(data){
    populateSelect("provinceFilter",[...new Set(data.map(d=>d.Province).filter(Boolean))].sort());
    populateSelect("districtFilter",[...new Set(data.map(d=>d.District).filter(Boolean))].sort());
    populateSelect("partyFilter",[...new Set(data.map(d=>d.Party).filter(Boolean))].sort());
}
function populateSelect(id,values){
    const sel=document.getElementById(id); if(!sel) return;
    const cur=sel.value; sel.innerHTML=`<option value="">All</option>`; values.forEach(v=>{ const opt=document.createElement("option"); opt.value=v; opt.textContent=v; sel.appendChild(opt); });
    sel.value=cur;
}

// Filter
function filterData(){
    if(!originalData.length) return;
    const s=(document.getElementById("search")?.value||"").toLowerCase();
    const p=document.getElementById("provinceFilter")?.value||"";
    const d=document.getElementById("districtFilter")?.value||"";
    const pa=document.getElementById("partyFilter")?.value||"";
    const filtered = originalData.filter(row=>JSON.stringify(row).toLowerCase().includes(s) && (!p||row.Province===p) && (!d||row.District===d) && (!pa||row.Party===pa));
    renderTable(filtered); renderSeatSummary(filtered); renderSeatChart(filtered); renderVoteShare(filtered); renderNepalMap(filtered);
}

// Candidate detail panel
function showCandidateDetail(candidate){
    const panel = document.getElementById("candidateDetail");
    panel.innerHTML = `
        <img src="https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg" style="width:100px;height:100px;border-radius:50%;object-fit:cover;">
        <h3>${candidate.Name}</h3>
        <img src="assets/party-logos/${candidate.Party}.png" class="party-logo">
        <p>Votes: ${candidate.Votes}</p>
        <p>Position: ${candidate.Position}</p>
        <p>Province: ${candidate.Province}</p>
        <p>District: ${candidate.District}</p>
        <p>Gender: ${candidate.Gender||'-'} | Age: ${candidate.Age||'-'} | Education: ${candidate.Education||'-'}</p>
    `;
}

// Render table with hover to show detail
function renderTable(data){
    const header=document.getElementById("tableHeader");
    const body=document.getElementById("tableBody");
    header.innerHTML=""; body.innerHTML="";
    if(!data.length) return;
    const headers=["CandidatePhoto","Name","PartyLogo","Party","Votes","Position","Province","District"];
    headers.forEach(h=>{ const th=document.createElement("th"); th.textContent=(h==="CandidatePhoto"||h==="PartyLogo")?"":h; header.appendChild(th); });
    data.forEach(row=>{
        const tr=document.createElement("tr"); if(row.Position==="1") tr.classList.add("winner");
        tr.addEventListener("mouseenter",()=>showCandidateDetail(row));
        const tdPhoto=document.createElement("td"); const imgC=document.createElement("img");
        imgC.src = row.CandidateID?`https://result.election.gov.np/Images/Candidate/${row.CandidateID}.jpg`:"assets/candidate-placeholder.png"; imgC.className="candidate-img"; tdPhoto.appendChild(imgC); tr.appendChild(tdPhoto);
        const tdName=document.createElement("td"); tdName.textContent=row.Name; tr.appendChild(tdName);
        const tdLogo=document.createElement("td"); const imgP=document.createElement("img"); imgP.src=`assets/party-logos/${row.Party}.png`; imgP.className="party-logo"; tdLogo.appendChild(imgP); tr.appendChild(tdLogo);
        const tdParty=document.createElement("td"); tdParty.textContent=row.Party; tr.appendChild(tdParty);
        const tdVotes=document.createElement("td"); tdVotes.textContent=row.Votes; tr.appendChild(tdVotes);
        const tdPos=document.createElement("td"); tdPos.textContent=row.Position; tr.appendChild(tdPos);
        const tdProv=document.createElement("td"); tdProv.textContent=row.Province; tr.appendChild(tdProv);
        const tdDist=document.createElement("td"); tdDist.textContent=row.District; tr.appendChild(tdDist);
        body.appendChild(tr);
    });
}

// Summary cards with party logos
function renderSeatSummary(data){
    const container=document.getElementById("summaryCards"); container.innerHTML="";
    const summary = data.reduce((acc,row)=>{ if(!row.Party) return acc; if(!acc[row.Party]) acc[row.Party]={seats:0, candidate:row.Name}; acc[row.Party].seats+=1; return acc; },{});
    Object.entries(summary).forEach(([party,info])=>{
        const div=document.createElement("div"); div.className="card"; div.style.background=partyColors[party]||"#111827";
        div.innerHTML=`<img class="party-logo" src="assets/party-logos/${party}.png"><h2>${info.seats}</h2><p>${party}</p>`; container.appendChild(div);
    });
}

// Charts and map remain same as previous version
// renderSeatChart(), renderVoteShare(), renderNepalMap() ...
loadData();
