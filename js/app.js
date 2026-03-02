const mainURL = "/api/proxy";
let originalData = [];
let refreshTime = 30;

// Provinces list
const provinces = [
  "Province 1","Province 2","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"
];

// Countdown
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
        renderProvinces();
        filterData();
    }catch(err){ console.error(err); }
}
loadData();
setInterval(loadData,30000);

// Filters
function generateFilters(data){
    populateSelect("provinceFilter",provinces);
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
    highlightProvinceMap(filtered);
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

        const tdPhoto=document.createElement("td");
        const imgC=document.createElement("img");
        imgC.src=row.CandidateID?`https://result.election.gov.np/Images/Candidate/${row.CandidateID}.jpg`:"assets/candidate-placeholder.png";
        tdPhoto.appendChild(imgC); tr.appendChild(tdPhoto);

        ["Name","Party","Votes","Position","Province","District"].forEach(k=>{
            const td=document.createElement("td");
            td.textContent=row[k]; tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

// Candidate details
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
    const summary=data.reduce((acc,row)=>{ if(!row.Party) return acc; if(!acc[row.Party]) acc[row.Party]={seats:0}; acc[row.Party].seats+=1; return acc; },{});
    Object.entries(summary).forEach(([party,info])=>{
        const div=document.createElement("div"); div.className="card";
        div.innerHTML=`<h2>${info.seats}</h2><p>${party}</p>`; container.appendChild(div);
    });
}

// Hot Seats
function renderHotSeats(data){
    const container=document.getElementById("hotSeatsContainer"); container.innerHTML="";
    const hot=data.filter(c=>c.Position==="1").slice(0,10);
    hot.forEach(c=>{
        const div=document.createElement("div"); div.className="card";
        div.innerHTML=`<strong>${c.District}</strong> - ${c.Name} (${c.Party})<br>Votes: ${c.Votes}`;
        container.appendChild(div);
    });
}

// Render provinces
function renderProvinces(){
    const container=document.getElementById("mapContainer"); container.innerHTML="";
    provinces.forEach(p=>{
        const div=document.createElement("div");
        div.className="province-card"; div.textContent=p;
        div.style.padding="10px"; div.style.border="1px solid #374151"; div.style.borderRadius="8px"; div.style.cursor="pointer"; div.style.flex="1 1 120px"; div.style.textAlign="center";
        div.addEventListener("click",()=>{ document.getElementById("provinceFilter").value=p; filterData(); });
        container.appendChild(div);
    });
}

// Highlight provinces with winners
function highlightProvinceMap(data){
    // For demo, just change background color of province cards based on party of top candidate
    const provinceCards = document.querySelectorAll("#mapContainer .province-card");
    provinceCards.forEach(card=>{
        const prov = card.textContent;
        const topCandidate = data.filter(d=>d.Province===prov && d.Position==="1")[0];
        if(topCandidate){
            card.style.background="#065f46"; // winner green
        }else{
            card.style.background="#1f2937";
        }
    });
}
