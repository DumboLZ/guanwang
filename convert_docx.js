const mammoth = require("mammoth");
const path = require("path");

const filePath = path.join(__dirname, "心核游戏隐私政策.docx");

mammoth.convertToHtml({ path: filePath })
    .then(function (result) {
        const html = result.value;
        console.log("---START_CONTENT---");
        console.log(html);
        console.log("---END_CONTENT---");
    })
    .catch(function (err) {
        console.error("Conversion failed:", err);
    });
