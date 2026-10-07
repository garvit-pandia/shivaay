// Data for the /resources section.
// Source manifest for downloaded documents: docs/resources-source-manifest.md

export interface PortalLink {
  name: string;
  address: string;
}

export interface DocumentCategory {
  category: string;
  docs: string[];
}

export interface DownloadFile {
  label: string;
  file: string; // public path, e.g. /downloads/CustomNotification.pdf
}

export interface PortFacility {
  id: number;
  name: string;
  location: string;
  maps?: string; // Google Maps embed URL
}

export const portalLinks: PortalLink[] = [
  { name: "ICE Gate (new) Website", address: "https://www.icegate.gov.in/" },
  { name: "DGFT Website", address: "https://www.dgft.gov.in/CP/" },
  { name: "Custom duty calculator", address: "https://www.icegate.gov.in/Webappl/" },
  { name: "View exchange rate", address: "https://foservices.icegate.gov.in/#/services/viewExchangeRate" },
  { name: "Shipping bill enquiry", address: "https://foservices.icegate.gov.in/#/public-enquiries/document-status/ds-shipping-bill" },
];

export const documentCategories: DocumentCategory[] = [
  {
    category: "AD Code Registration",
    docs: [
      "Request Letter on letterhead",
      "AD Code Letter from Bank",
      "IEC Code Copy",
      "GST Registration Copy",
      "PAN Card Copy",
      "Aadhar Card Copy",
    ],
  },
  {
    category: "Import Export Code (IEC) Application",
    docs: [
      "PAN Card of the company",
      "Aadhar Card of the proprietor/partners/directors",
      "GST Registration Copy",
      "Bank Certificate or Canceled Cheque",
      "Company Incorporation Certificate",
      "MOA & AOA / Partnership Deed (if applicable)",
      "Digital Signature Certificate (DSC)",
    ],
  },
  {
    category: "Bill of Entry (For Imports)",
    docs: [
      "Invoice & Packing List",
      "Bill of Lading / Airway Bill",
      "Importer’s IEC Code Copy",
      "GST Registration Copy",
      "Purchase Order or Letter of Credit",
      "Insurance Certificate (if applicable)",
      "Product-Specific Licenses (if required)",
    ],
  },
  {
    category: "Shipping Bill (For Exports)",
    docs: [
      "Invoice & Packing List",
      "Bill of Lading / Airway Bill",
      "IEC Code Copy",
      "GST Registration Copy",
      "Export Order Copy",
      "Product-Specific Certificates (if required, e.g., FSSAI, DGFT license)",
    ],
  },
  {
    category: "GST Refund / IGST Claim Documents",
    docs: [
      "Shipping Bill Copy",
      "Export Invoice & Packing List",
      "Bank Realization Certificate (BRC)",
      "GST Return Filing Copy (GSTR-1, GSTR-3B)",
      "FIRC Copy (Foreign Inward Remittance Certificate)",
    ],
  },
  {
    category: "Letter of Undertaking (LUT) for Exports (Without IGST Payment)",
    docs: [
      "LUT Form on Letterhead",
      "IEC Code Copy",
      "GST Registration Copy",
      "PAN Card Copy",
      "Aadhar Card Copy",
      "Previous LUT (if applicable)",
    ],
  },
  {
    category: "Registration with Port Authorities (ICEGATE, SEZ, CFS, etc.)",
    docs: [
      "Registration Form on Letterhead",
      "IEC Code Copy",
      "GST Registration Copy",
      "PAN Card Copy",
      "Company Incorporation Certificate",
      "Address Proof of Business",
    ],
  },
  {
    category: "Certificate of Origin (For Export Benefits)",
    docs: [
      "Request Letter on Letterhead",
      "Invoice & Packing List",
      "Bill of Lading / Airway Bill",
      "Product-Specific Certificates (if applicable)",
    ],
  },
  {
    category: "Customs Clearance Process (CHA Requirement)",
    docs: [
      "Invoice & Packing List",
      "Bill of Lading / Airway Bill",
      "IEC Code Copy",
      "GST Registration Copy",
      "PAN Card Copy",
      "Import License (if required)",
      "Insurance Certificate (if applicable)",
    ],
  },
];

export const directDownloads: DownloadFile[] = [
  { label: "E-sealing Circular", file: "/downloads/CustomNotification.pdf" },
  { label: "RODTEP AAEOU", file: "/downloads/Appendix4RERODTEPEOU.pdf" },
  { label: "RODTEP Schedule", file: "/downloads/RODTEPNEW.pdf" },
  { label: "New DBK Circular", file: "/downloads/NewDBKcircular.pdf" },
  { label: "List of KYC Documents", file: "/downloads/KYC.docx" },
  { label: "Form A Blank", file: "/downloads/FormA.doc" },
];

