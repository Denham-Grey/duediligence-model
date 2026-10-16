// Demonstration content for the Meridian Trust Bank Plc case: every assessment section,
// every line of enquiry and every report part. Applied to empty fields only, so anything
// an analyst has typed into the demo case is left as it is.

export const MERIDIAN_FILL_VERSION = 4;

// period helper: values given oldest-first (FY2021 … FY2025, Q1 … Q3 2026), stored most-recent-first
const P = (fy21, fy22, fy23, fy24, fy25, q1, q2, q3, ...rest) => [``, q3, q2, q1, fy25, fy24, fy23, fy22, fy21, ...rest];

const SECTION_META = {
  S1: { assessor: `A. Mensah`, date: `14 Aug 2026` },
  S2: { assessor: `A. Mensah`, date: `05 Aug 2026` },
  S3: { assessor: `R. Okonjo`, date: `06 Aug 2026` },
  S4: { assessor: `R. Okonjo`, date: `08 Aug 2026` },
  S5: { assessor: `T. Lindqvist`, date: `11 Aug 2026` },
  S6: { assessor: `T. Lindqvist`, date: `13 Aug 2026` },
  S7: { assessor: `R. Okonjo`, date: `13 Aug 2026` },
  S8: { assessor: `A. Mensah`, date: `12 Aug 2026`, rating: 2 },
  S9: { assessor: `A. Mensah`, date: `12 Aug 2026`, rating: 3,
    rationale: `ESMS adopted by the board in 2024 and an E&S officer appointed, but procedures are not yet visible in credit files and the portfolio has not been categorised. Remediation is a condition of the facility.` },
  S10: { assessor: `T. Lindqvist`, date: `12 Aug 2026`, rating: 2,
    rationale: `Stable core banking platform with gender and green tagging fields already live. Data completeness on the legacy SME book is the main gap; reporting record to the prior DFI lender is good.` },
  S11: { assessor: `T. Lindqvist`, date: `12 Aug 2026`, rating: 2,
    rationale: `Established SME franchise with a visible eligible pipeline covering roughly half the facility. Absorption over 24 months is realistic with the proposed TA on women-owned product design.` },
  S12: { assessor: `A. Mensah`, date: `12 Aug 2026`, rating: 2,
    rationale: `Meets the 2X leadership and employment criteria; not the ownership criterion. A dedicated women-in-business proposition exists, though sex-disaggregated data on the legacy book is incomplete.` },
  S13: { assessor: `A. Mensah`, date: `13 Aug 2026`, rating: 3,
    rationale: `Small but genuine green book with four approved products. Technical appraisal capacity and impact measurement are thin and depend on external support; verification at origination needs tightening.` },
  S14: { assessor: `R. Okonjo`, date: `11 Aug 2026`, rating: 2,
    rationale: `No litigation that threatens the licence, solvency or the facility. Existing lender agreements contain no restriction that the facility would breach; authorisations in hand subject to the board resolution.` },
  S15: { assessor: `A. Mensah`, date: `10 Aug 2026`, rating: 1,
    rationale: `No adverse findings on the bank or its principals. Lender and correspondent references uniformly positive; good standing with the Kenya Bankers Association confirmed.` },
  S16: { assessor: `R. Okonjo`, date: `11 Aug 2026`, rating: 2,
    rationale: `Independent, adequately staffed function reporting to the Board Audit Committee, with a risk-based plan delivered at 92%. External quality assessment is overdue and IT audit capacity is thin.` },
  S17: { assessor: `T. Lindqvist`, date: `13 Aug 2026` },
  S18: { assessor: `A. Mensah`, date: `14 Aug 2026` },
  S19: { assessor: `A. Mensah`, date: `14 Aug 2026` },
  S20: { assessor: `A. Mensah`, date: `14 Aug 2026` },
  S21: { assessor: `A. Mensah`, date: `14 Aug 2026` },
};

