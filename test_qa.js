const test = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What are my top skills?' }],
        developerContext: {
          username: "testuser",
          score: 85,
          label: "Senior",
          repo_count: 10,
          skills_with_confidence: "React (Conf: 90%), Node.js (Conf: 85%)",
          top_5_repos: "repo1, repo2",
          language_percentages: "TypeScript: 80%, JavaScript: 20%"
        }
      })
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON:", json);
  } catch (e) {
    console.error("Fetch err:", e);
  }
};
test();
