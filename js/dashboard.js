const mainURL = "/api/proxy";

async function loadDashboard() {
    const res = await fetch(mainURL);
    const data = await res.json();

    // ==== TOTALS ====
    const totalCandidates = data.length;
    const totalParties = new Set(data.map(d => d.PoliticalPartyName)).size;

    // ==== Total Electoral Areas (Unique SCConstID) ====
    const uniqueElectoralAreas = new Set(
        data
            .map(d => d.SCConstID)
            .filter(d => d !== null && d !== undefined)
    );

    const totalElectoralAreas = uniqueElectoralAreas.size;

    const totalDistricts = new Set(data.map(d => d.DistrictName)).size;

    animateCounter("totalCandidates", totalCandidates);
    animateCounter("totalParties", totalParties);
    animateCounter("totalConstituencies", totalElectoralAreas); // updated
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
}

// ===== ANIMATED COUNTER =====
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
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ===== HELPER: RANDOM COLORS =====
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(Math.random() * 360);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

// ===== DARK MODE =====
document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

loadDashboard();
