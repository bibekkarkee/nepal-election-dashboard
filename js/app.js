const mainURL = "/api/proxy"; 
let originalData = [];

async function loadData() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;

        document.getElementById("loading").style.display="none";
        document.getElementById("table").style.display="table";

        generateFilters(data);
        renderTable(data);
        renderSeatSummary(data);
        renderSeatChart(data);
        renderVoteShare(data);
        renderNepalMap(data);

    } catch (err) {
        document.getElementById("loading").innerText = "⚠ Error loading data.";
        console.error(err);
    }
}

function generateFilters(data){
    populateSelect("provinceFilter",[...new Set(data.map(d=>d.Province))]);
    populateSelect("districtFilter",[...new Set(data.map(d=>d.District))]);
    populateSelect("partyFilter",[...new Set(data.map(d=>d.Party))]);
}

function populateSelect(id, values){
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">All</option>`;
    values.forEach(v=>{ if(!v) return; let opt=document.createElement("option"); opt.value=v; opt.textContent=v; select.appendChild(opt); });
}

function renderTable(data){
    const headerRow = document.getElementById("tableHeader");
    const body = document.getElementById("tableBody");
    headerRow.innerHTML=""; body.innerHTML="";

    if(data.length===0) return;
    const headers = Object.keys(data[0]);
    headers.forEach(h=>{ let th=document.createElement("th"); th.textContent=h; headerRow.appendChild(th); });

    data.forEach(row=>{
        let tr=document.createElement("tr");
        if(row.Position==="1") tr.classList.add("winner");
        headers.forEach(h=>{ let td=document.createElement("td"); td.textContent=row[h]; tr.appendChild(td); });
        body.appendChild(tr);
    });
}

function renderSeatSummary(data){
    const container = document.getElementById("seatSummary");
    container.innerHTML = "";
    const partyColors = {"NC":"#2563eb","CPN-UML":"#ef4444","CPN-MC":"#10b981","RPP":"#f59e0b","Others":"#6b7280"};
    const summary = data.reduce((acc,row)=>{ if(!row.Party) return acc; acc[row.Party]=(acc[row.Party]||0)+1; return acc; },{});

    Object.entries(summary).forEach(([party,seats])=>{
        const div=document.createElement("div");
        div.style.cssText=`display:inline-block;padding:15px;border-radius:12px;margin:5px;min-width:120px;text-align:center;background:${partyColors[party]||"#111827"};`;
        div.innerHTML = `<div style="font-size:20px;font-weight:bold">${seats}</div><div>${party}</div>`;
        container.appendChild(div);
    });
}

function renderSeatChart(data){
    const ctx=document.getElementById("seatChart").getContext('2d');
    const summary=data.reduce((acc,row)=>{ if(!row.Party) return acc; acc[row.Party]=(acc[row.Party]||0)+1; return acc; },{});
    new Chart(ctx,{type:'bar',data:{labels:Object.keys(summary),datasets:[{label:'Seats',data:Object.values(summary),backgroundColor:['#2563eb','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6']}]},options:{responsive:true}});
}

function renderVoteShare(data){
    const ctx=document.getElementById("voteChart").getContext('2d');
    const summary=data.reduce((acc,row)=>{ if(!row.Party) return acc; acc[row.Party]=(acc[row.Party]||0)+parseInt(row.Votes||0); return acc; },{});
    new Chart(ctx,{type:'pie',data:{labels:Object.keys(summary),datasets:[{data:Object.values(summary),backgroundColor:['#2563eb','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6']}]},options:{responsive:true}});
}

function renderNepalMap(data){
    const mapContainer=document.getElementById("mapContainer");
    mapContainer.innerHTML=""; 
    const provinceWinner=data.reduce((acc,row)=>{ if(row.Position==='1') acc[row.Province]=row.Party; return acc; },{});
    const partyColors={"NC":"#2563eb","CPN-UML":"#ef4444","CPN-MC":"#10b981","RPP":"#f59e0b","Others":"#6b7280"};
    fetch("nepal-provinces.svg").then(r=>r.text()).then(svg=>{
        mapContainer.innerHTML=svg;
        Object.keys(provinceWinner).forEach(p=>{
            const party=provinceWinner[p]||"Others";
            const color=partyColors[party]||"#6b7280";
            const el=mapContainer.querySelector(`#province-${p}`);
            if(el) el.style.fill=color;
        });
    });
}

function filterData(){
    const s=document.getElementById("search").value.toLowerCase();
    const prov=document.getElementById("provinceFilter").value;
    const dist=document.getElementById("districtFilter").value;
    const party=document.getElementById("partyFilter").value;
    const filtered=originalData.filter(d=>(!prov||d.Province===prov)&&(!dist||d.District===dist)&&(!party||d.Party===party)&&JSON.stringify(d).toLowerCase().includes(s));
    renderTable(filtered); renderSeatSummary(filtered); renderSeatChart(filtered); renderVoteShare(filtered); renderNepalMap(filtered);
}

loadData();
setInterval(loadData,30000);
