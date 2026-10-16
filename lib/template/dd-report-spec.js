// Structure of the Bank Due Diligence Report, mirrored for capture in the portal.
// Every section, block, table, column and fixed row below corresponds to the
// report template (DD Report Template.dc.html) one-for-one.

const T = (id, title, rows) => ({ k: `text`, id, title, rows: rows || 5 });
const N = (id, title, items) => ({ k: `notes`, id, title, items });
const F = (id, title, items) => ({ k: `fields`, id, title, items });
const L = (id, title, add) => ({ k: `list`, id, title, add: add || `Add item` });
const G = (o) => ({ k: `grid`, add: `Add row`, rows: null, seed: null, ...o });

const c = (label, w, type) => ({ label, w, type: type || `text` });
const IDX = { label: `#`, w: 4, type: `idx` };
// the eight report periods, most recent first: three quarters then five financial years —
// headings are editable and shared with the rest of the portal
const PER = (w) => [`f0`, `f1`, `f2`, `f3`, `f4`, `f5`, `f6`, `f7`]
  .map((pk) => ({ label: ``, w: w || 7, type: `period`, pk }));

export const REPORT_PERIOD_KEYS = [`f0`, `f1`, `f2`, `f3`, `f4`, `f5`, `f6`, `f7`];

export function defaultReportPeriods(yr) {
  return {
    f0: `Q3 ${yr}`, f1: `Q2 ${yr}`, f2: `Q1 ${yr}`, f3: `FY${yr - 1}`,
    f4: `FY${yr - 2}`, f5: `FY${yr - 3}`, f6: `FY${yr - 4}`, f7: `FY${yr - 5}`,
  };
}

export const FLAG_OPTIONS = [``, `Green`, `Amber`, `Red`];
export const DOC_STATUS_OPTIONS = [``, `Received`, `Outstanding`, `Waived`, `N/A`];

// Partner onboarding document list, grouped as issued to institutions.
export const ANNEX_GROUPS = [
  { num: 1, title: `Corporate Registration and Regulatory Licensing`, docs: [
    `Evidence of registration with the Corporate Affairs Commission (CAC), including the Memorandum and Articles of Association.`,
    `Share register and UBO declaration`,
    `Operating licence issued by the Central Bank of Nigeria (CBN), together with all other applicable registration documents.`,
    `Outcome of latest CBN and NDIC routine examination reports`,
    `Evidence of submission of CBN/NFIU regulatory returns`,
  ] },
  { num: 2, title: `Governance, Leadership, and Organisational Structure`, docs: [
    `Profiles of the bank’s Board and Management team`,
    `Board and Committee Charters`,
    `Evidence of CBN approval for Board members and management staff.`,
    `Current organisational structure, including the Risk Management Department and Internal Audit function.`,
    `Most recent external Board evaluation or assessment report.`,
    `Corporate governance policies, including the code of conduct.`,
    `Whistleblowing policy.`,
  ] },
  { num: 3, title: `Financial Reporting, Audit, and Tax Compliance`, docs: [
    `Audited financial statements for the last three years.`,
    `Management accounts for the last three quarters`,
    `Management letters issued by the external auditors for the last three financial years`,
    `External Rating reports by rating agencies.`,
    `Evidence of remittance of VAT, withholding tax and other taxes to the Nigeria Revenue Service (NRS), and of PAYE to the relevant State Internal Revenue Service.`,
    `Evidence of remittance of Pension contributions, National Housing Fund contributions, and other statutory deductions.`,
  ] },
  { num: 4, title: `Enterprise Risk Management and Internal Control`, docs: [
    `Risk management framework, policies, risk limits, risk appetite statement`,
    `Internal credit rating model and other risk models`,
    `Most recent risk management reports submitted to management and the Board, including reports for the last three quarters.`,
    `Most recent internal audit reports submitted to the Board, including reports for the last three quarters.`,
    `Internal Audit Policies and Plan`,
    `Stress testing and market-sensitivity analysis reports`,
    `Liquidity Contingency Funding Plan`,
    `Business Continuity and Disaster Recovery Plan.`,
    `Litigation & contingent liabilities schedule`,
    `Organograms & staffing schedules (risk, compliance, internal audit)`,
  ] },
  { num: 5, title: `Credit Risk, Portfolio Management, and MSME Operations`, docs: [
    `Most recent credit portfolio reports, including evidence of debit and credit movements in each loan account.`,
    `Credit risk strategy documents, annual portfolio plan, and Credit Risk Management Manual.`,
    `Policies on collateral valuation`,
    `Evidence of registration with the National Collateral Registry.`,
    `Credit bureau agreements & sample credit reports`,
    `Copies of the bank’s MSME product offerings.`,
    `Evidence of a robust core banking application and other IT infrastructure capable of supporting MSME on-lending.`,
  ] },
  { num: 6, title: `Anti-Money Laundering and Counter-Financing of Terrorism`, docs: [
    `AML/CFT policies and procedures.`,
    `Evidence of submission of AML/CFT returns`,
    `AML screening tool.`,
  ] },
  { num: 7, title: `Environmental, Social, and Sustainability Practices`, docs: [
    `Environmental and Social Risk Management Policies and Manuals.`,
    `Evidence of implementation of the CBN Nigerian Sustainable Banking Principles.`,
    `Environmental and social exclusion list`,
    `Screening tool for ESG Risk in Transactions`,
    `Grievance redress mechanism policy`,
    `Gender policy.`,
    `Corporate social responsibility policy.`,
    `Power audit analysis covering power sources used for banking operations.`,
    `Policy and plans for achieving net-zero emissions.`,
    `Green pipeline schedule`,
    `Board-approved green product programs`,
  ] },
];
export const ANNEX_VERSION = 4;
export const ANNEX_DOCS = ANNEX_GROUPS.reduce((a, g) => a.concat(g.docs), []);
export const annexGroupOf = (doc) => { const g = ANNEX_GROUPS.find((x) => x.docs.indexOf(doc) >= 0); return g ? `${g.num}. ${g.title}` : ''; };

