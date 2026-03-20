import fs from 'fs';
import { execSync } from 'child_process';

const minPdf = Buffer.from(
  "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n",
  "utf8"
);
fs.writeFileSync('dummy.pdf', minPdf);

try {
  const result = execSync('curl -F "file=@dummy.pdf" http://localhost:3000/api/resume', { encoding: 'utf8' });
  console.log("Result:", result);
} catch (e) {
  console.error("Error:", e.stdout || e.message);
}
