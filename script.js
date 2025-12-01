const repos = [
  { owner: "a-stave", name: "ChocAn-Project" },
  { owner: "a-stave", name: "ms-fs-Logitrack" },
  { owner: "a-stave", name: "ms-fs-mocksite" },
];

// Utility: format "time ago"
function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60)
    return `Last updated ${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `Last updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `Last updated ${days} day${days !== 1 ? "s" : ""} ago`;
}

// Fetch latest commit date for a repo
async function latestCommit(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const commits = await res.json();
  if (!Array.isArray(commits) || commits.length === 0) return null;
  return commits[0].commit.committer.date;
}

// Scan your carousel for GitHub links and update cards
async function updateCards() {
  const cards = document.querySelectorAll("#projects .card");
  for (const card of cards) {
    const link = card.querySelector('a[href*="github.com"]');
    if (!link) continue;

    // Extract owner/repo from the href
    const match = link.href.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) continue;
    const [, owner, repo] = match;

    const body = card.querySelector(".card-body");

    try {
      const commitDate = await latestCommit(owner, repo);
      const footer = document.createElement("p");
      footer.className = "card-text";
      footer.innerHTML = `<small class="text-muted">${timeAgo(
        commitDate
      )}</small>`;
      body.appendChild(footer);
    } catch (err) {
      console.error(err);
      const footer = document.createElement("p");
      footer.className = "card-text";
      footer.innerHTML = `<small class="text-muted">Could not fetch update time</small>`;
      body.appendChild(footer);
    }
  }
}

updateCards();
