const mainURL = "/api/proxy";
let originalData = [];

// Party colors
const partyColors = {
    "NC": "#2563eb",
    "CPN-UML": "#ef4444",
    "CPN-MC": "#10b981",
    "RPP": "#f59e0b",
    "Others": "#6b7280"
};

// Load data from API
async function loadData() {
    try {
        const res = await fetch(mainURL);
        const data = await res.json();
        originalData = data;

        document.getElementById("loading").style.display = "none";
        document.getElementById("table").style.display = "table";

        generateFilters(data);
        filterData(); // initial render
    } catch (err) {
        document.getElementById("loading").innerText = "⚠ Error loading data.";
        console.error(err);
    }
}

// Generate filter dropdowns
function generateFilters(data){
    populateSelect("provinceFilter", [...new Set(data.map(d=>d.Province).filter(Boolean))].sort());
    populateSelect("districtFilter", [...new Set(data.map(d=>d.District).filter(Boolean))].sort());
    populateSelect("partyFilter", [...new Set(data.map(d=>d.Party).filter(Boolean))].sort());
}

function populateSelect(id, values){
    const select = document.getElementById(id);
    const currentValue = select.value; // preserve selection
    select.innerHTML = `<option value="">All</option>`;
    values.forEach(v=>{
        const option = document.createElement("option");
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
    });
    select.value = currentValue;
}

// Filter function
function filterData() {
    const search = document.getElementById("search").value.toLowerCase();
    const province = document.getElementById("provinceFilter").value;
    const district = document.getElementById("districtFilter").value;
    const party = document.getElementById("partyFilter").value;

    const filtered = originalData.filter(row => {
        const matchesSearch = JSON.stringify(row).toLowerCase().includes(search);
        const matchesProvince = !province || row.Province === province;
        const matchesDistrict = !district || row.District === district;
        const matchesParty = !party || row.Party === party;
        return matchesSearch && matchesProvince && matchesDistrict && matchesParty;
    });

    // Update all components
    renderTable(filtered);
    renderSeatSummary(filtered);
    renderSeatChart(filtered);
    renderVoteShare(filtered);
    renderNepalMap(filtered);
}

// Render candidate table
function renderTable(data){
    const headerRow = document.getElementById("tableHeader");
    const body = document.getElementById("tableBody");
    headerRow.innerHTML = "";
    body.innerHTML = "";

    if(data.length === 0) return;

    const headers = Object.keys(data[0]);
    headers.forEach(h=>{
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
    });

    data.forEach(row=>{
        const tr = document.createElement("tr");
        if(row.Position === "1") tr.classList.add("winner");
        headers.forEach(h=>{
            const td = document.createElement("td");
            td.textContent = row[h];
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

// Render seat summary cards
function renderSeatSummary(data){
    const container = document.getElementById("summaryCards");
    container.innerHTML = "";
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        acc[row.Party] = (acc[row.Party]||0)+1;
        return acc;
    },{});

    Object.entries(summary).forEach(([party,seats])=>{
        const div = document.createElement("div");
        div.className = "card";
        div.style.background = partyColors[party] || "#111827";
        div.innerHTML = `<h2>${seats}</h2><p>${party}</p>`;
        container.appendChild(div);
    });
}

// Render seat distribution chart
function renderSeatChart(data){
    const ctx = document.getElementById("seatChart").getContext('2d');
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        acc[row.Party] = (acc[row.Party]||0)+1;
        return acc;
    },{});

    if(window.seatChartInstance) window.seatChartInstance.destroy();

    window.seatChartInstance = new Chart(ctx,{
        type:'bar',
        data:{
            labels:Object.keys(summary),
            datasets:[{label:'Seats', data:Object.values(summary), backgroundColor:['#2563eb','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6']}]
        },
        options:{responsive:true, plugins:{legend:{display:false}}}
    });
}

// Render vote share pie chart
function renderVoteShare(data){
    const ctx = document.getElementById("voteChart").getContext('2d');
    const summary = data.reduce((acc,row)=>{
        if(!row.Party) return acc;
        acc[row.Party] = (acc[row.Party]||0)+parseInt(row.Votes||0);
        return acc;
    },{});

    if(window.voteChartInstance) window.voteChartInstance.destroy();

    window.voteChartInstance = new Chart(ctx,{
        type:'pie',
        data:{labels:Object.keys(summary), datasets:[{data:Object.values(summary), backgroundColor:['#2563eb','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6']}]},
        options:{responsive:true}
    });
}

// Render interactive Nepal map
function renderNepalMap(data){
    const container = document.getElementById("mapContainer");
    container.innerHTML = "";
    const provinceWinner = data.reduce((acc,row)=>{
        if(row.Position==='1') acc[row.Province]=row.Party;
        return acc;
    },{});

    fetch("nepal-provinces.svg").then(r=>r.text()).then(svg=>{
        container.innerHTML = svg;
        Object.keys(provinceWinner).forEach(p=>{
            const party = provinceWinner[p] || "Others";
            const color = partyColors[party] || "#6b7280";
            const el = container.querySelector(`#province-${p}`);
            if(el){
                el.style.fill = color;
                el.addEventListener("mouseenter", ()=>{
                    el.setAttribute("stroke","#fff");
                    el.setAttribute("stroke-width","3");
                    const tooltip = document.createElement("div");
                    tooltip.id = "mapTooltip";
                    tooltip.style.position = "absolute";
                    tooltip.style.background="#111827";
                    tooltip.style.color="white";
                    tooltip.style.padding="5px 10px";
                    tooltip.style.borderRadius="6px";
                    tooltip.style.pointerEvents="none";
                    tooltip.innerText = `Province ${p} - ${party}`;
                    document.body.appendChild(tooltip);
                    el.addEventListener("mousemove", (e)=>{
                        tooltip.style.left = e.pageX + 10 + "px";
                        tooltip.style.top = e.pageY + 10 + "px";
                    });
                });
                el.addEventListener("mouseleave", ()=>{
                    el.setAttribute("stroke","#fff");
                    el.setAttribute("stroke-width","2");
                    const t = document.getElementById("mapTooltip");
                    if(t) t.remove();
                });
            }
        });
    });
}

// Initial load
loadData();
setInterval(loadData,30000);