export const REPORT_SPEC = [
  {
    id: `cover`, num: `—`, label: `Cover`, title: `Cover, distribution & contents`,
    guidance: `The memorandum header carried on the front page of the report. The subject institution and report date also drive the running header.`,
    blocks: [
      F(`memo`, `Memorandum header`, [
        [`programme`, `Programme line`], [`subject`, `Subject institution`], [`reportDate`, `Report date`],
        [`to`, `To`], [`from`, `From`], [`thru`, `Thru`], [`cc`, `CC`],
        [`team`, `DD team`], [`period`, `DD period`], [`facility`, `Facility proposed`], [`rec`, `Recommendation`],
      ]),
    ],
  },
  {
    id: `r1`, num: `01`, label: `Executive summary`, movedTo: `S1`, title: `Executive summary & recommendation`,
    guidance: `One page maximum. State the institution, the request, the outcome and the conditions. The table below is the report's at-a-glance RAG summary.`,
    blocks: [
      { ...T(`summary`, `Executive summary`, 8), noResponse: true },
      { ...T(`recommendation`, `Recommendation to the Credit & Investment Committee`, 6), noResponse: true },
      G({
        id: `areas`, title: `Summary of findings by area`,
        cols: [c(`Assessment area`, 26), c(`Flag`, 12, `flag`), c(`Key finding`, 62, `long`)],
        rows: [
          `Institutional profile & ownership`, `Governance & management`, `Regulatory standing`,
          `Financial condition`, `Credit rating outcome`, `Risk management`, `Internal audit`,
          `AML/CFT & KYC`, `Green lending & E&S capacity`, `Litigation & legal matters`,
        ],
      }),
    ],
  },
  {
    id: `r2`, num: `02`, label: `Introduction & scope`, movedTo: `S2`, title: `Introduction, objectives & scope`,
    guidance: `Programme context, what triggered the due diligence, the objectives, the team and the methodology.`,
    blocks: [
      T(`context`, `Introduction`, 6),
      T(`approach`, `Scope & approach`, 6),
      L(`objectives`, `Objectives of the due diligence exercise`, `Add objective`),
      N(`basis`, `Team, methodology & basis`, [
        [`team`, `Due diligence team`], [`methodology`, `Methodology`],
        [`period`, `Period`], [`basis`, `Basis of assessment`],
      ]),
    ],
  },
  {
    id: `r3`, num: `03`, label: `Profile & ownership`, movedTo: `S3`, title: `Institutional profile & ownership`,
    guidance: `Identity, licence, footprint and business model, then ownership traced to ultimate beneficial owners.`,
    blocks: [
      N(`profile`, `Institutional profile`, [
        [`legalName`, `Legal name / trading name`], [`incorporation`, `Incorporation`],
        [`licence`, `Banking licence`], [`headOffice`, `Head office`],
        [`network`, `Network & staff`], [`market`, `Market position`], [`model`, `Business model`],
      ]),
      G({
        id: `shareholders`, title: `Shareholding & ultimate beneficial ownership`, add: `Add shareholder`,
        cols: [IDX, c(`Shareholder`, 26), c(`Holding`, 10), c(`Type`, 16), c(`Nationality / domicile`, 16), c(`UBO / control note`, 28, `long`)],
      }),
    ],
  },
  {
    id: `r4`, num: `04`, label: `Governance`, movedTo: `S4`, title: `Governance & management`,
    guidance: `Board composition and effectiveness, regulatory approval of every director and key officer, and short backgrounds for each.`,
    blocks: [
      G({
        id: `board`, title: `Board of directors — appointments & regulatory approval`, add: `Add director`,
        cols: [IDX, c(`Name`, 22), c(`Position / designation`, 24), c(`Date appointed`, 14), c(`Regulatory approval`, 16), c(`Approval ref`, 20)],
      }),
      G({
        id: `boardBios`, title: `Directors — brief background`, add: `Add director background`,
        cols: [c(`Director`, 24), c(`Background`, 76, `long`)],
      }),
      G({
        id: `management`, title: `Senior management — appointments & regulatory approval`, add: `Add officer`,
        cols: [IDX, c(`Name`, 22), c(`Position`, 24), c(`Date appointed`, 14), c(`Regulatory approval`, 16), c(`Approval ref`, 20)],
      }),
      G({
        id: `mgmtBios`, title: `Management — brief background`, add: `Add officer background`,
        cols: [c(`Officer`, 24), c(`Background`, 76, `long`)],
      }),
    ],
  },
  {
    id: `r5`, num: `05`, label: `Regulatory standing`, title: `Regulatory standing & licences`,
    guidance: `Standing with the primary regulator, statutory obligations, examination history and any enforcement.`,
    blocks: [
      N(`standing`, `Regulatory standing`, [
        [`regulator`, `Primary regulator`], [`licence`, `Licence status`],
        [`deposit`, `Deposit insurance`], [`returns`, `Statutory returns & remittances`],
        [`exam`, `Last examination`], [`sanctions`, `Sanctions / penalties (5 yrs)`],
        [`enforcement`, `Open enforcement actions`], [`litigation`, `Litigation`],
      ]),
      G({
        id: `examRatings`, title: `Control-function ratings — last joint regulatory examination`,
        cols: [c(`Key parameter / control function`, 60), c(`Examination rating`, 40)],
        rows: [
          `Board of directors`, `Senior management`, `Compliance`, `Internal audit`,
          `Risk management`, `Financial analysis`, `Composite risk rating`,
        ],
      }),
    ],
  },
  {
    id: `r6`, num: `06`, label: `Financial analysis`, movedTo: `S6`, title: `Financial analysis`,
    guidance: `Five audited financial years and the last three quarters, most recent first. Column headings are editable and shared with the rest of the portal. Each grid is completed with its line of enquiry, and assessed in the findings below it.`,
    blocks: [
      G({
        id: `capital`, title: `Capital — ₦m and ratios; FY audited, quarters unaudited`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Common equity tier 1 (₦m)`, `Total qualifying capital (₦m)`, `Risk-weighted assets (₦m)`,
          `Capital adequacy ratio`, `Tier 1 ratio`, `Equity / total assets`, `Dividend payout ratio`,
          `NPL net of provisions to capital`,
        ],
      }),
      G({
        id: `assetQuality`, title: `Asset quality — ₦m and ratios`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Gross loans & advances (₦m)`, `Non-performing loans (₦m)`, `NPL ratio`,
          `Loan loss provisions (₦m)`, `NPL coverage ratio`,
          `Write-offs in period (₦m)`, `Restructured loans / gross loans`,
        ],
      }),
      G({
        id: `profitability`, title: `Profitability ratios — FY audited; quarters unaudited, annualised`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Net income (₦m; quarters actual)`, `Return on average assets (ROA)`,
          `Return on average equity (ROE)`, `Net interest margin (NIM)`, `Cost / income ratio`,
          `Fee & commission income / revenue`,
        ],
      }),
      G({
        id: `liquidity`, title: `Liquidity and funding — ₦m and ratios`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Liquid assets (₦m)`, `Customer deposits (₦m)`, `Liquidity ratio`,
          `Net stable funding ratio`, `Loans / deposits`, `Top-20 depositors / deposits`,
          `Interbank & other borrowings (₦m)`,
        ],
      }),
      G({
        id: `marketRisk`, title: `Market risk sensitivity — ₦m and ratios`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Net open FX position (₦m)`, `Open FX position / capital`, `FX assets / total assets`,
          `Net interest margin`,
          `Trading & revaluation income (₦m)`, `Effect of +20% provisions on PBT (₦m)`,
        ],
      }),
      G({
        id: `balance`, title: `Balance sheet — ₦m; FY audited, quarters unaudited`,
        cols: [c(`Indicator`, 26)].concat(PER(9.25)),
        rows: [
          `Total assets`, `Gross loans & advances`, `Liquid assets (cash, central bank, T-bills)`,
          `Customer deposits`, `Borrowings & other funding`, `Total equity`,
        ],
      }),
      G({
        id: `prudential`, title: `Prudential ratios — per regulatory returns`,
        cols: [c(`Indicator`, 18)].concat(PER(8.9)).concat([c(`Reg. min / peer`, 11)]),
        rows: [
          `Capital adequacy ratio`, `Tier 1 ratio`, `NPL ratio`, `NPL coverage`,
          `Liquidity ratio`, `Net stable funding ratio`, `Loans / deposits`,
          `Open FX position / capital`, `Top-20 exposures / Tier 1`,
        ],
      }),
    ],
  },
  {
    id: `r7`, num: `07`, label: `Credit rating`, movedTo: `S17`, title: `Credit rating summary`,
    guidance: `Internal rating and each external rating, with the drivers behind them.`,
    blocks: [
      { ...F(`intRating`, `Internal rating`, [
        [`score`, `Internal score`], [`grade`, `Internal rating grade`],
        [`outlook`, `Outlook`], [`date`, `Date assigned`], [`model`, `Model / scorecard used`],
      ]), grp: `internal` },
      { ...L(`intStrengths`, `Internal rating — key strengths`, `Add strength`), grp: `internal` },
      { ...L(`intConstraints`, `Internal rating — key constraints`, `Add constraint`), grp: `internal` },
      F(`assigned`, `Assigned rating`, [
        [`agency`, `Rating agency`], [`rating`, `Assigned rating`],
        [`outlook`, `Outlook`], [`date`, `Rating date`],
      ]),
      N(`detail`, `Rating detail`, [
        [`exercise`, `Rating exercise`], [`national`, `National scale`],
        [`prior`, `Prior rating`], [`sovereign`, `Sovereign context`],
      ]),
      L(`strengths`, `Key rating strengths`, `Add strength`),
      L(`constraints`, `Key rating constraints`, `Add constraint`),
    ],
  },
  {
    id: `r8`, num: `08`, label: `Risk management`, movedTo: `S7`, title: `Risk management`,
    guidance: `Governance structure and reporting lines, the approved policy set, evidence of adoption, the risk models in use and unit staffing — each completed with its line of enquiry.`,
    blocks: [
      G({
        id: `governance`, title: `Risk governance structure — committees and reporting lines`,
        cols: [c(`Body / unit`, 26), c(`Composition`, 22), c(`Chair`, 18), c(`Meets`, 14), c(`Reports to`, 20)],
        rows: [
          `Board Risk Committee`, `Board Credit Committee`, `Management Risk & Compliance Committee`,
          `Management Credit Committee`, `Asset & Liability Committee (ALCO)`,
        ],
      }),
      G({
        id: `staffing`, title: `Risk management unit — staffing`,
        cols: [c(`Unit`, 34), c(`Number of staff`, 18), c(`Experience and qualification of staff`, 48, `long`)],
        rows: [
          `Credit risk`, `Market & liquidity risk`, `Operational risk & business continuity`,
          `E&S risk`, `Total`,
        ],
      }),
      G({
        id: `policies`, title: `Approved policies`,
        cols: [c(`Policy`, 40), c(`Approving authority`, 25), c(`Last approved`, 17), c(`Next review`, 18)],
        rows: [
          `Enterprise risk management framework`, `Risk appetite statement`,
          `Credit policy manual (incl. Exclusion List)`, `Market & liquidity risk policy`,
          `Operational risk & BCP policy`, `Stress testing framework`, `ESMS`,
        ],
      }),
      G({
        id: `adoption`, title: `Policy quality, reporting and evidence of adoption`, add: `Add evidence`,
        cols: [c(`Policy`, 26), c(`Assessment`, 34, `long`), c(`Evidence of adoption`, 40, `long`)],
      }),
      G({
        id: `models`, title: `Risk models — existence, quality and usage`, add: `Add model`,
        cols: [c(`Model`, 22), c(`Purpose / portfolio`, 20), c(`Built by`, 14), c(`Last validated`, 14), c(`How output is used`, 30, `long`)],
      }),
    ],
  },
  {
    id: `r9`, num: `09`, label: `Internal audit`, movedTo: `S16`, title: `Internal audit`,
    guidance: `The approved policy set, quality of policies and evidence of adoption, and unit staffing — each completed with its line of enquiry.`,
    blocks: [
      G({
        id: `policies`, title: `Approved policies`, extra: true, add: `Add policy for review`,
        cols: [c(`Policy`, 40), c(`Approving authority`, 25), c(`Last approved`, 17), c(`Next review`, 18)],
        rows: [
          `Internal audit policy`, `Annual audit plan`,
        ],
      }),
      L(`evidence`, `Quality of policies and evidence of adoption`, `Add evidence`),
      G({
        id: `staffing`, title: `Internal audit unit — staffing`,
        cols: [c(`Unit`, 34), c(`Number of staff`, 18), c(`Experience and qualification of staff`, 48, `long`)],
        rows: [
          `Credit & branch audit`, `Treasury & financial audit`, `IT & systems audit`,
          `Compliance & special investigations`, `CIA office (QA & findings follow-up)`, `Total`,
        ],
      }),
    ],
  },
  {
    id: `r10`, num: `10`, label: `AML/CFT & KYC`, movedTo: `S8`, title: `AML/CFT & KYC compliance`,
    guidance: `MLRO independence, policy suite, screening and monitoring, STR activity and inspection history.`,
    blocks: [
      G({
        id: `governance`, title: `AML/CFT governance structure — committees and reporting lines`,
        cols: [c(`Body / unit`, 26), c(`Composition`, 22), c(`Chair`, 18), c(`Meets`, 14), c(`Reports to`, 20)],
        rows: [
          `Board Audit & Compliance Committee`, `Management Risk & Compliance Committee`,
          `Compliance function (CCO)`, `MLRO office`,
        ],
      }),
      G({
        id: `policies`, title: `Approved policies`,
        cols: [c(`Policy`, 40), c(`Approving authority`, 25), c(`Last approved`, 17), c(`Next review`, 18)],
        rows: [
          `AML/CFT policy suite (financial crime policy)`,
          `KYC / CDD procedures & risk-classification methodology`,
          `Anti-bribery & corruption policy`, `Whistle-blowing policy`,
        ],
      }),
      G({
        id: `adoption`, title: `Policy quality, reporting and evidence of adoption`, add: `Add evidence`,
        cols: [c(`Policy`, 26), c(`Assessment`, 34, `long`), c(`Evidence of adoption`, 40, `long`)],
      }),
      G({
        id: `models`, title: `AML/CFT screening tools and models — existence, quality and usage`, add: `Add tool / model`,
        cols: [c(`Tool / model`, 22), c(`Purpose / coverage`, 20), c(`Built or sourced from`, 14), c(`Last validated / tuned`, 14), c(`How output is used`, 30, `long`)],
      }),
      G({
        id: `staffing`, title: `Compliance unit — staffing`,
        cols: [c(`Unit`, 34), c(`Number of staff`, 18), c(`Experience and qualification of staff`, 48, `long`)],
        rows: [
          `KYC / CDD & onboarding`, `Transaction monitoring & STR reporting`,
          `Sanctions & PEP screening`, `Regulatory compliance & training`, `CCO / MLRO office`, `Total`,
        ],
      }),
    ],
  },
  {
    id: `r11`, num: `11`, label: `Green & E&S`, movedTo: `S9 & S13`, title: `Green lending capacity & E&S risk management`,
    guidance: `This section gates eligibility: capacity to originate, screen, tag and report green sub-loans, and the state of the ESMS.`,
    blocks: [
      N(`capacity`, `Green lending capacity & systems`, [
        [`track`, `Green lending track record`],
        [`tagging`, `Tagging & reporting`], [`ta`, `TA needs`],
      ]),
      G({
        id: `sectors`, title: `Loan portfolio by economic sector`,
        cols: [c(`Sector`, 56), c(`₦m`, 22), c(`% of portfolio`, 22)],
        rows: [
          `Manufacturing`, `Services & other`, `General commerce`, `Construction & real estate`,
          `Information & communication`, `Energy & utilities`, `Transportation & storage`,
          `Agriculture, forestry & fishing`, `Total gross loans`,
        ],
      }),
      G({
        id: `outcome`, title: `Funding outcome on the green portfolio — current vs projected`,
        cols: [c(`Indicator`, 46), c(`Current`, 27), c(`Projected — full utilisation`, 27)],
        rows: [
          `Green portfolio outstanding (₦m)`, `Green share of gross loans`, `Active green sub-loans`,
          `Annual GHG emissions avoided (tCO₂e)`, `Annual energy generated / saved (GWh)`,
          `Renewable capacity financed (MW)`,
        ],
      }),
      G({
        id: `products`, title: `Approved green products — targets & how they deliver programme objectives`, add: `Add product`,
        cols: [c(`Product (board approved)`, 26), c(`Green target`, 22), c(`Function — how it enables programme objectives`, 52, `long`)],
      }),
      G({
        id: `pipeline`, title: `Identified green pipeline (18 months)`, add: `Add category`,
        cols: [c(`Eligible category`, 32), c(`Deals`, 10), c(`Value (₦m)`, 14), c(`Example transactions`, 44, `long`)],
      }),
    ],
  },
  {
    id: `r12`, num: `12`, label: `Litigation`, movedTo: `S14`, title: `Litigation & legal proceedings`,
    guidance: `Material claims in both directions, provisions held, and whether any matter touches the licence, solvency or the facility.`,
    blocks: [
      N(`overview`, `Overview`, [
        [`sources`, `Sources reviewed`], [`against`, `Cases against the bank`],
        [`byBank`, `Cases initiated by the bank`], [`regulatory`, `Regulatory / criminal`],
        [`materiality`, `Materiality`], [`impact`, `Impact on facility`],
      ]),
      G({
        id: `casesAgainst`, title: `Material cases pending against the bank`, add: `Add case`,
        cols: [IDX, c(`Case / forum`, 20), c(`Nature of claim`, 20), c(`Claim (₦m)`, 12), c(`Status & counsel view`, 30, `long`), c(`Provision (₦m)`, 14)],
      }),
      G({
        id: `casesBy`, title: `Material cases initiated by the bank`, add: `Add case`,
        cols: [IDX, c(`Counterparty / forum`, 24), c(`Nature of action`, 26), c(`Claim (₦m)`, 14), c(`Status`, 32, `long`)],
      }),
      L(`assessment`, `Assessment`, `Add assessment point`),
    ],
  },
  {
    id: `r13`, num: `13`, label: `Risks & mitigants`, movedTo: `S18`, title: `Key risks & mitigants`,
    guidance: `The risks the committee is being asked to accept, each paired with the control or condition that answers it.`,
    blocks: [
      G({
        id: `risks`, title: `Key risks & mitigants`, add: `Add risk`,
        cols: [IDX, c(`Key risk identified`, 42), c(`Mitigant(s)`, 54, `long`)],
      }),
    ],
  },
  {
    id: `r14`, num: `14`, label: `Facility terms`, movedTo: `S19`, title: `Proposed facility terms & conditions`,
    guidance: `Indicative term sheet. Anything conditional belongs in conditions precedent, not in the narrative.`,
    blocks: [
      G({
        id: `terms`, title: `Proposed facility terms`,
        cols: [c(`Term`, 24), c(`Detail`, 76, `long`)],
        rows: [
          `Facility type`, `Amount`, `Tenor / availability`, `Pricing`, `Repayment`,
          `Use of proceeds`, `Sub-loan parameters`, `Security / ranking`,
          `Conditions precedent`, `Reporting`,
        ],
      }),
    ],
  },
  {
    id: `r15`, num: `15`, label: `RAG matrix`, title: `RAG scoring matrix`,
    guidance: `One flag per report section, with the basis for the flag and the remediation where it is not green.`,
    blocks: [
      G({
        id: `rag`, title: `RAG scoring matrix`,
        cols: [c(`Part`, 6), c(`Area`, 28), c(`Flag`, 12, `flag`), c(`Basis / remediation`, 54, `long`)],
        rows: [
          [`03`, `Institutional profile & ownership`], [`04`, `Governance & management`],
          [`05`, `Regulatory standing & licences`], [`06`, `Financial analysis`],
          [`07`, `Credit rating summary`], [`08`, `Risk management`], [`09`, `Internal audit`],
          [`10`, `AML/CFT & KYC compliance`], [`11`, `Green lending & E&S`],
          [`12`, `Litigation & legal proceedings`],
        ],
      }),
      T(`overall`, `Overall conclusion`, 4),
    ],
  },
  {
    id: `r16`, num: `16`, label: `Covenants & sign-off`, movedTo: `S20`, title: `Covenants, monitoring & sign-off`,
    guidance: `Covenants must be testable from the quarterly compliance certificate. Sign-off is recorded here and carried into the report.`,
    blocks: [
      G({
        id: `financial`, title: `Financial covenants (tested quarterly)`,
        cols: [c(`Covenant`, 40), c(`Threshold`, 30), c(`Current`, 30)],
        rows: [
          `Capital adequacy ratio`, `NPL ratio`, `NPL coverage`,
          `Liquidity ratio`, `Green Portfolio`, `Women Portfolio`,
        ],
      }),
      G({
        id: `programme`, title: `Programme covenants`,
        cols: [c(`Covenant`, 26), c(`Requirement`, 74, `long`)],
        rows: [`Use of proceeds`, `E&S compliance`, `Exclusion list`, `Impact reporting`, `Audit rights`],
      }),
      G({
        id: `monitoring`, title: `Monitoring plan`,
        cols: [c(`Activity`, 34), c(`Frequency`, 18), c(`Owner / notes`, 48, `long`)],
        rows: [
          `Covenant compliance review`, `Use-of-proceeds & impact review`, `Full annual review`,
          `On-site visit incl. sub-borrower sampling`, `ESMS remediation check (CP follow-up)`,
        ],
      }),
      G({
        id: `signoff`, title: `Sign-off`,
        cols: [c(`Role`, 32), c(`Name`, 34), c(`Date / reference`, 34)],
        rows: [
          `Prepared — Senior Credit Analyst`, `Reviewed — Chief Risk Officer`, `Approved — MD/CEO`,
        ],
      }),
    ],
  },
  {
    id: `annexA`, num: `A`, label: `Annex A`, movedTo: `S21`, title: `Annex A — Document checklist`,
    guidance: `All items must be Received or formally waived before committee submission. File references point to the deal room.`,
    blocks: [
      G({
        id: `docs`, title: `Document checklist`, add: `Add document`,
        cols: [IDX, c(`Document`, 42), c(`Status`, 14, `status`), c(`Date received`, 16), c(`Notes / file ref`, 24)],
        seed: ANNEX_DOCS.map((d) => [``, d, ``, ``, ``]),
      }),
    ],
  },
];

// Parts carrying a movedTo marker are captured inside the assessment sections named
// there; the builder keeps only the parts with no assessment-section home.
export const BUILDER_SPEC = REPORT_SPEC.filter((p) => !p.movedTo);
export const partById = (id) => REPORT_SPEC.find((p) => p.id === id) || null;
export const blocksOf = (part, only) => (
  Array.isArray(only) && only.length ? part.blocks.filter((b) => only.indexOf(b.id) >= 0) : part.blocks
);

// ————— blank capture object shaped by the spec —————

export function blankReport() {
  const out = {};
  REPORT_SPEC.forEach((sec) => {
    const s = {};
    sec.blocks.forEach((b) => {
      if (b.k === `text`) s[b.id] = ``;
      else if (b.k === `fields` || b.k === `notes`) {
        const o = {};
        b.items.forEach(([key]) => { o[key] = ``; });
        s[b.id] = o;
      } else if (b.k === `list`) s[b.id] = [``];
      else if (b.k === `grid`) {
        if (b.rows) s[b.id] = b.rows.map(() => b.cols.map(() => ``));
        else if (b.seed) s[b.id] = b.seed.map((r) => r.slice());
        else s[b.id] = [b.cols.map(() => ``)];
      }
    });
    out[sec.id] = s;
  });
  return out;
}

// `only` limits the count to a subset of block ids — used where one report part is
// split across two assessment sections (green lending / E&S).
export function reportProgress(sec, data, only) {
  let filled = 0, total = 0;
  const d = (data && data[sec.id]) || {};
  blocksOf(sec, only).forEach((b) => {
    const v = d[b.id];
    if (b.k === `text`) { total += 1; if (v) filled += 1; }
    else if (b.k === `fields` || b.k === `notes`) {
      b.items.forEach(([key]) => { total += 1; if (v && v[key]) filled += 1; });
    } else if (b.k === `list`) {
      total += 1; if (Array.isArray(v) && v.some((x) => x && x.trim())) filled += 1;
    } else if (b.k === `grid`) {
      const editable = b.cols.map((col, i) => (col.type === `idx` ? -1 : i)).filter((i) => i >= 0);
      const lead = b.rows ? (Array.isArray(b.rows[0]) ? b.rows[0].length : 1) : 0;
      (v || []).forEach((row) => {
        editable.forEach((ci) => {
          if (ci < lead) return;
          total += 1;
          if (row[ci] && String(row[ci]).trim()) filled += 1;
        });
      });
    }
  });
  return { filled, total, pct: total ? Math.round((filled / total) * 100) : 0 };
}
