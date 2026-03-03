const mainURL = "/api/proxy";

async function loadDashboard() {
    const res = await fetch(mainURL);
    const data = await res.json();

    // ==== TOTAL CANDIDATES & PARTIES ====
    const totalCandidates = data.length;
    const totalParties = new Set(data.map(d => d.PoliticalPartyName)).size;

    // ==== TOTAL ELECTORAL AREAS (165) ====
    // Correctly sum unique SCConstID per district
    let districtSeats = {}; // key = district, value = Set of SCConstID

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
    animateCounter("totalConstituencies", totalElectoralAreas); // now correct 165
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
