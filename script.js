// script.js
console.log("script loaded");

// DOM References
const patternInput = document.getElementById("regex-pattern");
const testArea = document.getElementById("test-area");
const matchCount = document.querySelector("#matchCount .count");
const matchList = document.getElementById("matchList");
const snippetsSelect = document.getElementById("snippets");
const exportJSONBtn = document.getElementById("exportJSON");
const exportTextBtn = document.getElementById("exportText");
const exportOutput = document.getElementById("exportOutput");
const patternError = document.querySelector(".regex-pattern-error");
const visualMatchContainer = document.querySelector(".playground__visual-match");
const copyExportBtn = document.getElementById("copyExport");
const downloadExportBtn = document.getElementById("downloadExport");
// Theme toggle switch logic
const toggleSwitch = document.getElementById("toggle-switch");




const flagCheckboxes = ["g", "i", "m", "s", "u", "y"]
    .map(f => document.getElementById(`switch-${f}`));

let snippets = [];
// Load snippets from JSON
fetch("snippets.json")
    .then(res => res.json())
    .then(data => {
        snippets = data;
        data.forEach(snippet => {
            const option = document.createElement("option");
            option.value = snippet.pattern;
            option.textContent = `${snippet.name} - ${snippet.description}`;
            snippetsSelect.appendChild(option);
        });
    });

snippetsSelect.addEventListener("change", () => {
    patternInput.value = snippetsSelect.value;
    updateMatches();
});

patternInput.addEventListener("input", () => {
    const inputPattern = patternInput.value.trim();
    if (!inputPattern) return;

    const matchedIndex = snippets.findIndex(s => s.pattern === inputPattern);
    if (matchedIndex !== -1) {
        snippetsSelect.selectedIndex = matchedIndex;
    } else {
        snippetsSelect.selectedIndex = 0; // reset if no match
    }
});

function getFlags() {
    return flagCheckboxes
        .filter(cb => cb.checked)
        .map(cb => cb.id.replace("switch-", "")).join("");
}

function clearResults() {
    matchCount.textContent = "0";
    matchList.innerHTML = "";
    visualMatchContainer.innerHTML = "";
    exportOutput.value = "";
}

function highlightMatch(text, start, end) {
    return `${text.slice(0, start)}
            <mark>${text.slice(start, end)}</mark>
            ${text.slice(end)}`;
}

function updateMatches() {
    clearResults();

    const pattern = patternInput.value.trim();
    if (!pattern) return;

    // Build flags
    let flags = getFlags();
    if (!flags.includes("g")) flags += "g";   // ensure global

    let regex;
    try {
        regex = new RegExp(pattern, flags);
        patternError.style.display = "none";
    } catch (e) {
        patternError.textContent = `❌ Invalid Regex: ${e.message}`;
        patternError.style.display = "block";
        return;
    }

    const input = testArea.value;
    const matches = [...input.matchAll(regex)];

    // ----- Visual Panel -----
    visualMatchContainer.innerHTML = "";
    matches.forEach((m, i) => {
        const wrap = document.createElement("div");
        wrap.className = "match";

        wrap.innerHTML = `
        <div class="matched-text">
            Match ${i + 1}: <mark>${m[0]}</mark>
        </div>
    `;

        if (m.length > 1) {
            const ul = document.createElement("ul");
            ul.className = "groups";
            m.slice(1).forEach((g, idx) => {
                ul.innerHTML += `
                    <li>$${idx + 1}: <span class="group">${g}</span></li>
                `;
            });
            wrap.appendChild(ul);
        }

        visualMatchContainer.appendChild(wrap);
    });

    // ----- Result Panel -----
    matchCount.textContent = matches.length;
    matchList.innerHTML = "";

    const results = matches.map((m, i) => ({
        match: m[0],
        start: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1)
    }));

    results.forEach((r, i) => {
        const div = document.createElement("div");
        div.className = "match-item";
        div.innerHTML = `
            <strong>Match ${i + 1}:</strong> "${r.match}" [${r.start}-${r.end}]
        `;

        if (r.groups.length) {
            const ul = document.createElement("ul");
            r.groups.forEach((g, idx) => {
                ul.innerHTML += `<li>Group ${idx + 1}: "${g}"</li>`;
            });
            div.appendChild(ul);
        }
        matchList.appendChild(div);
    });

    // ----- Export -----
    exportJSONBtn.onclick = () => {
        exportOutput.value = JSON.stringify(results, null, 2);
        exportOutput.style.minHeight = "400px";
    };

    exportTextBtn.onclick = () => {
        exportOutput.value = results
            .map((r, i) => {
                let lines = [
                    `Match ${i + 1}: "${r.match}" [${r.start}-${r.end}]`
                ];
                r.groups.forEach(
                    (g, idx) => lines.push(`  Group ${idx + 1}: "${g}"`)
                );
                return lines.join("\\n");
            })
            .join("\\n\\n");
    };

    copyExportBtn.onclick = () => {
        navigator.clipboard.writeText(exportOutput.value)
            .then(() => {
                copyExportBtn.innerHTML = '<i class="ph ph-check"></i> Copied!';
                setTimeout(() => {
                    copyExportBtn.innerHTML = '<i class="ph ph-copy-simple"></i> Copy';
                }, 1500);
            })
            .catch(err => {
                console.error("❌ Copy failed", err);
            });
    };


    downloadExportBtn.onclick = () => {
        const content = exportOutput.value;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        const isJSON = content.trim().startsWith("{") || content.trim().startsWith("[");
        a.download = isJSON ? "regex-results.json" : "regex-results.txt";

        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    };

}


// Update matches when input changes
[patternInput, testArea, ...flagCheckboxes].forEach(el => {
    el.addEventListener("input", () => {
        console.log("input changes");
        updateMatches();
    });
});

// Initial test pattern
patternInput.value = "(\\w+)@(\\w+\\.\\w+)";
testArea.value = `hello@example.com
support@devtools.io
invalid-email
no-at-symbol.com`;
updateMatches();

// On load
window.onload = () => {
    const isDark = localStorage.getItem("theme") === "dark";
    toggleSwitch.checked = isDark;
    document.body.classList.toggle("dark-theme", isDark);
}

// On toggle
toggleSwitch.addEventListener("change", () => {
    const isChecked = toggleSwitch.checked;
    document.body.classList.toggle("dark-theme", isChecked);
    localStorage.setItem("theme", isChecked ? "dark" : "light");
});

