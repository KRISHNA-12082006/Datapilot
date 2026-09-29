// Curated corpus: real organizations with real official website URLs.
// Sustainability/CSR, climate-tech, and Indian tech ecosystem coverage.
export interface CorpusOrg {
  name: string;
  website: string;
  industry: string;
  location: string;
  contactEmail: string;
  phone: string;
  tags: string[];
}

export const CORPUS_PART1: CorpusOrg[] = [
  { name: "Tata Power Renewable Energy", website: "https://www.tatapower.com", industry: "Renewable Energy", location: "Mumbai", contactEmail: "customercare@tatapower.com", phone: "+91 22 6717 1000", tags: ["sustainability", "renewable", "energy", "csr", "sponsor"] },
  { name: "ReNew Power", website: "https://www.renew.com", industry: "Renewable Energy", location: "Gurugram", contactEmail: "info@renew.com", phone: "+91 124 489 6670", tags: ["sustainability", "renewable", "energy", "climate", "sponsor"] },
  { name: "Greenko Group", website: "https://www.greenkogroup.com", industry: "Renewable Energy", location: "Hyderabad", contactEmail: "info@greenkogroup.com", phone: "+91 40 6693 8000", tags: ["sustainability", "renewable", "energy", "climate"] },
  { name: "Infosys Sustainability Practice", website: "https://www.infosys.com", industry: "Technology", location: "Bangalore", contactEmail: "askus@infosys.com", phone: "+91 80 2852 0261", tags: ["technology", "csr", "sponsor", "software"] },
  { name: "Wipro Sustainability", website: "https://www.wipro.com", industry: "Technology", location: "Bangalore", contactEmail: "info@wipro.com", phone: "+91 80 2844 0011", tags: ["technology", "csr", "sponsor", "software"] },
  { name: "Tata Consultancy Services", website: "https://www.tcs.com", industry: "Technology", location: "Mumbai", contactEmail: "info@tcs.com", phone: "+91 22 6778 9595", tags: ["technology", "software", "sponsor"] },
  { name: "Mahindra Susten", website: "https://www.mahindrasusten.com", industry: "Renewable Energy", location: "Mumbai", contactEmail: "info@mahindrasusten.com", phone: "+91 22 2490 1441", tags: ["sustainability", "renewable", "csr", "sponsor"] },
  { name: "Adani Green Energy", website: "https://www.adanigreenenergy.com", industry: "Renewable Energy", location: "Ahmedabad", contactEmail: "info@adani.com", phone: "+91 79 2656 5555", tags: ["sustainability", "renewable", "energy"] },
  { name: "Suzlon Energy", website: "https://www.suzlon.com", industry: "Renewable Energy", location: "Pune", contactEmail: "info@suzlon.com", phone: "+91 20 6702 2000", tags: ["sustainability", "renewable", "wind", "sponsor"] },
  { name: "Thermax Limited", website: "https://www.thermaxglobal.com", industry: "Green Manufacturing", location: "Pune", contactEmail: "info@thermaxglobal.com", phone: "+91 20 2554 2121", tags: ["sustainability", "manufacturing", "environment", "sponsor"] },
  { name: "Kirloskar Brothers", website: "https://www.kirloskarpumps.com", industry: "Manufacturing", location: "Pune", contactEmail: "info@kirloskarpumps.com", phone: "+91 20 2444 0770", tags: ["manufacturing", "sponsor"] },
  { name: "Ather Energy", website: "https://www.atherenergy.com", industry: "Electric Mobility", location: "Bangalore", contactEmail: "hello@atherenergy.com", phone: "+91 80 6735 8888", tags: ["sustainability", "startup", "tech", "sponsor"] },
];


export const CORPUS_PART2: CorpusOrg[] = [
  { name: "Ola Electric", website: "https://www.olaelectric.com", industry: "Electric Mobility", location: "Bangalore", contactEmail: "support@olaelectric.com", phone: "+91 80 4668 1333", tags: ["sustainability", "startup", "tech"] },
  { name: "Zerodha", website: "https://www.zerodha.com", industry: "Fintech", location: "Bangalore", contactEmail: "support@zerodha.com", phone: "+91 80 4719 2020", tags: ["fintech", "finance", "startup", "sponsor"] },
  { name: "Razorpay", website: "https://www.razorpay.com", industry: "Fintech", location: "Bangalore", contactEmail: "care@razorpay.com", phone: "+91 80 4719 1150", tags: ["fintech", "finance", "startup", "sponsor"] },
  { name: "CRED", website: "https://www.cred.club", industry: "Fintech", location: "Bangalore", contactEmail: "support@cred.club", phone: "+91 80 4719 3000", tags: ["fintech", "finance", "startup"] },
  { name: "Persistent Systems", website: "https://www.persistent.com", industry: "Software", location: "Pune", contactEmail: "info@persistent.com", phone: "+91 20 6703 0000", tags: ["technology", "software", "sponsor"] },
  { name: "KPIT Technologies", website: "https://www.kpit.com", industry: "Software", location: "Pune", contactEmail: "info@kpit.com", phone: "+91 20 6770 6000", tags: ["technology", "software", "sponsor"] },
  { name: "Bharat Forge", website: "https://www.bharatforge.com", industry: "Manufacturing", location: "Pune", contactEmail: "info@bharatforge.com", phone: "+91 20 6704 2777", tags: ["manufacturing", "sponsor"] },
  { name: "Centre for Science and Environment", website: "https://www.cseindia.org", industry: "Environmental Services", location: "Delhi", contactEmail: "cse@cseindia.org", phone: "+91 11 2995 5124", tags: ["sustainability", "environment", "ngo"] },
  { name: "The Energy and Resources Institute", website: "https://www.teriin.org", industry: "Environmental Services", location: "Delhi", contactEmail: "registrar@teri.res.in", phone: "+91 11 2468 2100", tags: ["sustainability", "environment", "research", "climate"] },
  { name: "CSTEP", website: "https://www.cstep.in", industry: "Environmental Services", location: "Bangalore", contactEmail: "cstep@cstep.in", phone: "+91 80 6690 2500", tags: ["sustainability", "climate", "research"] },
  { name: "HDFC Bank CSR", website: "https://www.hdfcbank.com", industry: "Finance", location: "Mumbai", contactEmail: "support@hdfcbank.com", phone: "+91 22 6171 3000", tags: ["finance", "csr", "sponsor"] },
  { name: "ICICI Foundation", website: "https://www.icicifoundation.org", industry: "Finance", location: "Mumbai", contactEmail: "info@icicifoundation.org", phone: "+91 22 2653 1414", tags: ["finance", "csr", "sponsor", "ngo"] },
];

export const CORPUS: CorpusOrg[] = [...CORPUS_PART1, ...CORPUS_PART2];
