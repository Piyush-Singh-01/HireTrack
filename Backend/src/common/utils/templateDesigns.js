// src/utils/templateDesigns.js
// Color-aware template generation for all 3 layouts x 5 color themes.
import fs from 'fs';
import path from 'path';

// Load watermark logo as base64
let bgLogoBase64 = "";
try {
  const base64Path = path.join(process.cwd(), 'src', 'common', 'utils', 'bglogo_base64.txt');
  if (fs.existsSync(base64Path)) {
    bgLogoBase64 = fs.readFileSync(base64Path, 'utf8').trim();
    if (!bgLogoBase64.startsWith('data:')) {
      bgLogoBase64 = `data:image/png;base64,${bgLogoBase64}`;
    }
  }
} catch (error) {
  console.error("Error loading bglogo_base64.txt:", error);
}

// Extracted from /offerletter/<Template>/<color>.html reference files
export const COLOR_PALETTES = {
  blue: {
    primary:        '#10859A',
    primaryDark:    '#10859A',
    primaryDeep:    '#10859A',
    primaryBright:  '#5AE3FB',
    gradientStart:  '#10859A',
    gradientEnd:    '#5AE3FB',
    accent:         '#42b8ee',
    pageBg:         '#eef1f7',
  },
  darkblue: {
    primary:        '#2147AE',
    primaryDark:    '#0d266d',
    primaryDeep:    '#0d266d',
    primaryBright:  '#194ad3',
    gradientStart:  '#0D266D',
    gradientEnd:    '#194AD3',
    accent:         '#42b8ee',
    pageBg:         '#eef1f7',
  },
  lightgreen: {
    primary:        '#109A71',
    primaryDark:    '#0A694D',
    primaryDeep:    '#064230',
    primaryBright:  '#45F0BD',
    gradientStart:  '#109A71',
    gradientEnd:    '#45F0BD',
    accent:         '#8DF0D2',
    pageBg:         '#f0fbf7',
  },
  pink: {
    primary:        '#B50C80',
    primaryDark:    '#82085A',
    primaryDeep:    '#5A063F',
    primaryBright:  '#FB71D0',
    gradientStart:  '#B50C80',
    gradientEnd:    '#FB71D0',
    accent:         '#FFB3EB',
    pageBg:         '#fef0fb',
  },
  purple: {
    primary:        '#61109A',
    primaryDark:    '#4A0C75',
    primaryDeep:    '#3A095C',
    primaryBright:  '#AF4DF4',
    gradientStart:  '#61109A',
    gradientEnd:    '#AF4DF4',
    accent:         '#D49BFC',
    pageBg:         '#f9f5fc',
  },
};

// Fallback to blue for unknown color keys
const getPalette = (selectedColor) =>
  COLOR_PALETTES[selectedColor] || COLOR_PALETTES.blue;

// Build CSS :root block from palette
const buildCssVars = (p) => `
  :root {
    --primary:                   ${p.primary};
    --primary-dark:              ${p.primaryDark};
    --primary-deep:              ${p.primaryDeep};
    --primary-bright:            ${p.primaryBright};
    --brand-gradient:            linear-gradient(180deg, ${p.gradientStart} 0%, ${p.gradientEnd} 100%);
    --brand-gradient-horizontal: linear-gradient(-30deg, ${p.gradientStart} 10%, ${p.gradientEnd} 100%);
    --accent:                    ${p.accent};
    --text:                      #27385f;
    --muted:                     #4c5b78;
    --paper:                     #ffffff;
    --page-bg:                   ${p.pageBg};
    --watermark-opacity:         0.5;
  }
`;

// Build responsibilities <ul> list HTML
const buildResponsibilities = (responsibilities) =>
  (responsibilities || "")
    .split("\n")
    .filter((r) => r.trim())
    .map((r) => `<li>${r.trim()}</li>`)
    .join("");

