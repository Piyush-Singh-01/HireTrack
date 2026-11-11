import puppeteer from "puppeteer";
// You can change this value to test timeouts (e.g., set to 1000 for a quick timeout failure)
const PUPPETEER_TIMEOUT = 12000;
import {
    getDefaultHtml,
    getCustomize1Html,
    getCustomize2Html,
} from "./templateDesigns.js";

/**
 * Generates an offer letter PDF buffer from dynamic data.
 * Selects the correct layout (default / customize1 / customize2) AND
 * applies the correct color theme (blue / darkblue / lightgreen / pink / purple).
 */
export const generateOfferLetterPdf = async({
    selectedTemplate,
    selectedColor,
    candidateName,
    companyName,
    companyAddress,
    logo,
    salutation,
    introParagraph,
    position,
    duration,
    startDate,
    endDate,
    location,
    employmentType,
    salary,
    stipend,
    noticePeriod,
    responsibilities,
    notice,
    closingNote,
    senderName,
    senderTitle,
    phone,
    email,
    website,
    signature,
}) => {
    const data = {
        selectedColor: selectedColor || "blue",
        candidateName,
        companyName,
        companyAddress,
        logo,
        salutation,
        introParagraph,
        position,
        duration,
        startDate,
        endDate,
        location,
        employmentType,
        salary,
        stipend,
        noticePeriod,
        responsibilities,
        notice,
        closingNote,
        senderName,
        senderTitle,
        phone,
        email,
        website,
        signature,
    };

    let html = "";
    if (selectedTemplate === "customize1") {
        html = getCustomize1Html(data);
    } else if (selectedTemplate === "customize2") {
        html = getCustomize2Html(data);
    } else {
        // Default template — color-aware
        html = getDefaultHtml(data);
    }

    let browser;
    try {
        browser = await puppeteer.launch({
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',

                headless: 'new',
                
                protocolTimeout: 300000, // 5 minutes
                
                timeout: 300000,
                
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--no-first-run',
                    '--no-zygote'
                    // Removed '--single-process' because it causes silent freezes and timeouts in live environments
                ]
            });
        // try {
        //     browser = await puppeteer.launch({
        //         headless: "new",
        //         args: ["--no-sandbox", "--disable-setuid-sandbox"],
        //         timeout: PUPPETEER_TIMEOUT,
        //         protocolTimeout: PUPPETEER_TIMEOUT, // 2 minutes

        //     });

        const page = await browser.newPage();

        // Set viewport to A4 width at 96dpi
        await page.setViewport({ width: 794, height: 1123 });

        // Set content and wait for it to be stable
        await page.setContent(html, {
            waitUntil: ["networkidle0", "load", "domcontentloaded"],
            timeout: PUPPETEER_TIMEOUT,
        });

        // Extra safety wait for assets (fonts, images)
        await new Promise((resolve) => setTimeout(resolve, 500));
        // console.timeEnd(`Page Setup & Render - ${candidateName}`);

        // console.time(`PDF Buffer Creation - ${candidateName}`);
        // Generate fixed A4 PDF — all content is designed to fit one page
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
            timeout: PUPPETEER_TIMEOUT,
        });
        // console.timeEnd(`PDF Buffer Creation - ${candidateName}`);

        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};