import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const minPdf = Buffer.from(
  "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n",
  "utf8"
);

async function test() {
  try {
    const parser = new PDFParse({ data: minPdf });
    const text = await parser.getText();
    console.log("TEXT:", text);
    await parser.destroy();
  } catch (e) {
    console.error("PDFError:", e);
  }
}
test();