export const supportingDownloads: DownloadFile[] = [
  { label: "DBK DECLARATION (Word)", file: "/downloads/DBKDECLARATION.docx" },
  { label: "Declaration", file: "/downloads/declaration.pdf" },
  { label: "Value Declaration", file: "/downloads/ValueDeclaration.pdf" },
  { label: "Import Docs Empty", file: "/downloads/ImportDocsEmpty.pdf" },
];

export const notificationDownloads: DownloadFile[] = [
  { label: "RICE NEW NOTIFICATION WEF 01.05.25", file: "/downloads/RICENEWNOTIFICATION.pdf" },
  { label: "Trade Notice 04-signed", file: "/downloads/TradeNotice.pdf" },
];

export const portFacilities: PortFacility[] = [
  {
    id: 1,
    name: "ICD Container Corporation of India Ltd (INLDH6)",
    location: "Dhandari Kalan Ludhiana",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.3556679554895!2d75.9098667!3d30.876709899999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a9d14276bc0db%3A0x4a46b0767dddb155!2sContainer%20Corporation%20Of%20India%20Ltd!5e0!3m2!1sen!2sin!4v1743413225200!5m2!1sen!2sin",
  },
  {
    id: 2,
    name: "ICD Gateway Distriparks Limited (INSGF6)",
    location: "G.T.Road Sahnewal Ludhiana-141120",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3426.065776825063!2d75.98672979999999!3d30.828823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3910766dfd6b5805%3A0x7d8280a79d4893aa!2sGateway%20Rail%20freight%20limited(GRFL)%20ICD!5e0!3m2!1sen!2sin!4v1743413660275!5m2!1sen!2sin",
  },
  {
    id: 3,
    name: "ICD Pristine Mega Logistics Park Pvt. Ltd (INCPR6)",
    location: "Chawapayal Ludhiana-141412",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3428.5309975923233!2d76.1344539!3d30.759673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39100c5f23f78417%3A0x239edd78212f63dd!2sPristine%20Mega%20Logistics%20Park%20Ltd!5e0!3m2!1sen!2sin!4v1743413698712!5m2!1sen!2sin",
  },
  {
    id: 4,
    name: "ICD HIND TERMINALS PVT. LTD (INQRH6)",
    location: "Kila Raipur, Ludhiana 141118",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.402716848289!2d75.8324375!3d30.735187500000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39107b5591cd5233%3A0xba673539c2102885!2sHind%20Terminals%20Private%20Limited!5e0!3m2!1sen!2sin!4v1743413742246!5m2!1sen!2sin",
  },
  {
    id: 5,
    name: "ICD Adani Multimodal Logistics Park (INQRP6)",
    location: "Kila Raipur",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3428.8901069220346!2d75.82814619999999!3d30.749588199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39107be043d7ecdf%3A0xcd4e0997e8fc5293!2sAdani%20Logistics%20Park%2C%20Kila%20Raipur!5e0!3m2!1sen!2sin!4v1743413801034!5m2!1sen!2sin",
  },
  {
    id: 6,
    name: "CFS Punjab State Warehousing Corporation (INDDL6)",
    location: "",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.294565256576!2d75.92175927558611!3d30.87841967451433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a9d9baaaaaaab%3A0x71a3dd8ac54603c8!2sPunjab%20State%20Warehousing%20Corporation!5e0!3m2!1sen!2sin!4v1743413881290!5m2!1sen!2sin",
  },
  {
    id: 7,
    name: "CFS Overseas Warehousing Pvt.Ltd (INLDH6)",
    location: "Ramgarh Ludhiana",
    maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.2772133380645!2d75.92090259999999!3d30.878905200000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a9d3fb9051863%3A0xc6336894b2001548!2sOverseas%20Warehousing%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1743413923854!5m2!1sen!2sin",
  },
  {
    id: 8,
    name: "Punjab Logistics Infrastructure Limited ICD PLIL (INGPL6)",
    location: "VPO-Ghungrana (near Toll Plaza), Near Ahmedgarh, Ludhiana, Punjab - 141204",
    // No map embed on the reference site for this facility — fall back to a Maps search embed.
    maps: "https://www.google.com/maps?q=Punjab%20Logistics%20Infrastructure%20Limited%20ICD%20PLIL%20Ghungrana%20Ludhiana&output=embed",
  },
];