// [status, finding, notes, redFlag, rating]
const C = `Complete`, IP = `In progress`;
const QUESTIONS = {
  S5: {
    1: [C, `Deposit-funded commercial bank: 46% corporate, 31% SME and 23% retail by gross loans. Net interest income is 74% of revenue and fees 26%. The facility would fund the SME book, the segment the board-approved plan names for growth.`, ``, false, 2],
  },
  S6: {
    8: [C, `Total assets grew from ₦1.46bn to ₦2.52bn over FY2021 to Q3 2026, with loans rising faster than deposits; loans / deposits moved from 70% to 79%. Liquid assets hold steady at about 24% of total assets. Borrowings rose to ₦226m but remain under 10% of funding, so the facility would be the largest wholesale line.`, `Balance sheet grid; A4.1 audited accounts`, false, 2],
    9: [IP, `Every ratio sits within its requirement except two. The NPL ratio has been above the 5.0% ceiling since FY2024, and top-20 exposures exceeded the 200% internal guide in FY2025 and Q1 2026 before easing to 199%. Provision coverage of 61% remains below the 70% peer level.`, `A4.4 prudential returns`, true, 4],
    7: [IP, `Management projections to FY2029 assume 18% loan growth and NIM stable at 5.5%. Our downside case (12% growth, NIM 5.0%, cost of risk 1.6%) keeps CAR above 15.0% throughout the facility period; the plan does not need new capital.`, `Projection model and our sensitivity working paper`, false, 3],
  },
  S7: {
    6: [C, `Delegated authority matrix approved Jan 2026; SME loans above ₦250k go to the management credit committee. Standard cash-flow analysis template in use; collateral haircuts documented. Pricing is risk-based for corporate loans only.`, ``, false, 2],
    8: [IP, `Dedicated recoveries unit of 11 staff. Restructuring policy requires two performing instalments before reclassification; three files tested and compliant. Recovery rate on written-off loans 34% over three years.`, `Delinquency and recovery reports Q4 2025 to Q2 2026`, false, 3],
    11: [C, `Fifteen SME files reviewed on site (11 performing, 4 non-performing). Twelve fully compliant; three lacked updated collateral valuations and one an E&S screening form. Findings agree with internal audit's 2025 credit review.`, `File review working paper`, false, 3],
  },
  S8: {
    1: [C, `Board Audit & Compliance Committee holds financial crime oversight and meets quarterly. MLRO is a senior manager reporting to the committee with a direct line to the chair; Management Risk & Compliance Committee reviews AML MI monthly.`, `A6.1 AML/CFT policy`, false, 2],
    2: [C, `Financial crime policy suite approved by the board in Mar 2026; KYC/CDD procedures and risk-classification methodology approved Feb 2026. All four core policies are within their review cycle.`, ``, false, 2],
    3: [C, `Policies are tailored to the customer base (cash-intensive trade and agriculture). Monthly MI to the committee covers alerts, STRs and overdue reviews. Adoption evidenced in the 12 KYC files sampled.`, ``, false, 2],
    4: [IP, `Screening on a vendor tool with fuzzy matching; customer risk-rating model built in-house; rules-based transaction monitoring. Last tuning in Sep 2025, but the rationale for the thresholds is not documented.`, `Tuning documentation requested`, false, 3],
    5: [C, `Compliance unit of 14 FTE across five teams, CCO and MLRO both ACAMS-certified. Headcount grew from 9 in 2024 in line with customer growth.`, ``, false, 2],
    6: [C, `Monthly CTR and quarterly AML returns filed on time for the last eight quarters per the regulator's acknowledgements. 38 STRs filed in FY2025; the FRC has raised no quality comments.`, `STR/CTR filing log`, false, 2],
    7: [C, `Annual AML/CFT e-learning completed by 97% of staff in FY2025; role-specific training for front office and trade finance. Board briefed annually.`, ``, false, 2],
    8: [C, `Risk-based CDD with EDD for PEPs and high-risk sectors; beneficial ownership captured to the 25% threshold. Periodic review cycle 1, 3 and 5 years by risk rating; 2.1% of reviews overdue.`, ``, false, 2],
    9: [C, `Screening against UN, OFAC, EU, UK and local lists at onboarding and daily on the full customer base; hits escalated to the MLRO within 24 hours. No sanctions exposure identified.`, `A6.3 screening procedure`, false, 1],
    10: [IP, `2,140 alerts in FY2025, 96% closed within 30 days. Alert-to-STR conversion 1.8%. Records retained for seven years in line with the AML Act.`, ``, false, 2],
    11: [C, `No AML/CFT penalties in five years. The 2024 thematic inspection raised two findings (EDD documentation, training records), both closed and verified by the regulator in 2025.`, `Last AML inspection report and response`, false, 2],
    12: [C, `Three correspondent relationships (USD, EUR, GBP), none terminated or restricted. Wolfsberg CBDDQ (2025) obtained, signed and reviewed.`, `A6.4 Wolfsberg CBDDQ`, false, 1],
    13: [C, `Kenya was removed from the FATF increased-monitoring list in 2026; no counter-measures apply. National risk assessment identifies cash-intensive trade and real estate as the main typologies.`, ``, false, 2],
    14: [C, `ABC policy with a gifts and hospitality register and an externally hosted whistle-blowing hotline. Four reports in FY2025, none relating to corruption.`, ``, false, 2],
    15: [C, `Bank, five UBOs, nine directors and eight executives screened on 07 Aug 2026. No sanctions or watchlist hits; no substantive adverse media.`, `A6.5 screening results pack`, false, 1],
  },
  S9: {
    1: [IP, `ESMS adopted by the board in Nov 2024 with an E&S officer appointed in 2025 (IFC-trained). Procedures exist on paper; four of six sampled credit files had no E&S screening form.`, `ESMS manual v1.0`, false, 3],
    2: [C, `Bank's exclusion list is aligned to the D&G list with one gap (tobacco processing), which management has agreed to add. Screening is applied at origination through a checklist in the credit memo.`, ``, false, 2],
    3: [IP, `Portfolio has not yet been categorised. Our desk estimate places 9% of the loan book in higher-risk sectors (agri-processing, construction, transport).`, ``, false, 3],
    4: [IP, `Environmental permits are checked for corporate borrowers but not consistently for SMEs. No labour-standards check at origination.`, ``, false, 3],
    5: [C, `External grievance mechanism in place since 2024; 11 complaints in FY2025, none relating to client E&S impacts. No campaigns involving clients.`, `Grievance log`, false, 2],
    6: [C, `HR policies cover equal opportunity, parental leave and OHS. A GBVH policy was adopted in 2025 with a confidential reporting channel; two cases were handled under it.`, `HR policy pack`, false, 2],
    7: [IP, `No formal climate risk assessment. Fossil-fuel exposure is limited to two fuel distributors (1.1% of loans). Physical-risk exposure in the agriculture book is not yet analysed.`, ``, false, 3],
    8: [C, `Prepared E&S reports for the prior DFI lender each year 2020–2024, on time and in the required format.`, ``, false, 2],
  },
  S10: {
    1: [C, `Core banking on a tier-one vendor platform since 2019; 99.8% availability in FY2025. Gender-ownership and green-tag fields added at loan level in 2024.`, ``, false, 2],
    2: [IP, `Sex-disaggregated data complete for loans booked since 2024 (98%) but only 61% for the legacy SME book. Monthly reconciliation of the segment codes to the general ledger.`, ``, false, 3],
    3: [C, `Sample utilisation, portfolio-quality and impact reports produced from MIS within five working days of request, in the facility format.`, `MIS report samples`, false, 2],
    4: [C, `Reported to the prior DFI lender for 22 quarters: 21 on time and one 9 days late (system migration). No restatements.`, ``, false, 2],
    5: [IP, `Financial covenants are monitored monthly by Finance. Eligibility criteria are not yet automated and would rely on a manual quarterly check until the tagging rules are built.`, ``, false, 3],
  },
  S11: {
    4: [C, `Existing SME term loan (₦20k–₦500k, up to 60 months) fits the target segment. A collateral-light variant for women-owned businesses is in design with TA support.`, ``, false, 2],
    5: [C, `SME origination of ₦96m in FY2025. Allocating ₦60m over 24 months would be 31% of projected SME origination, which is achievable on the current pipeline and growth plan.`, `Absorption working paper`, false, 2],
    6: [C, `TA requested for women-owned product design, green technical appraisal and E&S file controls. Management has committed staff time and co-funding.`, ``, false, 2],
  },
  S12: {
    1: [C, `Not women-owned: women hold 18% of the shares. The ownership criterion is not met.`, ``, false, 3],
    2: [C, `Three of nine directors (33%) and four of nine executive committee members (44%) are women, so the 30% leadership threshold is met.`, `Board and management gender schedule`, false, 2],
    3: [C, `Women make up 52% of the workforce. Quality indicator: a GBVH policy and 16 weeks of paid maternity leave. The employment criterion is met.`, ``, false, 2],
    4: [C, `The bank's definition (51% women-owned, or a woman founder still active in the business) matches the facility definition. It is captured at onboarding by self-declaration and checked against the share register.`, ``, false, 2],
    5: [IP, `Women-owned SME book ₦58m across 1,120 borrowers (27% of the SME book by value); average loan ₦52k; NPL 5.2% against 7.1% for the SME book overall.`, ``, false, 2],
    6: [C, `The "Imara" women-in-business proposition was launched in 2025 with a dedicated loan product, a business advisory programme and a women's banking desk in eight branches.`, `Product programme documents`, false, 2],
    7: [IP, `Sixty-four relationship managers trained on gender-inclusive finance in 2025. Origination targets for women-owned lending exist at branch level but are not linked to incentives.`, ``, false, 3],
    8: [IP, `Loan-level data capture for women-owned status is in place for new loans; the legacy book is being back-filled, with completion expected in Q1 2027.`, ``, false, 3],
    9: [C, `The 2024 market study identified collateral and record-keeping as the main barriers. The offer responds with movable-asset collateral and bookkeeping support.`, ``, false, 2],
  },
  S13: {
    1: [C, `Green lending since 2022 with ₦16.4m outstanding across 74 sub-loans. A loan-level green tag has been live in core banking since 2024, and Risk reviews the tags each quarter. TA is needed for technical appraisal and impact measurement.`, ``, false, 3],
    2: [C, `Agriculture and manufacturing are each 20% of gross loans and energy & utilities 5%. The green opportunity is concentrated in agri cold chain and commercial solar for manufacturing and trade borrowers.`, `Sector distribution grid`, false, 2],
    3: [C, `Four board-approved green products: solar PV for premises, energy-efficient equipment, cold-chain finance and small hydro. Each has a portfolio target and eligibility criteria.`, `A11.1 green product approvals`, false, 2],
    4: [IP, `Pipeline of 38 green deals (₦14.6m) over 18 months, concentrated in commercial solar and cold chain.`, `Green pipeline schedule`, false, 2],
    5: [C, `At full utilisation the green book rises from ₦16.4m to about ₦40m, roughly 2.6% of gross loans. Projected impact is 8,400 tCO₂e avoided each year.`, ``, false, 2],
    6: [C, `Green portfolio ₦16.4m (1.2% of loans) across 74 sub-loans. No green bond or green loan framework yet.`, ``, false, 3],
    7: [IP, `Two credit officers have been trained on solar appraisal and there is no in-house engineer. External technical review is used for loans above ₦1m.`, ``, false, 3],
    8: [IP, `Eligibility is confirmed from vendor invoices and specification sheets at disbursement. There is no post-installation verification for loans below ₦1m.`, ``, false, 3],
    9: [IP, `MW installed is recorded; MWh saved and tCO₂e avoided are estimated with the IFC calculator but not yet reported routinely.`, ``, false, 3],
    10: [C, `Green tags are reviewed quarterly by Risk; two loans were untagged in 2025 after an eligibility review. Reclassifications are logged.`, ``, false, 2],
    11: [C, `Tagging is aligned with the CBK Climate Risk Guidance (2021) and the draft Kenya Green Finance Taxonomy.`, ``, false, 2],
  },
  S14: {
    1: [C, `Litigation schedule, external counsel confirmation letters and a court registry search were reviewed. Nine cases are pending against the bank (₦6.8m claimed) and 41 recovery actions were initiated by the bank. There are no regulatory or criminal proceedings.`, `Litigation schedule; counsel letters`, false, 2],
    2: [C, `Three cases against the bank exceed ₦0.5m. Counsel rates two as remote and one as possible; ₦1.1m is provisioned.`, ``, false, 2],
    3: [C, `The largest recovery actions are against the two agri-processing borrowers driving the NPL increase, with ₦29.4m claimed. Both are at judgment stage.`, ``, false, 2],
    4: [C, `None of the matters, alone or together, threatens the licence, solvency or the bank's ability to perform under the facility.`, ``, false, 2],
    5: [C, `Tax clearance certificate current to Jun 2027. There are no material disputes; a ₦0.3m VAT assessment is under objection.`, `Tax clearance certificate`, false, 2],
    6: [C, `Two existing lender agreements contain negative pledge and pari passu clauses consistent with an unsecured senior facility. Cross-default thresholds would not be triggered.`, `Existing lender agreements`, false, 2],
    7: [IP, `The articles permit the borrowing. A board resolution authorising the facility and its signatories is to be passed at the September board meeting.`, ``, false, 2],
    8: [C, `English law and LCIA arbitration are acceptable under Kenyan law; local counsel confirms the covenants are enforceable.`, `Local counsel memo`, false, 2],
  },
  S15: {
    1: [C, `Searched Dow Jones, LexisNexis and open-source media on 07 Aug 2026 for the bank, its UBOs, directors and executives, using English and Swahili terms. No credible adverse findings.`, `A15.1 screening results`, false, 1],
    2: [C, `References from the prior DFI lender, one correspondent bank and a regional development bank. All three described the bank as a reliable counterparty with timely reporting.`, `Reference checks record`, false, 1],
    3: [C, `The regulator, the external auditor and the Kenya Bankers Association were consulted. The bank is a full KBA member in good standing and sits on the Bankers' Committee SME sub-committee. There were no negative views.`, ``, false, 1],
    4: [C, `There is no past association with financial scandal, fraud, political interference or misuse of donor funds.`, ``, false, 1],
    5: [C, `No conflicts of interest were identified with D&G staff or board. Declarations were obtained from the DD team.`, ``, false, 1],
    6: [C, `Bureau reports on the bank and on each of the nine directors are clean, with no defaults or judgments.`, `Credit bureau reports`, false, 1],
  },
  S16: {
    1: [C, `Chief Internal Auditor (CIA) reports to the Board Audit Committee. The committee has four members, three of them independent, and an independent chair who is a chartered accountant. It met five times in FY2025.`, `Audit organogram`, false, 2],
    2: [C, `Administrative reporting is to the CEO. The committee appoints, appraises and sets the pay of the CIA. No restrictions on scope were reported.`, ``, false, 2],
    3: [C, `Internal audit policy approved by the board in Feb 2025; the FY2026 annual plan was approved by the committee in Dec 2025. Both are in date.`, `Internal audit charter; FY2026 plan`, false, 2],
    4: [C, `The policy follows IIA standards and the plan is risk-based. Adoption is evidenced by 92% delivery of the FY2025 plan and quarterly reporting to the committee.`, ``, false, 2],
    5: [IP, `Function of 14 FTE in five units; nine hold CIA or ACCA. IT audit has a single auditor, which is thin for the bank's size.`, `Staffing schedule`, false, 3],
    6: [C, `Findings are rated high, medium or low. Of 63 findings open at FY2025, four high-risk items are overdue, all escalated to the committee with revised dates.`, `Issue tracker`, false, 2],
    7: [IP, `An internal QAIP is in place. The last external quality assessment was in 2020, so the five-yearly review is overdue; it is scheduled for Q1 2027.`, ``, false, 3],
    8: [C, `Meets the external auditor twice a year and shares its reports. The regulator rated internal audit "satisfactory" at the last joint examination.`, ``, false, 2],
  },
};

