const fileInput = document.getElementById("resumeUpload");
const fileNameDisplay = document.getElementById("fileName");

fileInput.addEventListener("change", () => {
  fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : "No file selected";
});

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const resume = fileInput.files[0];
  const jobDesc = document.getElementById("jobDescription").value;

  if (!resume || jobDesc.trim() === "") {
    alert("⚠️ Please upload a resume and enter job description.");
    return;
  }

  alert("✅ Resume uploaded & Job Description added. AI analysis feature coming soon!");
});

const modal = document.getElementById("welcomeModal");
const getStartedBtn = document.getElementById("getStartedBtn");

getStartedBtn.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.classList.remove("modal-active");
});

