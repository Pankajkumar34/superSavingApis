const bwipjs = require("bwip-js");

const generateBarcodeImage = async (code) => {
    const buffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: String(code),        // 👈 ye string hi barcode ke andar hoti hai
        scale: 3,
        height: 15,
        includetext: true,
        includetext: true,
        textxalign: "center",
        barcolor: "000000",
        backgroundcolor: "FFFFFF"
    });
    const base64 = buffer.toString("base64");
    return `data:image/png;base64,${base64}`;
};

module.exports = {
    generateBarcodeImage,
};