const SECTION_TEXT = {
  S3: { management: `Management confirms no change to the licence or corporate particulars is planned during the facility period.`, evidence: `A1.1–A1.4; regulator confirmation letter dated 05 Aug 2026.` },
  S4: { management: `Board skills refresh to be completed at the 2026 AGM; committee self-assessment scheduled for Q4 2026. Independent-director attestations to be added to all related-party files.`, evidence: `A2.3–A2.6; board minutes Q3 2025 to Q2 2026.` },
  S5: { management: `Growth target moderated to 12% for FY2026 while asset quality is remediated; SME and women-in-business segments remain the priority.`, evidence: `A3.1 strategy 2025–2028; A3.2 product approvals.` },
  S6: { management: `NPL remediation plan submitted to the regulator in Feb 2026. Provision coverage to be raised to 70% over two quarters from retained earnings.`, evidence: `A4.1–A4.4; classification sample working paper.` },
  S7: { management: `Stress testing framework to be re-approved by the Board Risk Committee in Oct 2026. Independent validation of the SME scorecard and ECL model tendered for Q1 2027.`, evidence: `A5.1 framework; board risk reports Q4 2025 to Q2 2026.` },
  S8: { management: `Tuning rationale for transaction monitoring scenarios to be documented and approved by the committee by Nov 2026.`, evidence: `A6.1–A6.5; STR/CTR filing log.` },
  S9: { management: `E&S screening to be made a mandatory field in the credit workflow by Dec 2026. Portfolio categorisation to be completed by Q1 2027 with TA support.`, evidence: `ESMS manual v1.0; sampled files working paper.` },
  S10: { management: `Legacy SME book back-fill of gender data to complete by Q1 2027. Eligibility rules to be automated in MIS within six months of signing.`, evidence: `MIS report samples; IT policy pack; DR test report Nov 2025.` },
  S11: { management: `Collateral-light women-owned product to launch within three months of first disbursement.`, evidence: `A9.1 pipeline schedule; absorption working paper.` },
  S12: { management: `Branch women-lending targets to be linked to the FY2027 incentive scheme.`, evidence: `Gender composition schedule; Imara programme documents.` },
  S13: { management: `Second technical officer to be recruited and post-installation verification extended to all green loans.`, evidence: `A11.1 green product approvals; green pipeline schedule.` },
  S14: { management: `Board resolution authorising the facility to be passed at the 24 Sep 2026 meeting.`, evidence: `Litigation schedule; counsel letters; local counsel memo.` },
  S15: { management: `No response required.`, evidence: `A15.1 screening results; reference checks record.` },
  S16: { management: `External quality assessment contracted for Q1 2027; second IT auditor to be recruited in FY2026.`, evidence: `Internal audit charter; FY2026 plan; issue tracker.` },
  S17: { evidence: `Agency rating report Mar 2026; internal score sheet Aug 2026.` },
};

