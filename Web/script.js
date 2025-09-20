const fileInput = document.getElementById("resumeUpload");
const fileNameDisplay = document.getElementById("fileName");
const analysisResult = document.getElementById("analysisResult");
const jobDescInput = document.getElementById("jobDescription");

const modal = document.getElementById("welcomeModal");
const getStartedBtn = document.getElementById("getStartedBtn");
fileInput.addEventListener("change", () => {
if (fileInput.files.length > 0) {
let names = Array.from(fileInput.files).map(f => f.name).join(", ");
fileNameDisplay.textContent = names;
} else {
    fileNameDisplay.textContent = "No file selected";
  }
});


getStartedBtn.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.classList.remove("modal-active");
});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const apiUrl = "http://localhost:8000/process/";
const authKey = "7YEl59RuVweFVE92CFAI6w";


document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const resumes = fileInput.files;
  const jobDesc = jobDescInput.value.trim();

  if (resumes.length === 0 || jobDesc === "") {
    alert("⚠ Please upload one or more resumes and enter job description.");
    return;
  }

  analysisResult.innerHTML = "⏳ Starting analysis...";
  let results = [];
for (let i = 0; i < resumes.length; i++) {
analysisResult.innerHTML = `⏳ Analyzing resume ${i + 1} of ${resumes.length}: ${resumes[i].name}`;

    const formData = new FormData();
    formData.append("auth_key", authKey);
    formData.append("text", jobDesc);
    formData.append("pdf", resumes[i]);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Network error: " + response.statusText);
      const data = await response.json();

      
      let finalScore = data.score ?? 0;
      if ((!data.score || data.score === 0) && data.review) {
        const match = data.review.match(/final score:\s*(\d+)%/i);
        if (match) {
          finalScore = parseInt(match[1]); 
        }
      }

      results.push({
        filename: resumes[i].name,
        score: finalScore,
        review: data.review || null
      });

      console.log(`Correct Resume ${i + 1} processed:`, resumes[i].name);
    } catch (error) {
      console.error(`Failed to analyze ${resumes[i].name}:`, error);
      results.push({
        filename: resumes[i].name,
        score: -1,
        review: "Error analyzing this resume"
      });
    }

    await sleep(2000);
  }

 
  results.sort((a, b) => b.score - a.score);

 
  let tableHTML = `
    <h3> Ranked Resumes:</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Filename</th>
          <th>Score</th>
          <th>Review</th>
        </tr>
      </thead>
      <tbody>
  `;

  results.forEach((r, idx) => {
    tableHTML += `
      <tr>
        <td>#${idx + 1}</td>
        <td>${r.filename}</td>
        <td>
          ${r.score >= 0 ? `${r.score}%` : "❌ Error"}
          <div class="progress-bar">
            <div class="progress-fill"
              style="width:${Math.max(r.score, 0)}%;
                     background:${r.score > 70 ? "lime" : r.score > 40 ? "orange" : "red"};">
            </div>
          </div>
        </td>
        <td>${r.review ? marked.parse(r.review) : "No review available"}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  analysisResult.innerHTML = tableHTML;
});




