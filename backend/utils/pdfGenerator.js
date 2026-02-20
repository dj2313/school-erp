const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.generatePDF = async (templateName, data) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, data);

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        return pdf;
    } catch (err) {
        console.error('PDF Generation Error:', err);
        throw err;
    } finally {
        if (browser) await browser.close();
    }
};