const OUTSTANDING_DOCS = {
  S6: [`FX and interest-rate position report`],
  S7: [`Risk model documentation and latest validation report`],
  S8: [`Screening and transaction monitoring system documentation and last tuning/validation`],
  S9: [`Sample screened sub-loan files with E&S categorisation`],
  S13: [`Sample green sub-loan files with verification evidence`],
  S16: [`External quality assessment of internal audit`],
};

const REPORT = {
  cover: {
    memo: {
      programme: `D&G Women & Green SME Credit Line — Kenya`, subject: `Meridian Trust Bank Plc`, reportDate: `14 Aug 2026`,
      to: `Credit & Investment Committee`, from: `A. Mensah, Senior Credit Analyst`, thru: `Chief Risk Officer`,
      cc: `Head of Programmes; General Counsel`, team: `A. Mensah (lead), R. Okonjo, T. Lindqvist`,
      period: `04 Aug – 14 Aug 2026`, facility: `₦60m senior unsecured term loan, 7 years`, rec: `Approve with conditions`,
    },
  },
  r1: {
    summary: `Meridian Trust Bank Plc is a mid-sized Kenyan commercial bank: seventh of 22 by assets and third in SME lending. It has requested a ₦60m, seven-year senior term loan to on-lend to women-owned and green SMEs.\n\nThe bank is well governed and its AML/CFT programme is sound. It has a clean integrity record and an established SME franchise, and its eligible pipeline already covers about half of the facility. Capital is adequate, with 230bp headroom over the regulatory minimum, and earnings are steady.\n\nAsset quality is the main weakness. NPLs have risen to 6.4%, above the 5.0% regulatory ceiling, and provision coverage of 58% is below the peer median. The ESMS has been adopted but is not yet applied in credit files. Green technical capacity is thin.`,
    recommendation: `Approve a ₦60m senior unsecured term loan, subject to three conditions precedent: foreign borrowing registration, written allocation of facility-monitoring accountability, and a board resolution authorising the facility.\n\nFinancial covenants: NPL coverage restored to at least 70% within 12 months; CAR of at least 15.5% throughout; quarterly sex-disaggregated and green-tagged utilisation reporting.\n\nTA to support ESMS implementation and green appraisal capacity.`,
    areas: [
      [``, `Green`, `Licensed since 1998 with an unrestricted licence and no enforcement history. Ownership traced to five UBOs, none of them PEPs.`],
      [``, `Green`, `Board has an independent majority and four functioning committees. Management is stable; two board-evaluation actions remain open.`],
      [``, `Amber`, `In good standing with the regulator. The NPL ratio has breached the 5.0% ceiling since FY2024 and a remediation plan has been filed.`],
      [``, `Amber`, `CAR 16.8% and ROAA 1.9%. NPLs at 6.4% with 58% coverage are the principal weakness.`],
      [``, `Green`, `Rated B+ / stable by the agency and grade 4 (moderate) internally; the two views are consistent.`],
      [``, `Amber`, `The framework is sound, but the stress testing framework is past its review date and the models have not been independently validated.`],
      [``, `Green`, `Independent function, 92% plan delivery. External quality assessment is overdue.`],
      [``, `Green`, `Board-approved programme, independently tested, with no sanctions hits. Tuning documentation is outstanding.`],
      [``, `Amber`, `ESMS adopted but not yet applied in credit files. The green book is small and technical capacity thin.`],
      [``, `Green`, `No matter threatens the licence, solvency or the facility; ₦1.1m provisioned.`],
    ],
  },
  r2: {
    context: `The D&G Women & Green SME Credit Line provides senior funding to partner banks for onward lending to women-owned SMEs and to eligible green investments. Meridian Trust Bank approached D&G in May 2026 for a Kenya allocation. This is the bank's first due diligence with D&G.`,
    approach: `Desk review of documents supplied through the deal room, followed by an on-site visit to Nairobi (05–08 Aug 2026). The visit included interviews with the board chair, the CEO, the CRO, the CFO, the MLRO and the Chief Internal Auditor, and a review of 15 SME credit files. Independent screening, reference checks and market soundings were completed separately.`,
    objectives: [
      `Confirm the bank's legal standing, ownership and authority to borrow and on-lend.`,
      `Assess financial soundness and its capacity to service a seven-year senior facility.`,
      `Evaluate risk management, internal audit, AML/CFT and E&S controls against D&G minimum standards.`,
      `Test capacity to originate, tag and report eligible women-owned and green sub-loans.`,
      `Recommend facility terms, conditions and covenants to the Credit & Investment Committee.`,
    ],
    basis: {
      team: `A. Mensah (lead, Senior Credit Analyst); R. Okonjo (governance and risk); T. Lindqvist (financial analysis)`,
      methodology: `D&G Bank Due Diligence Methodology v4: weighted section ratings of 1 to 5, red-flag override and RAG summary`,
      period: `04 Aug – 14 Aug 2026; financial data FY2021 to Q3 2026`,
      basis: `Audited statements FY2021–FY2025, unaudited interim accounts and prudential returns to Q3 2026, management interviews and on-site file testing`,
    },
  },
  r3: {
    profile: {
      legalName: `Meridian Trust Bank Plc, trading as Meridian Bank`,
      incorporation: `Public limited company, Kenya, 1998 (reg. no. C.41928)`,
      licence: `Commercial banking licence No. CBK/CB/041, unrestricted, no expiry`,
      headOffice: `Meridian House, Upper Hill, Nairobi`,
      network: `38 branches, 214 agency outlets in 21 counties; 1,640 staff`,
      market: `7th of 22 banks by assets (4.1% share); 3rd by SME lending`,
      model: `Deposit-funded commercial bank; loans 46% corporate, 31% SME, 23% retail`,
    },
    shareholders: [
      [``, `Kilele Assurance Group Plc`, `28.4%`, `Listed insurer`, `Kenya`, `Widely held; no controlling shareholder. Two board seats.`],
      [``, `Three domestic pension funds`, `46.1%`, `Institutional`, `Kenya`, `Largest single fund holds 19.2%; no control rights.`],
      [``, `Ndegwa Family Holdings Ltd`, `11.2%`, `Family vehicle`, `Kenya`, `Founding family. Three UBOs, none PEP; one board seat.`],
      [``, `Free float (NSE)`, `14.3%`, `Public`, `Various`, `No holder above 1%.`],
    ],
  },
  r4: {
    board: [
      [``, `Prof. Wanjiru Kamau`, `Chair, independent non-executive`, `Mar 2019`, `Approved`, `CBK/FP/2019/112`],
      [``, `David Ochieng`, `Managing Director & CEO`, `Jan 2019`, `Approved`, `CBK/FP/2018/287`],
      [``, `Grace Mutua`, `Executive director, Finance`, `Feb 2026`, `Approved`, `CBK/FP/2026/031`],
      [``, `Samuel Kiprono`, `Independent non-executive`, `Jun 2020`, `Approved`, `CBK/FP/2020/074`],
      [``, `Amina Hassan`, `Independent non-executive`, `Jun 2021`, `Approved`, `CBK/FP/2021/090`],
      [``, `Peter Njoroge`, `Non-executive (Kilele Assurance)`, `Apr 2018`, `Approved`, `CBK/FP/2018/066`],
      [``, `Lucy Wairimu`, `Non-executive (Kilele Assurance)`, `Apr 2022`, `Approved`, `CBK/FP/2022/048`],
      [``, `James Ndegwa`, `Non-executive (Ndegwa Family Holdings)`, `Jul 2016`, `Approved`, `CBK/FP/2016/101`],
      [``, `Robert Mwangi`, `Independent non-executive`, `Sep 2023`, `Approved`, `CBK/FP/2023/138`],
    ],
    boardBios: [
      [`Prof. Wanjiru Kamau`, `Economist; former deputy governor of a regional central bank; chairs two listed company boards.`],
      [`David Ochieng`, `Twenty-four years in banking, including eleven at a pan-African group in corporate and SME banking. CEO since 2019.`],
      [`Grace Mutua`, `Chartered accountant; previously CFO of a tier-two bank; promoted to the board on appointment as CFO in 2026.`],
      [`Samuel Kiprono`, `Former audit partner at a Big Four firm; chairs the Board Audit & Compliance Committee.`],
      [`Amina Hassan`, `Technology executive with fintech and payments experience; chairs the IT & Digital Committee.`],
    ],
    management: [
      [``, `David Ochieng`, `Managing Director & CEO`, `Jan 2019`, `Approved`, `CBK/FP/2018/287`],
      [``, `Grace Mutua`, `Chief Financial Officer`, `Feb 2026`, `Approved`, `CBK/FP/2026/031`],
      [``, `Michael Otieno`, `Chief Risk Officer`, `Mar 2020`, `Approved`, `CBK/FP/2020/029`],
      [``, `Esther Achieng`, `Head of SME Banking`, `Aug 2021`, `Approved`, `CBK/FP/2021/115`],
      [``, `Faith Chebet`, `Chief Compliance Officer & MLRO`, `May 2024`, `Approved`, `CBK/FP/2024/062`],
      [``, `John Kamande`, `Chief Internal Auditor`, `Jan 2018`, `Approved`, `CBK/FP/2017/244`],
    ],
    mgmtBios: [
      [`Michael Otieno`, `Eighteen years in credit and enterprise risk; previously head of credit at a regional bank. FRM certified.`],
      [`Esther Achieng`, `Built the bank's SME franchise; led the 2019–2024 DFI credit line and the Imara women-in-business launch.`],
      [`Faith Chebet`, `ACAMS-certified; nine years in financial crime compliance at two international banks.`],
      [`John Kamande`, `CIA and CPA; twenty years in internal audit, eight of them at the bank.`],
    ],
  },
  r5: {
    standing: {
      regulator: `Central Bank of Kenya`,
      licence: `Active and unrestricted; confirmed by the regulator in writing on 05 Aug 2026`,
      deposit: `Member of the Kenya Deposit Insurance Corporation; premiums current`,
      returns: `All statutory returns filed on time for the last eight quarters`,
      exam: `Joint on-site examination, Oct 2025; composite rating "Satisfactory"`,
      sanctions: `None in five years`,
      enforcement: `None. NPL remediation plan filed with the regulator in Feb 2026`,
      litigation: `Nine cases pending against the bank, none material (see part 12)`,
    },
    examRatings: [
      [``, `Satisfactory`], [``, `Satisfactory`], [``, `Satisfactory`], [``, `Satisfactory`],
      [``, `Fair`], [``, `Satisfactory`], [``, `Satisfactory (2)`],
    ],
  },
  r6: {
    capital: [
      P(`182`, `205`, `228`, `249`, `268`, `271`, `276`, `281`),
      P(`216`, `243`, `273`, `302`, `324`, `326`, `332`, `338`),
      P(`1,193`, `1,381`, `1,587`, `1,787`, `1,929`, `1,976`, `2,000`, `2,024`),
      P(`18.1%`, `17.6%`, `17.2%`, `16.9%`, `16.8%`, `16.5%`, `16.6%`, `16.7%`),
      P(`15.2%`, `14.8%`, `14.4%`, `14.1%`, `13.9%`, `13.7%`, `13.8%`, `13.9%`),
      P(`12.6%`, `12.3%`, `12.1%`, `12.0%`, `11.9%`, `11.8%`, `11.8%`, `11.9%`),
      P(`30%`, `30%`, `25%`, `25%`, `25%`, `—`, `—`, `—`),
      P(`3.9%`, `5.2%`, `6.4%`, `8.5%`, `11.8%`, `12.8%`, `11.8%`, `11.1%`),
    ],
    assetQuality: [
      P(`920`, `1,060`, `1,190`, `1,310`, `1,420`, `1,452`, `1,476`, `1,498`),
      P(`38.6`, `48.8`, `60.7`, `76.0`, `90.9`, `97.3`, `95.9`, `95.9`),
      P(`4.2%`, `4.6%`, `5.1%`, `5.8%`, `6.4%`, `6.7%`, `6.5%`, `6.4%`),
      P(`30.1`, `36.1`, `43.1`, `50.2`, `52.7`, `55.5`, `56.6`, `58.5`),
      P(`78%`, `74%`, `71%`, `66%`, `58%`, `57%`, `59%`, `61%`),
      P(`4.2`, `5.1`, `6.8`, `9.4`, `12.6`, `2.1`, `3.4`, `2.8`),
      P(`1.6%`, `1.9%`, `2.1%`, `2.8%`, `3.2%`, `3.4%`, `3.3%`, `3.1%`),
    ],
    profitability: [
      P(`26.8`, `29.5`, `32.4`, `37.1`, `41.9`, `10.8`, `11.3`, `11.8`),
      P(`2.2%`, `2.2%`, `2.1%`, `2.0%`, `1.9%`, `1.8%`, `1.8%`, `1.9%`),
      P(`15.9%`, `16.4%`, `17.2%`, `16.1%`, `15.4%`, `14.9%`, `15.0%`, `15.2%`),
      P(`6.8%`, `6.6%`, `6.4%`, `6.1%`, `5.8%`, `5.6%`, `5.5%`, `5.5%`),
      P(`54%`, `56%`, `58%`, `61%`, `62%`, `63%`, `62%`, `62%`),
      P(`24%`, `25%`, `25%`, `26%`, `26%`, `26%`, `27%`, `27%`),
    ],
    liquidity: [
      P(`400`, `438`, `473`, `512`, `576`, `566`, `585`, `600`),
      P(`1,314`, `1,472`, `1,608`, `1,724`, `1,820`, `1,838`, `1,868`, `1,896`),
      P(`n/r`, `n/r`, `n/r`, `128%`, `134%`, `131%`, `133%`, `136%`),
      P(`n/r`, `n/r`, `n/r`, `n/r`, `118%`, `117%`, `119%`, `121%`),
      P(`70%`, `72%`, `74%`, `76%`, `78%`, `79%`, `79%`, `79%`),
      P(`26%`, `25%`, `24%`, `23%`, `22%`, `22%`, `22%`, `21%`),
      P(`60`, `98`, `133`, `186`, `214`, `220`, `222`, `226`),
    ],
    marketRisk: [
      P(`5.6`, `7.0`, `8.7`, `11.5`, `13.3`, `14.3`, `13.9`, `13.5`),
      P(`2.6%`, `2.9%`, `3.2%`, `3.8%`, `4.1%`, `4.4%`, `4.2%`, `4.0%`),
      P(`8.1%`, `8.6%`, `9.2%`, `9.8%`, `10.4%`, `10.6%`, `10.5%`, `10.3%`),
      P(`6.8%`, `6.6%`, `6.4%`, `6.1%`, `5.8%`, `5.6%`, `5.5%`, `5.5%`),
      P(`6.2`, `7.8`, `9.4`, `11.9`, `10.6`, `2.4`, `2.6`, `2.9`),
      P(`−1.2`, `−1.5`, `−2.0`, `−2.8`, `−3.6`, `−1.0`, `−0.9`, `−0.8`),
    ],
    balance: [
      P(`1,460`, `1,680`, `1,890`, `2,080`, `2,400`, `2,440`, `2,480`, `2,520`),
      P(`920`, `1,060`, `1,190`, `1,310`, `1,420`, `1,452`, `1,476`, `1,498`),
      P(`400`, `438`, `473`, `512`, `576`, `566`, `585`, `600`),
      P(`1,314`, `1,472`, `1,608`, `1,724`, `1,820`, `1,838`, `1,868`, `1,896`),
      P(`60`, `98`, `133`, `186`, `214`, `220`, `222`, `226`),
      P(`184`, `207`, `229`, `250`, `286`, `288`, `293`, `300`),
    ],
    prudential: [
      P(`18.1%`, `17.6%`, `17.2%`, `16.9%`, `16.8%`, `16.5%`, `16.6%`, `16.7%`, `≥14.5%`),
      P(`15.2%`, `14.8%`, `14.4%`, `14.1%`, `13.9%`, `13.7%`, `13.8%`, `13.9%`, `≥10.5%`),
      P(`4.2%`, `4.6%`, `5.1%`, `5.8%`, `6.4%`, `6.7%`, `6.5%`, `6.4%`, `≤5.0%`),
      P(`78%`, `74%`, `71%`, `66%`, `58%`, `57%`, `59%`, `61%`, `Peer 70%`),
      P(`n/r`, `n/r`, `n/r`, `128%`, `134%`, `131%`, `133%`, `136%`, `≥100%`),
      P(`n/r`, `n/r`, `n/r`, `n/r`, `118%`, `117%`, `119%`, `121%`, `≥100%`),
      P(`70%`, `72%`, `74%`, `76%`, `78%`, `79%`, `79%`, `79%`, `≤85%`),
      P(`2.6%`, `2.9%`, `3.2%`, `3.8%`, `4.1%`, `4.4%`, `4.2%`, `4.0%`, `≤10%`),
      P(`172%`, `181%`, `188%`, `196%`, `204%`, `206%`, `203%`, `199%`, `≤200%`),
    ],
  },
  r7: {
    intRating: { score: `62 / 100`, grade: `4 — Moderate risk`, outlook: `Stable`, date: `13 Aug 2026`, model: `D&G Bank Scorecard v3 (CAMELS-based)` },
    intStrengths: [
      `Capital comfortably above the regulatory minimum, with high-quality CET1.`,
      `Stable, diversified deposit funding and an LCR well above 100%.`,
      `Strong SME franchise and a clean record on the prior DFI line.`,
    ],
    intConstraints: [
      `NPL ratio above the regulatory ceiling, with provision coverage below peers.`,
      `Concentration in agri-processing within the SME book.`,
      `Thin E&S and green appraisal capacity.`,
    ],
    assigned: { agency: `Global Credit Rating Co.`, rating: `B+ (long-term, international scale)`, outlook: `Stable`, date: `18 Mar 2026` },
    detail: {
      exercise: `Annual surveillance review`, national: `A(KE) long-term / A1(KE) short-term`,
      prior: `B+ / stable (Mar 2025)`, sovereign: `Kenya B- / stable; the bank is rated above the sovereign on its standalone profile`,
    },
    strengths: [
      `Established franchise in SME and mid-corporate banking.`,
      `Sound capitalisation and liquidity buffers.`,
      `Consistent profitability through the rate cycle.`,
    ],
    constraints: [
      `Asset quality pressure from agriculture exposures.`,
      `Operating environment and sovereign credit weakness.`,
      `Moderate concentration in the top 20 borrowers.`,
    ],
    extraRatings: [
      {
        assigned: { agency: `Bloomfield Investment Corporation`, rating: `A- (national scale, long-term)`, outlook: `Stable`, date: `02 May 2026` },
        detail: { exercise: `Initial rating`, national: `A- (KE) long-term / A2 (KE) short-term`, prior: `Not previously rated`, sovereign: `Not applied on the national scale` },
        strengths: [`Good funding stability with a granular retail deposit base.`, `Experienced management team with low turnover.`],
        constraints: [`Rising cost-to-income ratio.`, `NPLs above the regulatory limit.`],
      },
    ],
  },
  r8: {
    governance: [
      [``, `5 directors, 3 independent`, `Samuel Kiprono (INED)`, `Quarterly`, `Board`],
      [``, `5 directors, 2 independent`, `Peter Njoroge (NED)`, `Monthly`, `Board`],
      [``, `CEO, CRO, CFO, CCO, business heads`, `CEO`, `Monthly`, `Board Risk Committee`],
      [``, `CEO, CRO, Head of Credit, business heads`, `CRO`, `Weekly`, `Board Credit Committee`],
      [``, `CEO, CFO, Treasurer, CRO`, `CFO`, `Monthly`, `Board Risk Committee`],
    ],
    staffing: [
      [``, `12`, `Head of Credit Risk (16 yrs); 7 analysts with CFA, ACCA or MBA qualifications.`],
      [``, `2`, `Market risk manager (FRM); one analyst. Thin for the trading book.`],
      [``, `7`, `Head of Operational Risk (CISA); BCP coordinator; five officers.`],
      [``, `2`, `E&S officer (IFC-trained, 2025); one assistant.`],
      [``, `26`, `Unit headed by the CRO (FRM, 18 years' experience).`],
    ],
    policies: [
      [``, `Board`, `Jan 2026`, `Jan 2027`], [``, `Board`, `Jan 2026`, `Jan 2027`],
      [``, `Board`, `Mar 2025`, `Mar 2027`], [``, `Board Risk Committee`, `Jun 2025`, `Jun 2026`],
      [``, `Board Risk Committee`, `Sep 2025`, `Sep 2026`], [``, `Board Risk Committee`, `Jun 2022`, `Overdue`],
      [``, `Board`, `Nov 2024`, `Nov 2026`],
    ],
    adoption: [
      [`Credit policy manual`, `Comprehensive and aligned to the SME risk profile.`, `Twelve of 15 sampled files compliant; monthly credit risk report to the committee.`],
      [`Stress testing framework`, `Scenarios outdated; last approved 2022.`, `Annual stress test run in Dec 2025, but on the old scenarios.`],
      [`ESMS`, `Adequate on paper.`, `Not yet applied: four of six sampled files had no screening form.`],
    ],
    models: [
      [`SME credit scorecard`, `SME loans below ₦500k`, `In-house`, `Not validated`, `Approval and pricing; overrides permitted with credit committee sign-off.`],
      [`IFRS 9 ECL model`, `Whole loan book`, `In-house`, `Audited Dec 2025`, `Quarterly provisioning; reviewed by the external auditor but not independently validated.`],
      [`Corporate rating model`, `Corporate loans`, `Vendor`, `Mar 2024`, `Approval authority and limit setting.`],
    ],
  },
  r9: {
    policies: [
      [``, `Board`, `Feb 2025`, `Feb 2027`],
      [``, `Board Audit Committee`, `Dec 2025`, `Dec 2026`],
      [`Audit committee charter`, `Board`, `Feb 2025`, `Feb 2027`],
    ],
    evidence: [
      `The internal audit policy follows the IIA standards and is reviewed every two years.`,
      `The FY2025 plan was 92% delivered; the two deferred audits were rolled into the FY2026 plan.`,
      `Quarterly reports to the Board Audit Committee track open findings by owner and due date.`,
    ],
    staffing: [
      [``, `5`, `Branch audit team; two CIA, three ACCA.`],
      [``, `3`, `Treasury and financial audit; two CPA.`],
      [``, `1`, `IT auditor (CISA). Single point of dependency.`],
      [``, `3`, `Compliance and investigations; one CFE.`],
      [``, `2`, `CIA (CPA, CIA) and a QA officer.`],
      [``, `14`, `Nine of 14 staff professionally qualified.`],
    ],
  },
  r10: {
    governance: [
      [``, `4 directors, 3 independent`, `Samuel Kiprono (INED)`, `Quarterly`, `Board`],
      [``, `CEO, CRO, CFO, CCO, business heads`, `CEO`, `Monthly`, `Board Risk Committee`],
      [``, `14 FTE in 5 teams`, `Faith Chebet (CCO)`, `—`, `Board Audit & Compliance Committee`],
      [``, `3 FTE`, `Faith Chebet (MLRO)`, `—`, `Committee chair (direct line)`],
    ],
    policies: [
      [``, `Board`, `Mar 2026`, `Mar 2027`], [``, `Board`, `Feb 2026`, `Feb 2027`],
      [``, `Board`, `Jun 2025`, `Jun 2027`], [``, `Board`, `Jun 2025`, `Jun 2027`],
    ],
    adoption: [
      [`AML/CFT policy suite`, `Tailored to cash-intensive trade and agriculture customers.`, `Twelve KYC files sampled, all compliant; monthly MI to the committee.`],
      [`Whistle-blowing policy`, `Externally hosted hotline.`, `Four reports in FY2025, each investigated and closed.`],
    ],
    models: [
      [`Sanctions screening`, `All customers and payments`, `Vendor`, `Jan 2026`, `Real-time payment blocking; hits reviewed within 24 hours.`],
      [`Customer risk rating`, `All customers`, `In-house`, `Feb 2026`, `Sets EDD and the periodic review cycle.`],
      [`Transaction monitoring`, `All accounts`, `Vendor`, `Sep 2025`, `Alerts triaged by the TM team; STRs filed by the MLRO. Tuning rationale not yet documented.`],
    ],
    staffing: [
      [``, `4`, `KYC officers; two ACAMS.`], [``, `4`, `TM analysts; one CAMS.`],
      [``, `2`, `Screening analysts.`], [``, `2`, `Regulatory compliance and training.`],
      [``, `2`, `CCO and MLRO (CAMS, nine years' experience).`], [``, `14`, `Unit grown from 9 FTE in 2024.`],
    ],
  },
  r11: {
    capacity: {
      track: `₦16.4m green portfolio across 74 sub-loans since 2022, mainly commercial solar and cold chain`,
      tagging: `Loan-level green tag in core banking since 2024; quarterly Risk review of tags`,
      ta: `Green technical appraisal, impact measurement and E&S file controls`,
    },
    sectors: [
      [``, `284`, `20.0%`], [``, `214`, `15.1%`], [``, `241`, `17.0%`], [``, `156`, `11.0%`],
      [``, `57`, `4.0%`], [``, `71`, `5.0%`], [``, `113`, `8.0%`], [``, `284`, `20.0%`],
      [``, `1,420`, `100%`],
    ],
    outcome: [
      [``, `16.4`, `40.4`], [``, `1.2%`, `2.6%`], [``, `74`, `190`],
      [``, `3,100`, `8,400`], [``, `4.2`, `11.5`], [``, `2.9`, `7.8`],
    ],
    products: [
      [`Solar for Business`, `₦18m by 2028`, `Finances rooftop solar for SME premises, which cuts energy costs and emissions.`],
      [`Efficiency Equipment Loan`, `₦8m by 2028`, `Replaces old machinery with efficient models, measured by energy saved.`],
      [`Cold Chain Finance`, `₦10m by 2028`, `Solar-powered cold storage for agri-SMEs, reducing post-harvest loss; many borrowers are women-owned.`],
      [`Small Hydro`, `₦5m by 2028`, `Run-of-river projects below 1 MW with full E&S review.`],
    ],
    pipeline: [
      [`Commercial & industrial solar`, `21`, `7.8`, `Rooftop solar for a Nakuru dairy (₦0.6m); a Thika printing works (₦0.4m)`],
      [`Cold chain & storage`, `11`, `4.2`, `Solar cold rooms for horticulture exporters in Meru`],
      [`Energy-efficient equipment`, `6`, `2.6`, `Efficient boilers for a Mombasa food processor`],
    ],
  },
  r12: {
    overview: {
      sources: `Litigation schedule, external counsel letters (2), court registry search on 06 Aug 2026`,
      against: `Nine cases, ₦6.8m claimed in total`,
      byBank: `41 recovery actions, ₦38.2m claimed`,
      regulatory: `None`,
      materiality: `No single case exceeds 0.5% of equity`,
      impact: `None on capacity to enter into or perform under the facility`,
    },
    casesAgainst: [
      [``, `Kamau Traders v MTB, High Court Nairobi`, `Wrongful debit and damages`, `2.4`, `Hearing Nov 2026; counsel rates the risk as possible.`, `0.8`],
      [``, `Former employee, Employment Court`, `Unfair dismissal`, `0.6`, `Counsel rates the risk as remote.`, `0.1`],
      [``, `Landlord, Mombasa branch`, `Lease dispute`, `0.9`, `In mediation; counsel rates the risk as remote.`, `0.2`],
    ],
    casesBy: [
      [``, `Rift Agro Processors Ltd, Commercial Court`, `Recovery of a term loan`, `17.1`, `Judgment entered Jun 2026; realisation of security under way.`],
      [``, `Lakeside Mills Ltd, Commercial Court`, `Recovery of loan and overdraft`, `12.3`, `Judgment expected Q4 2026.`],
    ],
    assessment: [
      `Contingent exposure is small and adequately provisioned.`,
      `The recovery actions against the two agri-processing borrowers match the NPL analysis in part 6.`,
      `No litigation restricts the bank's capacity to borrow or to grant the negative pledge.`,
    ],
  },
  r13: {
    risks: [
      [``, `Asset quality: NPLs of 6.4% are above the regulatory ceiling and coverage is low.`, `Covenant to restore coverage to at least 70% within 12 months; quarterly NPL reporting; remediation plan monitored at the annual review.`],
      [``, `E&S: the ESMS is not yet applied in credit files.`, `CP to embed E&S screening in the credit workflow; ESMS remediation check after six months; TA support.`],
      [``, `Green eligibility: thin technical appraisal and verification.`, `External technical review for green sub-loans above ₦1m; sample verification at each on-site visit.`],
      [``, `Concentration: agri-processing is 18% of the SME book.`, `Sub-loan sector limit of 25% of the facility for agriculture.`],
    ],
  },
  r14: {
    terms: [
      [``, `Senior unsecured term loan`],
      [``, `₦60m`],
      [``, `Seven years, with an availability period of 24 months from signing`],
      [``, `Fixed at the D&G cost of funds plus 3.85%, reset annually`],
      [``, `Two-year grace period, then ten equal semi-annual instalments`],
      [``, `On-lending to women-owned SMEs (at least 60%) and eligible green investments (at least 40%)`],
      [``, `Maximum ₦1.5m per sub-loan; tenor up to 60 months; no more than 25% of the facility in agriculture`],
      [``, `Unsecured; ranks pari passu with other senior obligations; negative pledge`],
      [``, `Foreign borrowing registration (Form FX-12); written allocation of facility-monitoring accountability; board resolution authorising the facility`],
      [``, `Quarterly utilisation, portfolio-quality and impact reports; annual audited accounts within 120 days`],
    ],
  },
  r15: {
    rag: [
      [``, ``, `Green`, `Licence and ownership fully verified.`],
      [``, ``, `Green`, `Effective board; open evaluation actions tracked.`],
      [``, ``, `Amber`, `NPL ceiling breach; remediation plan filed with the regulator.`],
      [``, ``, `Amber`, `Coverage covenant and quarterly monitoring.`],
      [``, ``, `Green`, `Agency and internal ratings consistent.`],
      [``, ``, `Amber`, `Stress testing framework re-approval and model validation by Q1 2027.`],
      [``, ``, `Green`, `External quality assessment scheduled for Q1 2027.`],
      [``, ``, `Green`, `Tuning documentation due Nov 2026.`],
      [``, ``, `Amber`, `ESMS condition precedent and TA programme.`],
      [``, ``, `Green`, `No material matters.`],
    ],
    overall: `Meridian is a sound partner for the credit line. Its asset quality and E&S weaknesses can be addressed through the proposed conditions, covenants and technical assistance. The overall assessment is Satisfactory, with a recommendation to approve with conditions.`,
  },
  r16: {
    financial: [
      [``, `≥15.5%`, `16.7%`], [``, `≤7.0%, falling to ≤5.0% by Dec 2027`, `6.4%`],
      [``, `≥70% within 12 months`, `61%`], [``, `≥20% liquid assets / deposits`, `31.6%`],
      [``, `≥40% of facility outstanding`, `n/a (pre-disbursement)`], [``, `≥60% of facility outstanding`, `n/a (pre-disbursement)`],
    ],
    programme: [
      [``, `Proceeds used only for eligible sub-loans; unused balances held in a designated account.`],
      [``, `Apply the ESMS to every sub-loan; report serious incidents within five working days.`],
      [``, `No financing of activities on the D&G Exclusion List.`],
      [``, `Quarterly sex-disaggregated and green impact reporting in the D&G format.`],
      [``, `D&G and its auditors may inspect the books and sub-borrower files on ten days' notice.`],
    ],
    monitoring: [
      [``, `Quarterly`, `Portfolio manager reviews the compliance certificate.`],
      [``, `Semi-annual`, `Impact team review of utilisation and impact data.`],
      [``, `Annual`, `Credit analyst; full refresh of this assessment.`],
      [``, `Annual`, `Portfolio manager and E&S specialist; sample of ten sub-borrowers.`],
      [``, `Six months after first disbursement`, `E&S specialist; confirms the ESMS remediation is in place.`],
    ],
    signoff: [
      [``, `A. Mensah`, `14 Aug 2026`],
      [``, `M. Otieno`, `Pending`],
      [``, `D. Ochieng`, `Pending`],
    ],
  },
};