// Shared SVG icon strings
const PHONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19.95 21q-3.125 0-6.175-1.362t-5.55-3.863t-3.862-5.55T3 4.05q0-.45.3-.75t.75-.3H8.1q.35 0 .625.238t.325.562l.65 3.5q.05.4-.025.675T9.4 8.45L6.975 10.9q.5.925 1.187 1.787t1.513 1.663q.775.775 1.625 1.438T13.1 17l2.35-2.35q.225-.225.588-.337t.712-.063l3.45.7q.35.1.575.363T21 15.9v4.05q0 .45-.3.75t-.75.3"/></svg>`;
const EMAIL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/></svg>`;
const WEB_SVG  = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.17562 14.3068C8.98082 14.3068 9.77813 14.1482 10.522 13.8401C11.2659 13.5319 11.9419 13.0803 12.5112 12.5109C13.0806 11.9416 13.5322 11.2657 13.8404 10.5218C14.1485 9.77785 14.3071 8.98054 14.3071 8.17535C14.3071 7.37015 14.1485 6.57284 13.8404 5.82894C13.5322 5.08503 13.0806 4.40911 12.5112 3.83975C11.9419 3.27039 11.2659 2.81875 10.522 2.51061C9.77813 2.20248 8.98082 2.04388 8.17562 2.04388M8.17562 14.3068C7.37043 14.3068 6.57311 14.1482 5.82921 13.8401C5.08531 13.5319 4.40938 13.0803 3.84002 12.5109C3.27066 11.9416 2.81902 11.2657 2.51089 10.5218C2.20275 9.77785 2.04416 8.98054 2.04416 8.17535C2.04416 7.37015 2.20275 6.57284 2.51089 5.82894C2.81902 5.08503 3.27066 4.40911 3.84002 3.83975C4.40938 3.27039 5.08531 2.81875 5.82921 2.51061C6.57311 2.20248 7.37043 2.04388 8.17562 2.04388M8.17562 14.3068C10.0566 14.3068 10.8605 10.7894 10.8605 8.17535C10.8605 5.5613 10.0566 2.04388 8.17562 2.04388M8.17562 14.3068C6.29462 14.3068 5.49072 10.7894 5.49072 8.17535C5.49072 5.5613 6.29462 2.04388 8.17562 2.04388M2.3848 6.13153H13.9664M2.3848 10.2192H13.9664" stroke="white" stroke-width="1.1679" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Shared contact footer HTML
const buildContactFooter = (data, footerClass) => `
  <footer class="${footerClass}">
    <div class="contact-item">
      <div class="contact-icon">${PHONE_SVG}</div>
      <div><span class="contact-label">Call</span><span class="contact-value">${data.phone || ''}</span></div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">${EMAIL_SVG}</div>
      <div><span class="contact-label">Email</span><span class="contact-value">${data.email || ''}</span></div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">${WEB_SVG}</div>
      <div><span class="contact-label">Website</span><span class="contact-value">${data.website || ''}</span></div>
    </div>
  </footer>`;

// Build logo HTML
const buildLogo = (logo, companyName) => {
  if (logo && (logo.startsWith("http") || logo.startsWith("data:"))) {
    return `<img src="${logo}" alt="${companyName || 'Company'}" style="max-width:300px;max-height:100px;object-fit:contain;display:block;" />`;
  }
  return `<div class="brand-fallback"><small>Company</small><span>${companyName || 'COMPANY'}</span></div>`;
};

// Build signature HTML
const buildSignature = (signature, senderName) => {
  if (signature && (signature.startsWith("http") || signature.startsWith("data:"))) {
    return `<img class="signature-image" src="${signature}" alt="${senderName || ''} signature">`;
  }
  return '';
};

// Shared content body (same across all 3 layouts)
const buildContentBody = (data) => {
  const respList = buildResponsibilities(data.responsibilities);
  const sigHtml  = buildSignature(data.signature, data.senderName);
  const formatComp = (val, isEmployee) => {
    if (!val) return '';
    if (val === 'Unpaid Internship') return val;
    let str = val.trim();
    if (/^\d+$/.test(str)) {
      const formattedNum = Number(str).toLocaleString('en-IN');
      return `₹${formattedNum} per month`;
    }
    if (!str.includes('₹') && !str.includes('$') && /^\d/.test(str)) {
      return '₹' + str;
    }
    return str;
  };

  return `
    <h1>Job Offer Letter</h1>
    <p class="greeting">${data.salutation || 'Dear'} ${data.candidateName || ''},</p>
    <p>${data.introParagraph || `We are pleased to inform you that you have been selected for the <strong>${data.position}</strong> at ${data.companyName}. We were impressed with your creativity, design skills, and enthusiasm, and we believe you will be a valuable addition to our team.`}</p>

    <div class="section-title">
      ${data.employmentType === 'Employee' ? 'Employee Details:' : 'Internship Details:'}
    </div>
    <ul>
      <li>Position: ${data.position || ''}</li>
      <li>Duration: ${data.duration || (data.employmentType === 'Employee' ? 'Full-time' : '6 months')}</li>
      <li>Start Date: ${data.startDate || ''}</li>
      ${data.employmentType !== 'Employee' ? `<li>End Date: ${data.endDate || ''}</li>` : ''}
      <li>Location: ${data.location || 'Remote'}</li>
      <li>${data.employmentType === 'Employee' ? 'Salary' : 'Stipend'}: ${formatComp(data.employmentType === 'Employee' ? data.salary : data.stipend, data.employmentType === 'Employee')}</li>
      <li>Notice Period: ${data.noticePeriod || 'One week (5 working days)'}</li>
    </ul>

    ${respList ? `<div class="section-title">Responsibilities:</div><ul>${respList}</ul>` : ''}

    <p class="closing-note">${data.notice || 'Please confirm your acceptance of this offer by signing and returning the attached copy of this letter by [Confirmation Date].'}</p>
    <p>${data.closingNote || `We are excited to have you as part of the ${data.companyName} team and look forward to the creative contributions you will bring during your ${data.employmentType === 'Employee' ? 'employment' : 'internship'}.`}</p>

    <div class="signature-row">
      <div><div>Best regards,</div>${sigHtml}</div>
      <div>Signature,</div>
    </div>
    <div class="sender">
      ${data.senderName || ''}
      <span class="sender-title">${data.senderTitle || `Founder & MD, ${data.companyName || ''}`}</span>
    </div>`;
};

// Shared base CSS (layout-independent styles)
const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { min-height: 100%; }
  body {
    background: var(--page-bg);
    color: var(--text);
    display: flex;
    justify-content: center;
    padding: 24px;
    font-family: "Montserrat", "Poppins", Arial, sans-serif;
    font-size: 12px;
    line-height: 1.75;
  }
  .offer-letter { width: 794px; min-height: 1123px; background: var(--paper); position: relative; overflow: hidden; box-shadow: 0 18px 45px rgba(16,36,84,0.16); }
  .brand-fallback { line-height: 1.02; font-weight: 800; color: var(--primary-deep); }
  .brand-fallback small { display: block; font-size: 15px; font-weight: 700; }
  .brand-fallback span  { display: block; font-size: 29px; }
  .watermark { position: absolute; left: 50%; top: 55%; transform: translate(-50%,-50%); width: 600px; opacity: var(--watermark-opacity); z-index: 1; pointer-events: none; }
  h1 { color: var(--primary); font-size: 22px; line-height: 1; text-align: center; text-transform: uppercase; font-weight: 800; margin: 0 0 28px; }
  .greeting { color: var(--text); font-size: 15px; font-weight: 800; margin-bottom: 14px; }
  p { margin-bottom: 12px; }
  strong, b { font-weight: 800; color: #16284e; }
  .section-title { font-weight: 500; margin-top: 8px; margin-bottom: 1px; }
  ul { list-style: none; margin-bottom: 12px; }
  li { position: relative; padding-left: 10px; margin-bottom: 1px; }
  li::before { content: "\\2022"; position: absolute; left: 0; color: var(--text); font-size: 11px; line-height: 1.7; }
  .closing-note { margin-top: 14px; }
  .signature-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; color: var(--text); font-size: 17px; font-weight: 800; line-height: 1.45; margin-top: 16px; }
  .signature-image { width: 155px; height: 58px; object-fit: contain; object-position: left center; display: block; margin: 6px 0 4px; }
  .sender { color: var(--text); font-size: 17px; line-height: 1.45; font-weight: 800; margin-top: 28px; }
  .sender-title { display: block; font-size: 16px; }
  .contact-item { display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 10px; min-width: 0; }
  .contact-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--brand-gradient); color: #ffffff; display: grid; place-items: center; font-size: 17px; font-weight: 800; line-height: 1; }
  .contact-label { display: block; font-size: 11px; line-height: 1.2; font-weight: 800; color: var(--text); }
  .contact-value { display: block; color: var(--text); font-size: 11px; line-height: 1.35; white-space: normal; overflow-wrap: anywhere; }
  .bottom-band { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; }
  .bottom-band svg { width: 100%; height: 100%; display: block; }
  @page { size: A4; margin: 0; }
  @media print { body { background: #ffffff; padding: 0; } .offer-letter { width: 210mm; min-height: 297mm; box-shadow: none; } }
`;

