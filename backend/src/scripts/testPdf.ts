import fs from "fs";
import path from "path";
const { PDFParse } = require("pdf-parse");

async function test() {
  const pdfPath = path.join(__dirname, "../../data/Cbe_Corp_Budget_23-24_English.pdf");
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  await parser.load();
  const fullText = await parser.getText();
  console.log("fullText type:", typeof fullText, "keys:", Object.keys(fullText || {}));
  console.log("fullText content sample:", JSON.stringify(fullText).slice(0, 500));
}

test().catch(console.error);