const ANNEX_STATUS = {
  'Green pipeline schedule': [`Outstanding`, ``, `Sample files due 22 Aug`],
  'Most recent external Board evaluation or assessment report.': [`Outstanding`, ``, `Report expected after the Sep board`],
  'Policy and plans for achieving net-zero emissions.': [`N/A`, ``, `No net-zero plan adopted yet; noted under S13`],
  'Environmental and Social Risk Management Policies and Manuals.': [`Received`, `08 Aug 2026`, `DR/09/ESMS`],
  'External Rating reports by rating agencies.': [`Received`, `06 Aug 2026`, `DR/07/RATING`],
};

const RESHAPED = [`capital`, `assetQuality`, `profitability`];
const empty = (v) => v == null || (typeof v === `string` && v.trim() === ``);
const rowEmpty = (r) => !Array.isArray(r) || r.every(empty);

function fillObj(cur, src) {
  Object.keys(src).forEach((k) => { if (empty(cur[k])) cur[k] = src[k]; });
}

function fillReport(rep) {
  Object.keys(REPORT).forEach((pid) => {
    const part = rep[pid] || (rep[pid] = {});
    const src = REPORT[pid];
    Object.keys(src).forEach((bid) => {
      const val = src[bid];
      const cur = part[bid];
      if (bid === `extraRatings`) {
        if (!Array.isArray(cur) || !cur.length) part[bid] = JSON.parse(JSON.stringify(val));
        return;
      }
      if (typeof val === `string`) { if (empty(cur)) part[bid] = val; return; }
      if (!Array.isArray(val)) { if (!cur || typeof cur !== `object`) part[bid] = {}; fillObj(part[bid], val); return; }
      if (typeof val[0] === `string`) {
        if (!Array.isArray(cur) || cur.every(empty)) part[bid] = val.slice();
        return;
      }
      // grid: fill cell-by-cell when the shapes line up, otherwise replace a blank grid
      const reshaped = RESHAPED.indexOf(bid) >= 0 && (!Array.isArray(cur) || cur.length !== val.length);
      if (reshaped || !Array.isArray(cur) || cur.every(rowEmpty)) { part[bid] = val.map((r) => r.slice()); return; }
      val.forEach((r, ri) => {
        if (!cur[ri]) { cur[ri] = r.slice(); return; }
        r.forEach((x, ci) => { if (empty(cur[ri][ci]) && !empty(x)) cur[ri][ci] = x; });
      });
    });
  });
  const mr = rep.r6 && rep.r6.marketRisk;
  if (Array.isArray(mr) && mr[5] && String(mr[5][1] || '').startsWith('+')) mr[5] = REPORT.r6.marketRisk[5].slice();
  const docs = rep.annexA && rep.annexA.docs;
  if (Array.isArray(docs)) {
    docs.forEach((row, i) => {
      if (!Array.isArray(row) || !empty(row[2])) return;
      const set = ANNEX_STATUS[row[1]] || [`Received`, `0${1 + (i % 9)} Aug 2026`, `DR/${String(i + 1).padStart(2, `0`)}`];
      row[2] = set[0]; if (empty(row[3])) row[3] = set[1]; if (empty(row[4])) row[4] = set[2];
    });
  }
}

