const mainURL = "/api/proxy"; // Vercel proxy
let originalData = [];

async function loadData() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;

        document.getElementById("loading").style.display = "none";
        document.getElementById("table").style.display = "table";

        generateFilters(data);
        renderTable(data);
        renderSeatSummary(data);
        renderCharts(data);
    } catch (err) {
        document.getElementById("loading").innerText = "⚠ Error loading data.";
        console.error(err);
    }
}

// Filters
function generateFilters(data){
    populateSelect("provinceFilter",[...new Set(data.map(d=>d.Province))]);
    populateSelect("districtFilter",[...new Set(data.map(d=>d.District))]);
    populateSelect("partyFilter",[...new Set(data.map(d=>d.Party))]);
}

function populateSelect(id, values){
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">All</option>`;
    values.forEach(v=>{
        if(!v) return;
        const opt = document.createElement("option");
        opt.value=v; opt.textContent=v;
        select.appendChild(opt);
    });
}

// Table
function renderTable(data){
    const headerRow = document.getElementById("tableHeader");
    const body = document.getElementById("tableBody");
    headerRow.innerHTML=""; body.innerHTML="";

    if(data.length===0) return;
    const headers = Object.keys(data[0]);
    headers.forEach(h=>{ const th=document.createElement("th"); th.textContent=h; headerRow.appendChild(th); });

    data.forEach(row=>{
        const tr=document.createElement("tr");
        if(row.Position==="1") tr.classList.add("winner");
        headers.forEach(h=>{
            const td=document.createElement("td"); td.textContent=row[h]; tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

// Seat Summary
function renderSeatSummary(data){
    const container = document.getElementById("seatSummary");
    container.innerHTML = "";
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        acc[row.Party] = (acc[row.Party]||0)+1;
        return acc;
    },{});

    for(const [party,seats] of Object.entries(summary)){
        const div = document.createElement("div");
        div.style.cssText = "display:inline-block;background:#111827;color:white;padding:15px;border-radius:12px;margin:5px;min-width:120px;text-align:center;";
        div.innerHTML = `<div style="font-size:20px;font-weight:bold">${seats}</div><div>${party}</div>`;
        container.appendChild(div);
    }
}

// Charts
function renderCharts(data){
    const ctx = document.getElementById("seatChart").getContext('2d');
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        acc[row.Party] = (acc[row.Party]||0)+1;
        return acc;
    },{});

    new Chart(ctx,{
        type:'bar',
        data:{
            labels:Object.keys(summary),
            datasets:[{label:'Seats',data:Object.values(summary),backgroundColor:['#2563eb','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6']}]
        },
        options:{responsive:true, plugins:{legend:{display:false}}}
    });
}

// Filters function
function filterData(){
    const search=document.getElementById("search").value.toLowerCase();
    const province=document.getElementById("provinceFilter").value;
    const district=document.getElementById("districtFilter").value;
    const party=document.getElementById("partyFilter").value;

    const filtered = originalData.filter(d=>{
        return (!province||d.Province===province) &&
               (!district||d.District===district) &&
               (!party||d.Party===party) &&
               JSON.stringify(d).toLowerCase().includes(search);
    });
    renderTable(filtered);
    renderSeatSummary(filtered);
    renderCharts(filtered);
}

// Auto-refresh every 30 seconds
loadData();
setInterval(loadData,30000);