// HTML document wrapper
const wrapDoc = (cssVars, extraCss, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Offer Letter</title>
  <style>${cssVars}${BASE_CSS}${extraCss}</style>
</head>
<body>${body}</body>
</html>`;


// =============================================================================
// DEFAULT TEMPLATE
// Top: diagonal chevrons (right side) | Logo: top-right | Footer: bottom bar
// =============================================================================
export const getDefaultHtml = (data) => {
  const p  = getPalette(data.selectedColor);
  const gs = p.gradientStart, ge = p.gradientEnd;
  const logoHtml = buildLogo(data.logo, data.companyName);
  const watermark = bgLogoBase64 ? `<img class="watermark" src="${bgLogoBase64}" alt="">` : '';

  const extraCss = `
    .top-band { height: 102px; position: relative; background: transparent; }
    .top-band svg { width: 100%; height: 100%; display: block; }
    .brand { position: absolute; top: 30px; right: 58px; width: 500px; height: 150px; display: flex; justify-content: flex-end; align-items: center; z-index: 3; }
    .brand img { max-width: 500px; max-height: 150px; object-fit: contain; object-position: right center; }
    .content { position: relative; z-index: 2; padding: 80px 62px 120px; }
    .bottom-band { height: 41px; }
    .footer { position: absolute; left: 43px; bottom: 46px; z-index: 4; display: flex; flex-direction: row; align-items: center; padding: 2px; gap: 25px; color: var(--text); }
  `;

  const body = `
  <section class="offer-letter">
    <div class="top-band">
      <svg viewBox="0 0 595 100" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M148 41L179 0L595 0V41L148 41Z" fill="url(#dg1)"/>
        <path d="M0 0H206L146.707 100H0V0Z" fill="url(#dg2)"/>
        <defs>
          <linearGradient id="dg1" x1="372.487" y1="1.96059" x2="295.19" y2="118.674" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="dg2" x1="103" y1="0" x2="103" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="brand">${logoHtml}</div>
    ${watermark}
    <main class="content">${buildContentBody(data)}</main>
    ${buildContactFooter(data, 'footer')}
    <div class="bottom-band">
      <svg viewBox="0 0 595 41" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M331 41L353.472 14L473 14V41L331 41Z" fill="url(#db1)"/>
        <path d="M-97 41L-29.2846 34L338 33L330.883 41L-97 41Z" fill="url(#db2)"/>
        <path d="M432 41L457.796 0L595 0V41L432 41Z" fill="url(#db3)"/>
        <defs>
          <linearGradient id="db1" x1="402.314" y1="15.2911" x2="349.693" y2="53.6191" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="db2" x1="117.887" y1="34.3347" x2="114.547" y2="62.6071" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="db3" x1="513.86" y1="1.96059" x2="442.918" y2="41.0213" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </section>`;

  return wrapDoc(buildCssVars(p), extraCss, body);
};


// =============================================================================
// CUSTOMIZE 1 TEMPLATE
// Top: opposing wave curves | Logo: centered | Footer: horizontal separator line
// =============================================================================
export const getCustomize1Html = (data) => {
  const p  = getPalette(data.selectedColor);
  const gs = p.gradientStart, ge = p.gradientEnd;
  const logoHtml = buildLogo(data.logo, data.companyName);
  const watermark = bgLogoBase64 ? `<img class="watermark" src="${bgLogoBase64}" alt="">` : '';

  const extraCss = `
    .top-band { height: 51px; position: relative; background: transparent; }
    .top-band svg { width: 100%; height: 100%; display: block; }
    .brand { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); width: 400px; height: 80px; display: flex; justify-content: center; align-items: center; z-index: 3; }
    .brand img { max-width: 400px; max-height: 80px; object-fit: contain; object-position: center; }
    .content { position: relative; z-index: 2; padding: 155px 62px 110px; }
    .bottom-band { height: 11px; }
    .footer { position: absolute; left: 58px; right: 58px; bottom: 46px; z-index: 4; display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #7c8ba1; color: var(--text); }
  `;

  const body = `
  <section class="offer-letter">
    <div class="top-band">
      <svg viewBox="0 0 595 51" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M250 0C250 0 303.133 51 359.947 51C416.761 51 595 51 595 51V0L250 0Z" fill="url(#c1g1)"/>
        <path d="M291 51C291 51 237.867 0 181.053 0C124.239 0 -54 0 -54 0V51L291 51Z" fill="url(#c1g2)"/>
        <defs>
          <linearGradient id="c1g1" x1="409.959" y1="48.5607" x2="312.538" y2="-18.2575" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="c1g2" x1="131.041" y1="2.43925" x2="228.462" y2="69.2575" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="brand">${logoHtml}</div>
    ${watermark}
    <main class="content">${buildContentBody(data)}</main>
    ${buildContactFooter(data, 'footer')}
    <div class="bottom-band">
      <svg viewBox="0 0 502 11" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 11L67.7154 1.375L435 0L502 11L0 11Z" fill="url(#c1bot)"/>
        <defs>
          <linearGradient id="c1bot" x1="214.887" y1="1.83527" x2="208.649" y2="40.2391" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </section>`;

  return wrapDoc(buildCssVars(p), extraCss, body);
};


// =============================================================================
// CUSTOMIZE 2 TEMPLATE
// Top: right-side arrow/chevron block | Logo: top-left | Footer: thin bar
// =============================================================================
export const getCustomize2Html = (data) => {
  const p  = getPalette(data.selectedColor);
  const gs = p.gradientStart, ge = p.gradientEnd;
  const logoHtml = buildLogo(data.logo, data.companyName);
  const watermark = bgLogoBase64 ? `<img class="watermark" src="${bgLogoBase64}" alt="">` : '';

  const extraCss = `
    .top-band { position: absolute; top: 0; right: 0; height: 133px; z-index: 1; }
    .top-band svg { height: 100%; display: block; }
    .brand { position: absolute; top: 25px; left: 10px; width: 300px; height: 80px; display: flex; justify-content: flex-start; align-items: center; z-index: 3; }
    .brand img { max-width: 300px; max-height: 80px; object-fit: contain; object-position: left center; }
    .content { position: relative; z-index: 2; padding: 135px 62px 110px; }
    h1 { margin-top: 40px; }
    .bottom-band { height: 11px; }
    .footer { position: absolute; left: 58px; right: 58px; bottom: 46px; z-index: 4; display: flex; justify-content: space-between; align-items: center; padding-top: 15px; color: var(--text); }
  `;

  const body = `
  <section class="offer-letter">
    <div class="top-band">
      <svg viewBox="0 0 398 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M398 0H37L93.9539 50L37 100H398V0Z" fill="url(#c2g1)"/>
        <path d="M23 0L72 50L23 100L82.5 50L23 0Z" fill="url(#c2g2)"/>
        <path d="M0 4L48.5882 50L0 96L59 50L0 4Z" fill="url(#c2g3)"/>
        <defs>
          <linearGradient id="c2g1" x1="217.5" y1="0" x2="217.5" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="c2g2" x1="27.5" y1="0" x2="27.5" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
          <linearGradient id="c2g3" x1="4.46219" y1="4" x2="4.46219" y2="96" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="brand">${logoHtml}</div>
    ${watermark}
    <main class="content">${buildContentBody(data)}</main>
    ${buildContactFooter(data, 'footer')}
    <div class="bottom-band">
      <svg viewBox="0 0 502 11" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 11L67.7154 1.375L435 0L502 11L0 11Z" fill="url(#c2bot)"/>
        <defs>
          <linearGradient id="c2bot" x1="214.887" y1="1.83527" x2="208.649" y2="40.2391" gradientUnits="userSpaceOnUse">
            <stop stop-color="${gs}"/><stop offset="1" stop-color="${ge}"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </section>`;

  return wrapDoc(buildCssVars(p), extraCss, body);
};