export function fillMeridian(c, sections) {
  if (!c || c.demoFill >= MERIDIAN_FILL_VERSION) return c;
  (c.sections || []).forEach((s) => {
    const meta = SECTION_META[s.code] || {};
    if (empty(s.assessor) && meta.assessor) s.assessor = meta.assessor;
    if (empty(s.dateCompleted) && meta.date) s.dateCompleted = meta.date;
    if (s.rating == null && meta.rating != null) s.rating = meta.rating;
    if (empty(s.rationale) && meta.rationale) s.rationale = meta.rationale;
    const txt = SECTION_TEXT[s.code];
    if (txt) {
      if (txt.management && empty(s.management)) s.management = txt.management;
      if (txt.evidence && empty(s.evidence)) s.evidence = txt.evidence;
    }
    const qs = QUESTIONS[s.code] || {};
    (s.questions || []).forEach((q) => {
      const v = qs[q.num];
      // S8's enquiries were renumbered after the first demo text was written; replace it outright
      if (v && (s.code === `S8` || empty(q.finding))) {
        q.status = v[0]; q.finding = v[1]; q.notes = v[2] || q.notes || ``; q.redFlag = !!v[3];
        if (v[4] != null) q.rating = v[4];
      }
      if (q.rating == null && s.rating != null && !empty(q.finding)) q.rating = q.redFlag ? 4 : s.rating;
      if (q.status === `Not started` && !empty(q.finding)) q.status = IP;
    });
    if (s.rating == null && s.weight && (s.questions || []).length) s.rating = 3;
    const tmpl = Array.isArray(sections) ? sections.find((t) => t.code === s.code) : null;
    if (tmpl && Array.isArray(tmpl.requiredDocs)) {
      if (!s.docChecks) s.docChecks = {};
      const out = OUTSTANDING_DOCS[s.code] || [];
      tmpl.requiredDocs.forEach((d) => {
        if (out.indexOf(d) < 0 && !(s.docWaivers && s.docWaivers[d]) && s.docChecks[d] == null) s.docChecks[d] = true;
      });
    }
  });
  if (c.report) fillReport(c.report);
  c.demoFill = MERIDIAN_FILL_VERSION;
  return c;
}
