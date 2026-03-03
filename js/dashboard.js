const mainURL = "/api/proxy";

async function loadDashboard() {
    const res = await fetch(mainURL);
    const data = await res.json();

    // === BASIC TOTALS ===
    document.getElementById("totalCandidates").innerText = data.length;

    const uniqueParties = [...new Set(data.map(d => d.PoliticalPartyName))];
    document.getElementById("totalParties").innerText = uniqueParties.length;

    const uniqueConstituencies = [...new Set(data.map(d => d.SCConstID))];
    document.getElementById("totalConstituencies").innerText = uniqueConstituencies.length;

    const uniqueDistricts = [...new Set(data.map(d => d.DistrictName))];
    document.getElementById("totalDistricts").innerText = uniqueDistricts.length;

    // === GENDER DISTRIBUTION ===
    const genderCount = countBy(data, "Gender");
    renderList("genderDistribution", genderCount);

    // === AGE GROUP DISTRIBUTION ===
    const ageGroups = {
        "18-30": 0,
        "31-45": 0,
        "46-60": 0,
        "60+": 0
    };

    data.forEach(d => {
        const age = d.AGE_YR || 0;
        if (age <= 30) ageGroups["18-30"]++;
        else if (age <= 45) ageGroups["31-45"]++;
        else if (age <= 60) ageGroups["46-60"]++;
        else ageGroups["60+"]++;
    });

    renderList("ageDistribution", ageGroups);

    // === REGISTERED BY STATE ===
    const stateCount = countBy(data, "StateName");
    renderList("stateDistribution", stateCount);

    // === TOP DISTRICTS ===
    const districtCount = countBy(data, "DistrictName");
    renderList("topDistricts", sortTop(districtCount, 10));

    // === MAJOR POLITICAL PARTIES ===
    renderList("majorParties", sortTop(countBy(data, "PoliticalPartyName"), 10));

    // === TOP PARTIES BY CANDIDATE COUNT ===
    renderList("topParties", sortTop(countBy(data, "PoliticalPartyName"), 5));
}

function countBy(data, key) {
    const result = {};
    data.forEach(d => {
        const value = d[key] || "Unknown";
        result[value] = (result[value] || 0) + 1;
    });
    return result;
}

function sortTop(obj, limit) {
    return Object.fromEntries(
        Object.entries(obj)
        .sort((a,b) => b[1] - a[1])
        .slice(0, limit)
    );
}

function renderList(elementId, obj) {
    const ul = document.getElementById(elementId);
    ul.innerHTML = "";

    for (let key in obj) {
        const li = document.createElement("li");
        li.innerText = `${key} : ${obj[key]}`;
        ul.appendChild(li);
    }
}

loadDashboard();
