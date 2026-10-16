// Denham & Grey — DD Portal: template content and demo data.
// Section, ratio, profile and eligibility definitions are the portal's seed
// template (mirrors seed_data.py). Case content below is demonstration data.

import { blankReport as blankReportData } from './dd-report-spec.js';
export { fillMeridian } from './dd-demo-meridian.js';

export const SECTIONS = [
  {
    code: `S1`, label: `Executive summary`, weight: 0, narrative: true, report: `r1`, noManagement: true,
    title: `1. Executive Summary and Recommendation`,
    objective: `One page maximum. State the institution, the request, the outcome and the conditions. The summary table is the report's at-a-glance RAG view of every assessment area.`,
    questions: [],
    flags: [
      `The recommendation is not supported by the flags recorded against the assessment areas.`,
      `Conditions precedent relied on elsewhere in the report are absent from the summary.`,
    ],
  },
  {
    code: `S2`, label: `Introduction & scope`, weight: 0, narrative: true, report: `r2`, noRecord: true,
    title: `2. Introduction, Objectives and Scope`,
    objective: `Programme context, what triggered the due diligence, the objectives, the team and the methodology.`,
    questions: [],
    flags: [
      `Scope excludes an area the programme requires to be assessed.`,
      `Questionnaire responses were accepted without documentary testing.`,
    ],
  },
  {
    code: `S3`, label: `Licensing`, weight: 0.05, report: `r3`, reportBlocks: [`shareholders`],
    title: `3. Legal Status, Licensing and Regulatory Standing`,
    objective: `Confirm the bank is duly licensed, in good regulatory standing, and legally able to borrow and onlend under the proposed structure.`,
    requiredDocs: [
      `Certificate of incorporation and constitutional documents`,
      `Banking licence and any licence conditions`,
      `Regulator good-standing / no-objection letter`,
      `Share register and UBO declarations`,
      `Group structure chart`,
      `Board resolution authorising borrowing and onlending`,
      `Last regulatory examination report and management response`,
      `Evidence of statutory returns and remittances`,
    ],
    questions: [
      `Incorporation details: legal form, country and date of incorporation, registered number and registered office; confirm against the companies registry.`,
      `Verify banking licence: scope, conditions, validity; confirm directly with the regulator's public register where possible.`,
      `Confirm corporate existence, constitutional documents, and that borrowing from foreign/wholesale lenders and onlending are within corporate powers and licence scope.`,
      `Branch network and staff: branches, agency outlets and other service points, geographic coverage, and total staff with the recent trend.`,
      `Market position: ranking and market share, franchise strength in the segments relevant to the facility, and any external rating.`,
      `Business model: core segments, funding model and revenue drivers; how the proposed facility fits the way the bank makes money.`,
      `Regulatory standing: any enforcement actions, fines, directives, licence restrictions, or corrective action plans (last 5 years).`,
      `Compliance with prudential requirements: capital adequacy, single obligor limits, related-party exposure limits, reserve requirements, open FX position limits.`,
      `Any regulator intervention history (administration, restructuring, forbearance) affecting the bank or its group.`,
      `Exchange-control / central bank approvals required for the facility (foreign borrowing registration, withholding tax, repatriation).`,
      `Deposit insurance membership and standing (if applicable).`,
    ],
    flags: [
      `Licence conditions restricting wholesale borrowing or the target lending segments.`,
      `Recent or unresolved regulatory enforcement, or repeated breaches of prudential ratios.`,
      `Pending approvals critical to the facility treated as a formality.`,
    ],
  },
  {
    code: `S4`, label: `Governance`, weight: 0.10, report: `r4`,
    title: `4. Governance and Management`,
    objective: `Establish that governance is effective and that management is competent and stable. The board and management appointment tables and the regulatory-approval records are completed below.`,
    requiredDocs: [
      `Board and committee charters`,
      `Board and committee meeting minutes (last four quarters)`,
      `Board and senior management CVs`,
      `Regulatory approval letters for directors and key officers`,
      `Organogram (board and executive)`,
      `Board evaluation report`,
      `Related-party transactions register`,
      `Succession plan or policy`,
    ],
    questions: [
      `Board composition: size, independence, relevant skills and gender diversity; whether the mix on the board is capable of overseeing a facility of this size.`,
      `Board committees: which committees exist, their charters, membership and chairs, and whether each holds the authority its charter claims.`,
      `Meeting cadence: how often the board and each committee met over the last two years, attendance rates, and the quality of papers and minutes.`,
      `Board evaluation: whether an evaluation has been carried out, by whom, and what came of its recommendations.`,
      `Fit-and-proper status of directors and senior management; regulatory approvals of appointments.`,
      `Senior management team: experience, tenure, succession planning, key-person dependencies.`,
      `Senior management turnover over the last 24 months: departures, the positions affected, reasons given, and any vacancy still open.`,
      `Related-party lending and transactions: volume, terms, approval process, and compliance with limits.`,
      `Quality of internal audit: independence, reporting line to the audit committee, coverage plan, follow-up on findings.`,
      `Shareholder support: capacity and track record of injecting capital when needed; any shareholder agreements affecting control.`,
      `Organisational structure and clarity of accountability for the units that will manage the onlending facility.`,
    ],
    flags: [
      `Dominant shareholder-manager with weak board oversight; committees that meet only on paper.`,
      `High senior management turnover, particularly in the control functions.`,
      `Significant related-party lending on non-commercial terms.`,
    ],
  },
  {
    code: `S5`, label: `Strategy`, weight: 0.05,
    title: `5. Strategy, Business Model and Market Position`,
    objective: `Understand how the bank makes money, its competitive position, and whether the proposed facility fits its strategy.`,
    requiredDocs: [
      `Board-approved strategic plan and business plan`,
      `Latest budget and financial projections`,
      `Market share / sector statistics used by management`,
      `Product programme documents for target segments`,
      `Latest management accounts pack`,
    ],
    questions: [
      `Business model: core segments (corporate, SME, retail, micro), funding model, and revenue drivers.`,
      `Competitive and macro context: sector concentration, FX regime, interest rate environment, and effects on the target portfolio.`,
      `Market position: market share, ranking, franchise strength in the segments relevant to the facility.`,
      `Strategic plan: credibility of growth targets; whether lending to women-owned businesses and/or green transactions features in board-approved strategy.`,
      `Track record of executing prior strategies and of managing prior credit lines from DFIs or wholesale lenders.`,
    ],
    flags: [
      `Facility would fund a segment the bank has never served, with no credible build-out plan.`,
      `History of low utilisation or covenant breaches on previous credit lines.`,
    ],
  },
  {
    code: `S6`, label: `Financials`, weight: 0.20, report: `r6`,
    title: `6. Financial Soundness (CAMELS-Based Analysis)`,
    objective: `Assess capital adequacy, asset quality, management of financial risk, earnings, liquidity and market-risk sensitivity using 5 years of audited statements plus the latest three quarters and prudential returns. Complete the ratio grid on the scoring page and the report's financial analysis tables below.`,
    requiredDocs: [
      `Audited financial statements (five years, with notes)`,
      `Auditor management letters (three years)`,
      `Latest interim financial statements`,
      `Prudential returns to the regulator (latest four quarters)`,
      `Capital adequacy computation and capital plan`,
      `Loan classification and provisioning schedule`,
      `Liquidity and funding profile / maturity gap report`,
      `FX and interest-rate position report`,
    ],
    questions: [
      `Capital: assess the capital grid above — quality of capital (share of CET1), headroom above the regulatory minimum, dividend policy, capital plan for projected growth, stress capacity.`,
      `Asset quality: assess the grid above — NPL trend and drivers, concentrations, collateral practice, write-off policy, restructured book, provisioning adequacy. Sample-test loan classification if access allows.`,
      `Earnings: assess the profitability grid above — sustainability and diversification, reliance on volatile items, and the trend in pre-provision operating profit.`,
      `Liquidity and funding: assess the grid above — deposit concentration, tenor mismatch, contingency funding plan, unencumbered liquid assets, access to interbank/central bank facilities.`,
      `Market risk: assess the sensitivity grid above — interest rate repricing gaps, FX position, and the currency match between the facility and onlending (who carries FX risk and how hedged).`,
      `Audit quality: auditor reputation, opinions (qualifications, going-concern references), significant adjustments, management letter issues.`,
      `Projections: review financial projections for the facility period; test key assumptions for realism.`,
      `Balance sheet assessment: assess the balance sheet above — asset growth and mix, loan and deposit trend, funding structure and equity — and state whether the structure supports the facility.`,
      `Prudential ratios review: assess the returns above against regulatory minima and peers — headroom, breaches, direction of travel, and any ratio close to its limit.`,
    ],
    flags: [
      `CAR at or near the regulatory floor with aggressive growth plans.`,
      `Rapid loan growth combined with declining NPLs — possible under-recognition.`,
      `High depositor or borrower concentration; large unhedged FX mismatch.`,
      `Qualified audit opinions or persistent management letter findings.`,
    ],
  },
  {
    code: `S7`, label: `Risk Mgmt`, weight: 0.10, report: `r8`,
    title: `7. Risk Management, Credit Process and Internal Controls`,
    objective: `Confirm the bank can originate and manage sub-loans of the intended type with sound underwriting, monitoring and problem-loan management. The governance, policy, adoption, model and staffing tables are completed with their lines of enquiry.`,
    requiredDocs: [
      `Board-approved risk management framework and policy set`,
      `Risk appetite statement`,
      `Credit policy and credit manual`,
      `Enterprise risk management policy`,
      `Operational risk and business continuity (BCP) policy`,
      `Environmental and social management system (ESMS) policy`,
      `Board risk management reports (last three quarters)`,
      `Management credit risk committee reports (last three months)`,
      `Risk organogram and staffing schedule`,
      `Risk model documentation and latest validation report`,
      `Portfolio monitoring / watchlist reports`,
      `Delinquency and recovery reports`,
    ],
    questions: [
      `Risk governance structure: board risk committee, management-level risk committee and the risk department itself — composition, chairs, meeting frequency, reporting lines and CRO independence.`,
      `Approved policies: the board-approved risk policy set, the approving authority for each, when it was last approved and when it is next due for review.`,
      `Quality of policies, reporting and adoption: whether the policies fit the bank's risk profile, what risk reporting they produce for the board, and the evidence they operate in practice.`,
      `Risk models: existence, quality and usage of risk models — scorecards, rating and provisioning (ECL) models, stress testing — how each was built, when it was last validated and how output is used in decisions.`,
      `Risk management staffing: unit structure, head and headcount of each risk unit, and whether resourcing matches the risk profile.`,
      `Credit policy and underwriting: approval authorities, SME credit analysis standards, collateral policy, pricing methodology, exception tracking.`,
      `Portfolio monitoring: early-warning systems, watchlist process, portfolio review quality, segment-level analytics.`,
      `Problem loan management: collections and workout capacity, restructuring standards, recovery track record.`,
      `Operational risk and internal control: segregation of duties, fraud incidents (last 3 years) and remediation, insurance, BCP/DR testing.`,
      `Cybersecurity: governance, recent penetration testing/incidents, protection of customer data.`,
      `Review a sample of SME credit files for adherence to policy ([10-20] files across performing and non-performing).`,
    ],
    flags: [
      `Credit decisions concentrated in one individual; frequent undocumented policy exceptions.`,
      `No early-warning framework; problem loans managed by originating officers.`,
      `Material unresolved fraud or cyber incidents.`,
    ],
  },
  {
    code: `S8`, label: `AML/CFT`, weight: 0.10, report: `r10`,
    title: `8. AML/CFT, Sanctions and Financial Crime Compliance`,
    objective: `Establish that the financial crime framework meets institutional requirements and international standards (FATF; Wolfsberg) so facility proceeds cannot be misused. The governance, policy, adoption, screening-model and staffing tables are completed with their lines of enquiry. NOTE: any sanctions/integrity red flag here is an automatic decline trigger.`,
    requiredDocs: [
      `Board-approved AML/CFT and financial crime policy suite`,
      `KYC/CDD procedures and customer risk-rating methodology`,
      `Wolfsberg CBDDQ (completed and signed)`,
      `MLRO appointment letter and compliance organogram`,
      `Enterprise-wide AML/CFT risk assessment`,
      `Independent AML/CFT audit or testing report`,
      `Screening and transaction monitoring system documentation and last tuning/validation`,
      `STR/CTR filing log and statutory AML returns`,
      `Training plan, curriculum and attendance records`,
      `Last AML/CFT inspection report and management response`,
    ],
    questions: [
      `AML/CFT governance structure: board and management committees with financial crime oversight, the compliance/MLRO function itself — composition, chairs, meeting frequency, reporting lines and MLRO independence.`,
      `Approved policies: the board-approved financial crime policy set, the approving authority for each, when it was last approved and when it is next due for review.`,
      `Quality of policies, reporting and adoption: whether the policies fit the bank’s customer and product risk profile, what compliance reporting they produce for the board, and the evidence they operate in practice.`,
      `AML/CFT screening tools and models: screening, customer risk-rating and transaction monitoring systems — how each was built or sourced, list coverage and matching logic, when it was last tuned or validated and how output is used in decisions.`,
      `AML/CFT staffing: unit structure, headcount of each compliance unit, and whether experience and qualifications match the risk profile.`,
      `Regulatory reporting: statutory AML/CFT returns and STR/CTR filings — completeness, timeliness, sign-off and any queries raised by the regulator or FIU.`,
      `Training, awareness and capacity building: induction and annual AML/CFT training, role-specific training for front office, compliance and audit staff, board and senior management awareness, attendance records and testing of understanding.`,
      `KYC/CDD standards: identification and verification, beneficial ownership, EDD for high-risk customers and PEPs, ongoing monitoring.`,
      `Sanctions compliance: screening lists used (UN, OFAC, EU, UK, local), tools, frequency, fuzzy matching, escalation of hits.`,
      `Transaction monitoring: systems, alert handling, STR volumes and quality, record-keeping.`,
      `Regulatory history: AML/CFT inspection findings, penalties or warnings (last 5 years); remediation status.`,
      `Correspondent relationships: any loss/termination and reasons; Wolfsberg CBDDQ obtained.`,
      `Country context: FATF status of jurisdiction and implications; relevant national risk assessment findings.`,
      `Anti-bribery and corruption: policy, gifts/hospitality controls, whistleblowing, any corruption-related investigations.`,
      `Screen the bank, UBOs, directors and senior management against sanctions, watchlists and adverse media (record tool, date, results).`,
    ],
    flags: [
      `Sanctions or watchlist hits on the bank, its owners or managers; substantive adverse media.`,
      `AML penalties with incomplete remediation; loss of correspondent relationships.`,
      `Compliance function under-resourced or lacking independence.`,
    ],
  },
  {
    code: `S9`, label: `ESG`, weight: 0.05,
    title: `9. Environmental and Social Risk Management (ESMS)`,
    objective: `Assess capacity to identify and manage E&S risk consistent with the applicable framework, and ability to apply the facility's exclusion list. The assessment is recorded against the lines of enquiry below.`,
    requiredDocs: [
      `E&S policy and ESMS manual`,
      `E&S procedures embedded in the credit cycle`,
      `Exclusion list and screening evidence`,
      `Approved product paper for each green product`,
      `E&S officer appointment and training records`,
      `Sample screened sub-loan files with E&S categorisation`,
      `HR policies, OHS policy and GBVH safeguarding policy`,
      `Grievance mechanism procedure and log`,
    ],
    questions: [
      `E&S policy and ESMS: board-approved policy, procedures integrated into the credit cycle, designated trained E&S officer(s).`,
      `Application of an exclusion list: existing list vs. the institution's exclusion list; screening process at origination.`,
      `E&S risk categorisation of the current portfolio: exposure to high-risk sectors.`,
      `Compliance with national environmental and labour law: verification of clients' permits and labour standards.`,
      `Grievance mechanism and track record of E&S incidents; campaigns or community complaints involving clients.`,
      `Internal human resources and workplace standards: HR policies, equal opportunity and non-discrimination, occupational health and safety, and GBVH safeguarding.`,
      `Climate risk: assessment of physical and transition risk; high-carbon exposure and phase-out commitments.`,
      `Reporting capacity: ability to provide periodic E&S reports in the required format.`,
    ],
    flags: [
      `No functioning ESMS where the portfolio includes high-risk sectors.`,
      `Financing of excluded activities; unresolved serious E&S incidents.`,
      `ESMS exists on paper only — no evidence of use in credit files.`,
    ],
  },
  {
    code: `S10`, label: `IT/MIS`, weight: 0.05,
    title: `10. IT Systems, MIS and Reporting Capability`,
    objective: `Confirm the bank can tag, track and report use of proceeds — including sex-disaggregated and green-tagged data — reliably and on time.`,
    requiredDocs: [
      `Core banking system documentation and vendor contract`,
      `MIS report samples (portfolio, segment and green tagging)`,
      `Data quality and reconciliation controls description`,
      `IT policy, information security policy and access controls`,
      `BCP/DR plan and latest test report`,
      `Cybersecurity assessment or penetration test report`,
    ],
    questions: [
      `Core banking system: platform, stability, ability to flag/tag sub-loans by borrower gender-ownership status and green category.`,
      `Data quality: sex-disaggregated borrower data capture; segment coding accuracy; reconciliation controls.`,
      `Reporting: capacity to produce the periodic utilisation, portfolio-quality and impact reports the facility requires.`,
      `Track record of reporting to other wholesale lenders/DFIs: timeliness and accuracy.`,
      `MIS for covenant monitoring: can the bank self-monitor facility covenants and eligibility criteria?`,
    ],
    flags: [
      `No ability to tag or report sub-loans by end-use or borrower gender without manual workarounds.`,
      `History of late or inaccurate reporting to existing lenders.`,
    ],
  },
  {
    code: `S11`, label: `Onlending`, weight: 0.10,
    title: `11. Onlending Capacity and Target-Segment Track Record`,
    objective: `Assess demonstrated ability to reach the target borrowers at the intended volume and quality.`,
    requiredDocs: [
      `Target-segment portfolio schedule (volume, tenor, pricing, NPL)`,
      `Pipeline schedule of eligible sub-loans`,
      `Sample sub-loan files (approved and declined)`,
      `Product programmes for the target segment`,
      `Branch and distribution network schedule`,
    ],
    questions: [
      `Current SME/target-segment portfolio: size, growth, average loan size, tenor, pricing, currency, segment NPL ratio vs. bank-wide.`,
      `Pipeline: current pipeline of eligible women-owned business and/or green sub-loans (number, volume, stage).`,
      `Delivery infrastructure: branches, relationship managers, digital channels; dedicated units or products.`,
      `Product fit: whether existing products (size, tenor, collateral) match target borrowers' needs, or what adaptation is planned.`,
      `Absorption analysis: facility size vs. segment origination capacity — realistic disbursement timeline.`,
      `Technical assistance needs: capacity gaps TA should address; the bank's willingness to receive it.`,
    ],
    flags: [
      `Facility size that would more than double the segment portfolio in one cycle.`,
      `No identifiable pipeline; reliance on refinancing existing loans (unless permitted).`,
    ],
  },
  {
    code: `S12`, label: `Gender / 2X`, weight: 0.05,
    title: `12. Gender-Lens Capacity and 2X Alignment`,
    objective: `Assess capacity to identify, serve and report on women-owned/led businesses, and the bank's own gender profile, using the 2X Challenge criteria as reference.`,
    requiredDocs: [
      `Gender policy or gender-lens strategy`,
      `Sex-disaggregated portfolio and staffing data`,
      `Board and management gender composition schedule`,
      `Women-focused product programme documents`,
      `HR policies on equal opportunity, parental leave and GBVH`,
    ],
    questions: [
      `2X profile — ownership: women's share of ownership (threshold: >=51% or woman founder with active role).`,
      `2X profile — leadership: women in senior management and on the board (global minimum 30%; country/sector-specific thresholds apply).`,
      `2X profile — employment: women's share of workforce plus one quality indicator (pay equity, care support, GBVH prevention).`,
      `Definition in use: how the bank identifies women-owned/led businesses; consistency with the facility definition.`,
      `Current portfolio to women-owned businesses: volume, number, average loan size, NPL ratio (sex-disaggregated).`,
      `Dedicated strategy, products or programmes for women entrepreneurs.`,
      `Staff capacity and incentives: training on gender-inclusive finance; origination targets.`,
      `Data systems: ability to capture and report sex-disaggregated data at borrower and loan level.`,
      `Barrier analysis: understanding of constraints facing women borrowers and how the offer addresses them.`,
    ],
    flags: [
      `No sex-disaggregated data and no plan to collect it.`,
      `"Women-owned" defined loosely (e.g. any loan with a woman co-signatory).`,
    ],
  },
  {
    code: `S13`, label: `Green`, weight: 0.05, report: `r11`,
    reportBlocks: [`capacity`, `sectors`, `outcome`, `products`, `pipeline`, `eligibility`],
    title: `13. Green Finance Capacity and Eligible Green Transactions`,
    objective: `Assess ability to originate, verify and report green sub-loans consistent with recognised standards (Green Loan Principles; applicable national taxonomy). The report's portfolio-by-sector, green outcome, approved product, pipeline and eligibility tables are completed below.`,
    requiredDocs: [
      `Green finance framework or green loan policy`,
      `Green portfolio schedule by sector`,
      `Green eligibility criteria and taxonomy used`,
      `Sample green sub-loan files with verification evidence`,
      `Green pipeline schedule`,
      `Technical capacity evidence (staff training, external advisers)`,
    ],
    questions: [
      `Green lending capacity and systems: track record in green lending, tagging and reporting systems, and technical assistance needs — assess the capacity record above.`,
      `Loan portfolio by economic sector: the sector distribution of gross loans above, and what it implies for green origination.`,
      `Approved green products: board-approved products, their green targets, and how each delivers the programme objectives — assess the table above.`,
      `Identified green pipeline: eligible categories, deal counts and values over the next 18 months, with example transactions — assess the pipeline above.`,
      `Funding outcome on the green portfolio: current versus projected position at full utilisation — assess the outcome grid above.`,
      `Existing green portfolio: volume and types of green lending; any green frameworks in place.`,
      `Technical capacity: staff able to appraise eligible green investments; use of external technical support or standardised tools.`,
      `Verification process: how green eligibility is confirmed at origination and monitoring (documentation, technical parameters, vendor lists).`,
      `Impact measurement: capacity to estimate and report MW installed, MWh saved, tCO2e avoided.`,
      `Greenwashing controls: internal review of green tagging; treatment of ineligible or reclassified sub-loans.`,
      `Alignment with national green taxonomy / central bank sustainable finance guidelines, if any.`,
    ],
    flags: [
      `No capacity to verify technical eligibility and no plan to obtain it.`,
      `Green categories claimed without measurable criteria or documentation.`,
      `Fossil-fuel exposure presented as "transition" without credible justification.`,
    ],
  },
  {
    code: `S14`, label: `Legal`, weight: 0.05, report: `r12`,
    title: `14. Legal, Litigation and Contractual Capacity`,
    objective: `Identify legal risks affecting the bank's ability to enter into and perform the facility. The report's litigation overview and material case schedules — both against and by the bank — are completed below.`,
    requiredDocs: [
      `Litigation and contingent liabilities schedule`,
      `External counsel litigation confirmation letters`,
      `Material contracts and existing lender agreements`,
      `Constitutional authority to borrow (legal opinion where available)`,
      `Tax clearance certificate and regulatory penalty records`,
    ],
    questions: [
      `Litigation overview: sources reviewed, cases against the bank, cases initiated by the bank, regulatory or criminal matters, materiality and the impact on the facility.`,
      `Material cases pending against the bank: forum, nature of claim, amount claimed, status and counsel's view, and the provision held — assess the schedule above.`,
      `Material cases initiated by the bank: counterparty, forum, nature of the action, amount claimed and status — assess the schedule above.`,
      `Assessment: the overall litigation position and what it means for the bank's ability to enter into and perform the facility.`,
      `Tax standing: material tax disputes or arrears.`,
      `Existing debt obligations: negative pledge, cross-default, pari passu, consents triggered by the new facility.`,
      `Capacity and authorisation: board/shareholder approvals; validity of signatures; legal opinion requirements.`,
      `Enforceability: choice of law and dispute resolution; local law constraints on covenants or security.`,
    ],
    flags: [
      `Undisclosed material litigation discovered independently.`,
      `Consents required from existing lenders unlikely to be obtained.`,
    ],
  },
  {
    code: `S15`, label: `Integrity`, weight: 0.05,
    title: `15. Integrity and Reputational Due Diligence`,
    objective: `Form a view on the integrity of the bank and its principals beyond formal compliance checks. NOTE: any integrity red flag here is an automatic decline trigger.`,
    requiredDocs: [
      `Adverse media and database screening results (bank, directors, UBOs)`,
      `Sanctions screening evidence for the bank, directors and UBOs`,
      `PEP declarations for directors and key officers`,
      `Reference checks and market enquiries record`,
      `Credit bureau reports on the institution and each principal director`,
      `Whistle-blowing policy and case log`,
    ],
    questions: [
      `Adverse media search on the bank, UBOs, directors and senior management (record search terms, tools, dates, findings).`,
      `Reference checks with [2-3] existing lenders, DFIs or correspondent banks.`,
      `Market reputation soundings: regulator (where feasible), auditors, industry associations.`,
      `Any past association with financial scandal, fraud, political interference, or misuse of donor/DFI funds.`,
      `Conflicts of interest between the bank/its principals and institution staff or board.`,
      `Credit background checks on the institution and its principal directors: credit bureau reports for the bank and for each principal director — existing borrowings, delinquency history, judgments and any record of default.`,
    ],
    flags: [
      `Credible adverse findings on principals.`,
      `Refusal to facilitate reference checks.`,
    ],
  },
  {
    code: `S16`, label: `Internal audit`, weight: 0, report: `r9`,
    title: `16. Internal Audit`,
    objective: `Establish that internal audit is independent, adequately resourced and covering the risks that matter to the facility. The report's approved-policy, evidence-of-adoption and unit staffing tables are completed below.`,
    requiredDocs: [
      `Internal audit charter`,
      `Risk-based annual audit plan`,
      `Internal audit reports (last four quarters)`,
      `Audit committee minutes (last four quarters)`,
      `Audit organogram, staffing schedule and qualifications`,
      `External quality assessment of internal audit`,
      `Management letter follow-up / issue tracker`,
    ],
    questions: [
      `Organisation and oversight: unit organogram and reporting line, composition of the Board Audit Committee and how it exercises oversight of the function.`,
      `Independence: reporting line to the Board Audit Committee, administrative line, and any interference in scope or findings.`,
      `Approved policies: internal audit policy and annual audit plan — approving authority, date of last approval and next review, and how the risk-based plan is built and revised.`,
      `Quality of policies and evidence of adoption: whether the internal audit policy, the annual plan and any other policies under review fit the bank's risk profile, and how they operate in practice.`,
      `Resourcing and unit staffing: unit structure, headcount of each audit unit, professional qualifications (CIA/ACCA/CISA), IT-audit capability, use of co-source or external specialists, and whether resourcing matches the risk profile.`,
      `Findings and follow-up: rating methodology, ageing of open findings, overdue high-risk items and escalation to the committee.`,
      `Quality assurance: internal QAIP, external quality assessment (date, assessor, conclusion) and conformance with IIA standards.`,
      `Interaction with the external auditor and the regulator; treatment of the last examination's internal audit rating.`,
    ],
    flags: [
      `Internal audit reports administratively to a function it audits, or the head is appointed without committee involvement.`,
      `Plan delivery materially below 100% with high-risk areas deferred year on year.`,
      `High-risk findings overdue for more than two quarters, or no external quality assessment.`,
    ],
  },
  {
    code: `S17`, label: `Credit rating`, weight: 0, narrative: true, report: `r7`,
    title: `17. Credit Rating Summary`,
    objective: `Record the external rating, the internal score and the drivers behind both, with the sovereign context in which the rating sits.`,
    requiredDocs: [
      `External credit rating report (full)`,
      `Rating agency engagement letter or rating rationale`,
      `Internal credit score sheet and methodology`,
      `Sovereign rating reference`,
    ],
    questions: [],
    flags: [
      `Internal score materially better than the external rating with no documented basis.`,
      `Rating on negative outlook or watch, or withdrawn and not replaced.`,
    ],
  },
  {
    code: `S18`, label: `Risks & mitigants`, weight: 0, narrative: true, noRecord: true, report: `r13`,
    title: `18. Key Risks and Mitigants`,
    objective: `Set out the risks the committee is being asked to accept, each paired with the control, covenant or condition that answers it.`,
    questions: [],
    flags: [
      `A red flag raised in an assessment section has no corresponding risk and mitigant here.`,
      `Mitigants that rely on action the bank has not committed to in writing.`,
    ],
  },
  {
    code: `S19`, label: `Facility terms`, weight: 0, narrative: true, noRecord: true, report: `r14`,
    title: `19. Proposed Facility Terms and Conditions`,
    objective: `Record the indicative term sheet. Anything conditional belongs in conditions precedent rather than in the narrative.`,
    questions: [],
    flags: [
      `Conditions precedent that cannot be evidenced before first disbursement.`,
      `Sub-loan parameters inconsistent with the eligibility criteria recorded for the facility.`,
    ],
  },
  {
    code: `S20`, label: `Covenants`, weight: 0, narrative: true, noRecord: true, report: `r16`,
    title: `20. Covenants, Monitoring and Sign-Off`,
    objective: `Record the financial and programme covenants, the monitoring plan and the sign-off. Covenants must be testable from the quarterly compliance certificate.`,
    questions: [],
    flags: [
      `A covenant that cannot be tested from the reporting the bank is able to produce.`,
      `Monitoring activity with no named owner or frequency.`,
    ],
  },
  {
    code: `S21`, label: `Annex A`, weight: 0, noRecord: true, narrative: true, report: `annexA`,
    title: `21. Annex A — Document Checklist`,
    objective: `Track every document requested. All items must be Received or formally waived before committee submission; file references point to the deal room.`,
    questions: [],
    flags: [
      `Items still outstanding at the point of committee submission.`,
      `A waiver recorded without the reason and the approver.`,
    ],
  },
];

export const RATIOS = [
  `Total capital adequacy ratio (CAR)`, `Tier 1 / CET1 ratio`, `NPL ratio (PAR > 90 days)`,
  `NPL coverage (provisions / NPLs)`, `Restructured loans / gross loans`, `Top 20 exposures / total equity`,
  `Related-party loans / total equity`, `Return on average assets (ROAA)`, `Return on average equity (ROAE)`,
  `Net interest margin`, `Cost-to-income ratio`, `Loans / deposits ratio`, `Liquid assets / total assets`,
  `LCR / NSFR (if reported)`, `Net open FX position / capital`, `Asset growth rate (YoY)`, `Loan growth rate (YoY)`,
];

export const PRUDENTIAL = [
  [`Capital adequacy ratio (CAR)`, `Minimum 14.5%`],
  [`Tier 1 / CET1 ratio`, `Minimum 10.5%`],
  [`NPL ratio (PAR > 90 days)`, `Maximum 5.0%`],
  [`Liquidity ratio (liquid assets / deposits)`, `Minimum 20.0%`],
  [`Single obligor exposure / core capital`, `Maximum 20.0%`],
];

export const PROFILE_FIELDS = [
  `Candidate bank`, `Country / jurisdiction`, `Due diligence category (onboarding / periodic review)`,
  `Date of previous due diligence`, `Tenor and repayment profile`, `Pricing basis`,
  `Target end-use split (% women-owned / % green)`, `Security / credit enhancement`,
  `Expected first disbursement date`, `Legal form and country of incorporation`,
  `Banking licence type and number`, `Primary regulator(s)`, `Year established`,
  `Total assets (latest audited)`, `Total equity (latest audited)`, `Gross loan portfolio`,
  `Number of branches / service points`, `Number of staff`, `Credit rating(s), if any`,
  `External auditor (last 3 years)`, `Ownership summary (top 5 shareholders with %)`,
  `Ultimate beneficial owner(s)`, `Group structure / parent`, `DD team lead`, `Date of assessment`, `Version / status`,
];

export const ELIGIBILITY = [
  [`Women-owned definition`, `>=51% owned by a woman/women; OR founded by a woman who remains an active shareholder or manager; OR [>=20-30]% women-owned AND at least one woman senior executive [optional women-led tier]`],
  [`Green transaction definition`, `Proceeds finance an investment in an eligible green category (renewable energy; energy efficiency; clean transportation; sustainable water; climate-smart agriculture; pollution prevention/circular economy; green buildings; climate adaptation) meeting [technical thresholds/taxonomy]`],
  [`Maximum sub-loan size`, `[Amount] or [X]% of the facility`],
  [`Maximum tenor`, `[Years], not exceeding the facility tenor`],
  [`Currency`, `[Local currency / facility currency; FX risk allocation]`],
  [`Use of proceeds exclusions`, `[Institution] exclusion list; no refinancing unless expressly permitted`],
  [`Single borrower limit`, `Max [X]% of facility to any one sub-borrower or group`],
  [`Eligibility ratio`, `>=[100]% of proceeds to eligible sub-loans; where blended, >=[X]% women-owned and >=[Y]% green`],
  [`Reporting`, `Utilisation and portfolio report each [quarter]; sex-disaggregated and green-tagged data per agreed template`],
];

export const STATUSES = [`Not started`, `In progress`, `Complete`, `N/A`];
export const RATING_LABELS = [`Strong`, `Satisfactory`, `Acceptable with conditions`, `Weak`, `Unacceptable`];

export {
  REPORT_SPEC, BUILDER_SPEC, partById, blocksOf, REPORT_PERIOD_KEYS, defaultReportPeriods,
  FLAG_OPTIONS, DOC_STATUS_OPTIONS, blankReport, reportProgress,
  ANNEX_GROUPS, ANNEX_DOCS, ANNEX_VERSION, annexGroupOf,
} from './dd-report-spec.js';

export const USERS = [
  { id: 1, name: `Administrator`, username: `admin`, password: `5210`, role: `admin`, active: true },
];

let uid = 1000;
const nextId = () => ++uid;

export function buildCase(meta) {
  return {
    id: meta.id || nextId(),
    bank: meta.bank, country: meta.country || ``, category: meta.category || `Onboarding`,
    createdAt: meta.createdAt || `14 Aug 2026 09:12 UTC`,
    createdBy: meta.createdBy || `A. Mensah`,
    finalDecision: ``, covenants: ``,
    profile: PROFILE_FIELDS.map((label) => ({ label, value: `` })),
    sections: SECTIONS.map((s) => ({
      code: s.code, label: s.label, title: s.title, objective: s.objective, weight: s.weight,
      narrative: !!s.narrative, report: s.report || null, reportBlocks: s.reportBlocks || null,
      noManagement: !!s.noManagement, noRecord: !!s.noRecord, keyFindings: !!s.keyFindings,
      assessor: ``, dateCompleted: ``, rating: null, rationale: ``, findings: ``,
      questions: s.questions.map((text, i) => ({
        num: i + 1, text, finding: ``, status: `Not started`, redFlag: false, notes: ``, management: ``,
      })),
      flags: s.flags,
      attachments: [],
      docChecks: {},
      docWaivers: {},
      extraDocs: [],
    })),
    ratios: RATIOS.map((indicator) => ({ indicator, fy2: ``, fy1: ``, fy0: ``, interim: ``, benchmark: ``, comment: `` })),
    prudential: PRUDENTIAL.map(([indicator, requirement]) => ({
      indicator, requirement, y0: ``, y1: ``, y2: ``, y3: ``, y4: ``, q0: ``, q1: ``, q2: ``,
    })),
    prudentialNotes: { figures: ``, findings: ``, management: `` },
    eligibility: ELIGIBILITY.map(([parameter, requirement]) => ({ parameter, requirement })),
    report: blankReportData(),
    reports: [],
    audit: [{ at: meta.createdAt || `14 Aug 2026 09:12 UTC`, who: meta.createdBy || `A. Mensah`, action: `case.created`, detail: meta.bank }],
  };
}

// ————— demonstration content for the pre-populated case —————
const PREFILL = {
  S3: {
    assessor: `R. Okonjo`, date: `06 Aug 2026`, rating: 2,
    rationale: `Licence and corporate powers confirmed with the regulator's register; no live enforcement. One prudential breach (single obligor, Q3 FY2023) cured within the quarter and reported.`,
    q: {
      1: [`Complete`, `Meridian Trust Bank Plc, a public limited company incorporated in Kenya in 1998 (registered no. C.41928); registered office Nairobi. Legal form and registered particulars agreed to the companies registry extract of 04 Aug 2026; no change of name or form since incorporation.`, `A1.4 companies registry extract`],
      2: [`Complete`, `Commercial banking licence No. CBK/CB/041, unrestricted, issued 1998, no expiry. Verified against the central bank's published register on 04 Aug 2026 and confirmed in writing by the Director of Bank Supervision.`, `A1.1 licence copy; A1.2 regulator confirmation letter`],
      3: [`Complete`, `Memorandum and articles permit borrowing from foreign lenders and onlending without shareholder consent (Art. 7.2). Counsel's opinion obtained.`, `A1.3 constitutional documents`],
      4: [`Complete`, `38 branches and 214 agency outlets across 21 counties; 1,640 staff (FY2023: 1,478). Network and headcount reconcile to the FY2025 prudential returns.`, ``],
      5: [`Complete`, `Seventh of 22 banks by assets (4.1% share); third by SME lending volume. Rated B+ / stable by a regional agency, Mar 2026.`, ``],
      6: [`In progress`, `Deposit-funded commercial bank: 46% corporate, 31% SME, 23% retail by gross loans; net interest income 74% of revenue. The facility would fund the SME book, the segment named for growth in the board-approved plan. Segment profitability analysis still outstanding.`, ``],
      7: [`Complete`, `No enforcement actions or fines in the last 5 years. Two supervisory letters (2023, 2024) on IT change management; both closed.`, ``],
      8: [`In progress`, `CAR 16.8% against 14.5% minimum. Single obligor limit breached once in Q3 FY2023 (23.4% vs 20%); cured within 41 days and self-reported. Awaiting the FY2025 prudential returns pack to confirm no recurrence.`, `Prudential returns Q1–Q3 2026 received; Q4 outstanding`],
      9: [`Complete`, `No intervention, administration or forbearance history for the bank or its group.`, ``],
      10: [`In progress`, `Foreign borrowing registration required with the central bank (Form FX-12) before first disbursement; 15% withholding tax on interest unless treaty relief applies. Repatriation permitted for registered facilities.`, `Tax counsel memo requested`],
      11: [`Complete`, `Member of the national Deposit Protection Fund; premiums current.`, ``],
    },
  },
  S4: {
    assessor: `R. Okonjo`, date: `08 Aug 2026`, rating: 2,
    rationale: `Board effective and independent-majority, with all four committees functioning and a regular meeting cadence. Management stable; the 2024 board evaluation has recommendations still open. Related-party book small and within limits.`,
    q: {
      1: [`Complete`, `Nine directors, five independent, three women (33%). Skills matrix covers credit, audit, technology and SME banking; no vacancy on the board at the review date.`, `A2.3 board charter`],
      2: [`Complete`, `Audit, risk, credit and remuneration committees in place, each with a charter and an independent chair. Credit committee holds a delegated limit of ₦5m; no executive chairs a committee.`, `A2.3 board charter`],
      3: [`Complete`, `Board met six times in FY2025 and each committee at least quarterly; attendance above 85%. Papers circulated a week ahead of each meeting and minutes signed at the following one.`, `attendance schedule`],
      4: [`In progress`, `External evaluation carried out in 2024 by an independent consultant. Six recommendations, four closed; a board skills refresh and a formal committee self-assessment remain open.`, `A2.6 board evaluation report`],
      5: [`Complete`, `All directors and the executive committee cleared fit-and-proper by the regulator; most recent approval Feb 2026 (CFO).`, ``],
      6: [`Complete`, `CEO in post 7 years; average executive tenure 5.4 years. One planned CFO succession in 2026, handled internally. No key-person dependency outside the CEO relationship with the anchor shareholder.`, ``],
      7: [`Complete`, `Two executive departures in 24 months: head of treasury (retirement) and head of compliance (moved to a peer bank). Both replaced within four months from internal candidates; no departures from internal audit.`, ``],
      8: [`In progress`, `Related-party loans 6.1% of equity against a 10% internal limit; all board-approved and priced at or above the standard schedule. Sample of four files reviewed; two lacked the independent-director attestation.`, `A2.4 related-party schedule`],
      9: [`Complete`, `Internal audit reports to the Board Audit Committee, 14 FTE, three-year risk-based plan, 92% of the FY2025 plan delivered. Outstanding findings tracked with owners and due dates.`, `A2.5 internal audit charter and FY2025 plan`],
      10: [`Complete`, `Anchor shareholder injected ₦18m in 2021 rights issue; pro-rata support confirmed in writing for the projected growth plan.`, ``],
      11: [`In progress`, `Onlending would sit with the SME Banking division (head reports to the CEO). Facility monitoring accountability not yet formally allocated — to be confirmed as a condition precedent.`, ``],
    },
  },
  S5: {
    assessor: `T. Lindqvist`, date: `11 Aug 2026`, rating: 2,
    rationale: `Coherent SME-led strategy with women-in-business and green lending both named in the board-approved 2025–2028 plan. Prior DFI line executed without incident.`,
    q: {
      1: [`Complete`, `Deposit-funded commercial bank: 46% corporate, 31% SME, 23% retail by gross loans. Net interest income 74% of revenue.`, ``],
      2: [`Complete`, `Seventh of 22 banks by assets (4.1% share); third by SME lending volume.`, ``],
      3: [`Complete`, `2025–2028 strategy targets doubling the SME book and a dedicated women-in-business proposition; green lending has a board-approved product set and a ₦41.4m portfolio target.`, `A3.1 board-approved strategy; A3.2 product approvals`],
      4: [`Complete`, `Managed a ₦15m DFI line 2019–2024: fully utilised within 22 months, no covenant breaches, reporting on time in 21 of 22 quarters.`, ``],
      5: [`In progress`, `Policy rate cuts compressing margins; FX availability improved since Q1 2026. Sector concentration in agriculture processing (18% of SME book) to be tested in the ratio review.`, ``],
    },
  },
  S6: {
    assessor: `T. Lindqvist`, date: ``, rating: 3,
    rationale: `Capital and liquidity adequate with modest headroom; asset quality the principal weakness — NPLs 6.4% with coverage below peer. Earnings sound. FY2025 audit clean but with a repeat management-letter finding on credit file documentation.`,
    q: {
      1: [`Complete`, `CET1 13.9% of a total CAR of 16.8% (minimum 14.5%). Dividend payout 25%. Capital plan supports 18% asset growth without further injection.`, `A4.1 audited statements FY2023 to FY2025`],
      2: [`In progress`, `NPL ratio 6.4% (FY2023: 5.1%), driven by two agriculture-processing exposures. Coverage 58% against 70% peer median. Restructured book 3.2% of gross loans. Classification sample of 20 files found three loans one grade optimistic.`, `A4.2 portfolio breakdowns; classification sample working paper`, true],
      3: [`Complete`, `ROAA 1.9%, ROAE 15.4%; pre-provision operating profit up 11% year on year, no reliance on one-off items. Net income grew 29% across the audited years (₦32.4m to ₦41.9m); cost / income 52%, cost of risk 1.1%, fee income 26% of revenue. Nine-month earnings are 81% of the prior full year.`, `A4.1 audited accounts`],
      4: [`In progress`, `Loans/deposits 78%; top 20 depositors 22% of deposits. Liquid assets 24% of total assets. Contingency funding plan in place, last tested Nov 2025.`, ``],
      5: [`In progress`, `Net open FX position 4.1% of capital against a 10% limit. Facility and onlending both in naira, so the facility itself carries no currency mismatch; exposure is limited to the bank’s own FX book.`, `Term sheet discussion pending`, true],
      6: [`Complete`, `Audited by a Big Four member firm for six years. Unqualified opinions FY2023 to FY2025. Management letter repeats a finding on credit file documentation completeness.`, `A4.3 management letters`],
      7: [`Not started`, ``, ``],
      8: [`In progress`, `Total assets ₦2.4bn, gross loans ₦1.42bn, deposits ₦1.86bn; loans / deposits 78% and equity 11.9% of assets. Deposit-funded with modest borrowings, so the facility would be the largest wholesale line — tenor profile still to be confirmed.`, ``],
      9: [`In progress`, `CAR 18.2% against a 13.0% minimum, Tier 1 15.1%; LCR 156%, NSFR 121%; open FX position 4.1% of capital against a 10% limit. NPL coverage 62% against a 70% internal target is the one ratio outside policy.`, `A4.4 prudential returns`],
    },
  },
  S7: {
    assessor: `R. Okonjo`, date: ``, rating: 3,
    rationale: `Framework and committees sound; execution gaps in exception tracking and in early-warning coverage of the SME book.`,
    q: {
      1: [`Complete`, `Board Risk Committee of five, three independent, chaired by an independent director and meeting quarterly. Management Risk & Compliance Committee meets monthly. CRO reports to the Board Risk Committee with a management line to the CEO; no reporting line into the business.`, `A5.1 risk management framework`],
      2: [`In progress`, `Seven core policies board-approved and current; the stress testing framework was last approved in 2022 and is past its review date.`, ``],
      3: [`In progress`, `Policies fit the risk profile and produce a monthly board risk report. Adoption evidenced for credit and operational risk; the ESMS is not yet visible in credit files.`, ``],
      4: [`In progress`, `SME scorecard in use since 2023 and an IFRS 9 ECL model built in-house; neither independently validated since build. Override rate not reported.`, ``],
      5: [`Complete`, `Risk department of 26 FTE across five units, each with a named head. Market and liquidity risk carries two FTE, thin for the trading book.`, ``],
      6: [`In progress`, `Delegated authority matrix current. Policy exceptions logged but not reported to the credit committee in aggregate.`, ``],
      7: [`In progress`, `Watchlist process monthly for corporate exposures, quarterly for SME. Early-warning indicators not yet applied to loans below ₦100k.`, ``],
      8: [`Not started`, ``, ``],
      9: [`Complete`, `Four fraud incidents in three years, aggregate ₦214k, all recovered or provisioned; controls remediated. BCP tested twice in FY2025.`, ``],
      10: [`In progress`, `Penetration test Oct 2025: two high findings, both closed. No customer data breaches reported.`, ``],
      11: [`Not started`, ``, `Sample of 15 files requested for the on-site week`],
    },
  },
  S8: {
    assessor: `A. Mensah`, date: ``, rating: 2,
    rationale: `Programme is board-approved, independently tested and adequately resourced. No sanctions or watchlist hits. One open item: transaction monitoring tuning documentation.`,
    q: {
      1: [`Complete`, `Board-approved AML/CFT policy (rev. Mar 2026). MLRO reports to the Board Audit Committee; 9 FTE in compliance. Enterprise-wide risk assessment refreshed annually; independent testing by internal audit FY2025.`, `A6.1 AML/CFT policy; A6.2 EWRA`],
      2: [`Complete`, `Risk-based CDD with EDD for PEPs and high-risk sectors; beneficial ownership captured to 25% threshold. Periodic review cycle 1/3/5 years by risk rating.`, ``],
      3: [`Complete`, `Screening against UN, OFAC, EU, UK and local lists at onboarding and daily on the customer base; fuzzy matching enabled; hits escalated to the MLRO within 24 hours.`, `A6.3 screening procedure`],
      4: [`In progress`, `Automated monitoring in place; 2,140 alerts in FY2025, 38 STRs filed. Scenario tuning rationale not documented — requested.`, ``],
      5: [`Complete`, `No AML/CFT penalties in five years. 2024 thematic inspection raised two findings, both closed and verified.`, ``],
      6: [`Complete`, `Three correspondent relationships, none terminated. Wolfsberg CBDDQ (2025) obtained and reviewed.`, `A6.4 Wolfsberg CBDDQ`],
      7: [`Complete`, `Jurisdiction not on FATF grey or black lists. National risk assessment identifies cash-intensive trade as the principal typology.`, ``],
      8: [`Complete`, `ABC policy with gifts register and whistleblowing hotline (externally hosted). No corruption investigations.`, ``],
      9: [`Complete`, `Bank, five UBOs, nine directors and eight executives screened 07 Aug 2026 (Dow Jones Risk & Compliance and open-source media). No sanctions or watchlist hits; no substantive adverse media.`, `A6.5 screening results pack`],
    },
  },
  S11: {
    assessor: `T. Lindqvist`, date: ``, rating: null,
    rationale: ``,
    q: {
      1: [`Complete`, `SME book ₦214m across 3,180 borrowers; average loan ₦67k; typical tenor 36 months; segment NPL 7.1% against 6.4% bank-wide.`, ``],
      2: [`In progress`, `Pipeline of 92 eligible sub-loans, ₦31.4m, of which 41 women-owned (₦12.8m). Stage split provided but not aged.`, `A9.1 pipeline schedule`],
      3: [`Complete`, `38 branches, 64 SME relationship managers, dedicated SME desks in 12 branches.`, ``],
      4: [`Not started`, ``, ``],
      5: [`Not started`, ``, ``],
      6: [`Not started`, ``, ``],
    },
  },
  S13: {
    assessor: `A. Mensah`, date: ``, rating: null, rationale: ``,
    q: {
      1: [`In progress`, `Green portfolio ₦16.4m: solar PV for commercial premises, energy-efficient equipment and two small hydro exposures. Four board-approved green products.`, `A11.1 green product approvals`],
      2: [`In progress`, `Two credit officers trained on solar appraisal; no in-house engineer. Vendor list maintained for solar and cold-chain equipment.`, ``],
      3: [`Not started`, ``, ``],
      4: [`Not started`, ``, ``],
      5: [`Not started`, ``, ``],
      6: [`Not started`, ``, ``],
    },
  },
};

const RATIO_PREFILL = {
  0: [`17.2%`, `16.9%`, `16.8%`, `16.5%`, `>=14.5%`, `Headroom 2.3pp; adequate for the growth plan`],
  1: [`14.4%`, `14.1%`, `13.9%`, `13.7%`, `>=11.0%`, `Quality of capital sound — 83% CET1`],
  2: [`5.1%`, `5.8%`, `6.4%`, `6.7%`, `<=5.0%`, `Above benchmark; two agri-processing exposures drive the increase`],
  3: [`71%`, `66%`, `58%`, `57%`, `>=70%`, `Coverage below peer median — provisioning adequacy to be tested`],
  4: [`2.1%`, `2.8%`, `3.2%`, `3.4%`, `—`, `Restructured book rising alongside NPLs`],
  5: [`188%`, `196%`, `204%`, `—`, `<=200%`, `Concentration marginally above internal guidance`],
  6: [`5.4%`, `5.8%`, `6.1%`, `—`, `<=10%`, `Within limit; all board-approved`],
  7: [`2.1%`, `2.0%`, `1.9%`, `1.8%`, `>=1.5%`, `Earnings resilient despite margin compression`],
  8: [`17.2%`, `16.1%`, `15.4%`, `14.9%`, `>=12%`, ``],
  9: [`6.4%`, `6.1%`, `5.8%`, `5.6%`, `—`, `Policy rate cuts compressing margin`],
  10: [`58%`, `61%`, `62%`, `63%`, `<=60%`, `Cost base rising with branch refurbishment`],
  11: [`74%`, `76%`, `78%`, `79%`, `<=85%`, ``],
  12: [`27%`, `25%`, `24%`, `24%`, `>=20%`, ``],
  13: [`—`, `128%`, `134%`, `131%`, `>=100%`, `LCR reported from FY2024; NSFR not yet reported`],
  14: [`3.2%`, `3.8%`, `4.1%`, `4.4%`, `<=10%`, `Within limit; naira facility adds no onlending FX exposure`],
  15: [`12%`, `14%`, `16%`, `—`, `—`, ``],
  16: [`15%`, `17%`, `19%`, `—`, `—`, `Loan growth ahead of asset growth`],
};

const PROFILE_PREFILL = {
  0: `Meridian Trust Bank Plc`,
  1: `Kenya`,
  2: `Onboarding`,
  3: `Not applicable — first assessment`,
  4: `7 years, 2-year grace, semi-annual amortisation`,
  5: `SOFR + 3.85%`,
  6: `60% women-owned / 40% green`,
  7: `Negative pledge; no security sought`,
  8: `Q1 2027`,
  9: `Public limited company, incorporated Kenya 1998`,
  10: `Commercial banking licence No. CBK/CB/041`,
  11: `Central Bank of Kenya`,
  12: `1998`,
  13: `₦2.4bn`,
  14: `₦286m`,
  15: `₦1.42bn`,
  16: `38 branches, 214 agency outlets`,
  17: `1,640`,
  18: `B+ / stable (regional agency, Mar 2026)`,
  19: `Big Four member firm (FY2023 to FY2025)`,
  20: `Regional listed insurer 28.4%; three domestic pension funds 46.1% combined; founding family vehicle 11.2%; free float 14.3%`,
  21: `Five identified UBOs; none PEP`,
  22: `No parent; two non-bank subsidiaries (insurance agency, leasing)`,
  23: `A. Mensah`,
  24: `14 Aug 2026`,
  25: `Draft v3 — in progress`,
};

const ATTACHMENTS = {
  S3: [
    [`Banking-licence-CBK-CB-041.pdf`, 412, `R. Okonjo`, `04 Aug 2026 11:20 UTC`, `Licence copy evidencing unrestricted commercial banking scope and no expiry — supports enquiry 2.`],
    [`CBK-standing-confirmation-letter.pdf`, 188, `R. Okonjo`, `05 Aug 2026 08:44 UTC`, `Regulator's written confirmation of good standing and absence of enforcement action — supports enquiries 2 and 7.`],
  ],
  S4: [
    [`Shareholder-register-Jul-2026.xlsx`, 96, `R. Okonjo`, `07 Aug 2026 14:02 UTC`, `Register used to trace ownership to the five UBOs recorded in section 3.`],
    [`Internal-audit-charter-and-FY2025-plan.pdf`, 604, `R. Okonjo`, `08 Aug 2026 09:31 UTC`, `Charter confirms the reporting line to the Board Audit Committee; plan evidences risk-based coverage — supports enquiry 9.`],
  ],
  S6: [
    [`Audited-financials-FY2023-to-FY2025.pdf`, 3840, `T. Lindqvist`, `09 Aug 2026 16:10 UTC`, `Source of all capital, earnings and liquidity figures in this section and of the ratio grid.`],
    [`Loan-classification-sample-working-paper.xlsx`, 142, `T. Lindqvist`, `12 Aug 2026 10:55 UTC`, `Our own testing of 20 files; evidences the three optimistic classifications noted at enquiry 2 and the red flag raised.`],
  ],
  S8: [
    [`AML-CFT-policy-rev-Mar-2026.pdf`, 1120, `A. Mensah`, `06 Aug 2026 12:18 UTC`, `Board-approved policy evidencing governance, MLRO seniority and independent testing — supports enquiry 1.`],
    [`Screening-results-pack-07-Aug-2026.pdf`, 2260, `A. Mensah`, `07 Aug 2026 17:40 UTC`, `Screening output for the bank, UBOs, directors and executives — the evidence base for the nil-hit conclusion at enquiry 9.`],
  ],
};

const AUDIT_DEMO = [
  [`14 Aug 2026 10:41 UTC`, `A. Mensah`, `report.generated`, `v2`],
  [`14 Aug 2026 10:38 UTC`, `A. Mensah`, `decision.saved`, `Approve with conditions`],
  [`14 Aug 2026 09:57 UTC`, `T. Lindqvist`, `section.saved`, `S6 6. Financial Soundness (CAMELS-Based Analysis)`],
  [`13 Aug 2026 16:22 UTC`, `T. Lindqvist`, `ratios.saved`, ``],
  [`13 Aug 2026 15:04 UTC`, `R. Okonjo`, `section.saved`, `S7 7. Risk Management, Credit Process and Internal Controls`],
  [`12 Aug 2026 10:55 UTC`, `T. Lindqvist`, `attachment.uploaded`, `S6: Loan-classification-sample-working-paper.xlsx`],
  [`11 Aug 2026 11:09 UTC`, `T. Lindqvist`, `section.saved`, `S5 5. Strategy, Business Model and Market Position`],
  [`09 Aug 2026 16:10 UTC`, `T. Lindqvist`, `attachment.uploaded`, `S6: Audited-financials-FY2023-to-FY2025.pdf`],
  [`08 Aug 2026 09:31 UTC`, `R. Okonjo`, `attachment.uploaded`, `S4: Internal-audit-charter-and-FY2025-plan.pdf`],
  [`07 Aug 2026 17:40 UTC`, `A. Mensah`, `attachment.uploaded`, `S8: Screening-results-pack-07-Aug-2026.pdf`],
  [`06 Aug 2026 09:02 UTC`, `A. Mensah`, `profile.saved`, ``],
  [`04 Aug 2026 08:15 UTC`, `A. Mensah`, `case.created`, `Meridian Trust Bank Plc`],
];

export function demoCases() {
  const meridian = buildCase({
    id: 3, bank: `Meridian Trust Bank Plc`, country: `Kenya`, category: `Onboarding`,
    createdAt: `04 Aug 2026 08:15 UTC`, createdBy: `A. Mensah`,
  });
  meridian.profile.forEach((p, i) => { if (PROFILE_PREFILL[i]) p.value = PROFILE_PREFILL[i]; });
  meridian.ratios.forEach((r, i) => {
    const v = RATIO_PREFILL[i];
    if (v) { r.fy2 = v[0]; r.fy1 = v[1]; r.fy0 = v[2]; r.interim = v[3]; r.benchmark = v[4]; r.comment = v[5]; }
  });
  meridian.sections.forEach((s) => {
    const p = PREFILL[s.code];
    if (p) {
      s.assessor = p.assessor; s.dateCompleted = p.date;
      s.rating = p.rating; s.rationale = p.rationale;
      s.questions.forEach((q) => {
        const v = p.q && p.q[q.num];
        if (v) { q.status = v[0]; q.finding = v[1]; q.notes = v[2] || ``; q.redFlag = !!v[3]; }
      });
    }
    const atts = ATTACHMENTS[s.code];
    if (atts) {
      s.attachments = atts.map(([filename, size, by, at, justification], i) => ({
        ref: `A${s.code.slice(1)}.${i + 1}`, filename, size, by, at, justification,
      }));
    }
  });
  const PRUD_PREFILL = [
    [`18.1%`, `17.6%`, `17.2%`, `16.9%`, `16.8%`, `16.5%`, `16.6%`, `16.7%`],
    [`15.2%`, `14.8%`, `14.4%`, `14.1%`, `13.9%`, `13.7%`, `13.8%`, `13.9%`],
    [`4.2%`, `4.6%`, `5.1%`, `5.8%`, `6.4%`, `6.7%`, `6.5%`, `6.4%`],
    [`27.4%`, `26.1%`, `25.0%`, `24.6%`, `24.0%`, `23.2%`, `23.6%`, `23.8%`],
    [`17.2%`, `18.4%`, `23.4%`, `19.6%`, `19.1%`, `18.8%`, `19.0%`, `19.2%`],
  ];
  meridian.prudential.forEach((p, i) => {
    const row = PRUD_PREFILL[i];
    if (row) { p.y0 = row[0]; p.y1 = row[1]; p.y2 = row[2]; p.y3 = row[3]; p.y4 = row[4]; p.q0 = row[5]; p.q1 = row[6]; p.q2 = row[7]; }
  });
  meridian.prudentialNotes = {
    figures: `Capital has fallen about 130bp over five years as loan growth outpaced retained earnings, but CAR remains 230bp above the 14.5% floor and CET1 is 340bp above its minimum. NPLs have risen every year, from 4.2% to 6.4%, and sit above the 5.0% ceiling in each of the last three quarters. Liquidity is adequate but on a steady downward path. The single obligor ratio spiked to 23.4% in FY2023 and has since been held below the limit.`,
    findings: `One live breach: the NPL ratio has exceeded the regulatory maximum since FY2024 and worsened to 6.7% in the latest quarter. Provision coverage of 58% against a 70% peer median makes provisioning the more material concern than the headline ratio. The FY2023 single obligor breach (23.4% against a 20.0% limit) was cured within 41 days and self-reported. All other ratios sit within requirement, with capital headroom narrowing each year.`,
    management: `Management attributes the NPL movement to two agriculture-processing exposures and expects both restructured or written down by Q4 2026, returning the ratio below 5.0%. Provision coverage to be raised to 70% over two quarters from retained earnings. Asset growth to be moderated to 12% from the planned 18% rather than raising capital. Remediation plan submitted to the regulator in February 2026.`,
  };
  meridian.finalDecision = `Approve with conditions`;
  meridian.covenants = `CP1 Foreign borrowing registration (Form FX-12) evidenced before first disbursement.\nCP2 Naira pricing basis and reset mechanism documented in the facility agreement.\nCP3 Written allocation of facility-monitoring accountability within SME Banking.\nCovenant: NPL coverage restored to >=70% within 12 months of first disbursement.\nCovenant: sex-disaggregated and green-tagged utilisation reporting each quarter.`;
  meridian.reports = [
    { version: 2, by: `A. Mensah`, at: `14 Aug 2026 10:41 UTC`, note: `Amended after committee comments on asset quality` },
    { version: 1, by: `A. Mensah`, at: `12 Aug 2026 15:26 UTC`, note: `First draft for committee review` },
  ];
  meridian.audit = AUDIT_DEMO.map(([at, who, action, detail]) => ({ at, who, action, detail }));

  const sahel = buildCase({
    id: 2, bank: `Sahel Commercial Bank SA`, country: `Senegal`, category: `Onboarding`,
    createdAt: `28 Jul 2026 13:40 UTC`, createdBy: `A. Mensah`,
  });
  sahel.sections[0].assessor = `S. Haddad`;
  sahel.sections[0].rating = 2;
  sahel.sections[0].questions.forEach((q, i) => { if (i < 4) q.status = `Complete`; });
  sahel.sections[1].assessor = `R. Okonjo`;
  sahel.sections[1].questions.forEach((q, i) => { if (i < 3) q.status = `In progress`; });
  sahel.audit = [
    { at: `12 Aug 2026 09:14 UTC`, who: `R. Okonjo`, action: `section.saved`, detail: `S4 4. Governance and Management` },
    { at: `28 Jul 2026 13:40 UTC`, who: `A. Mensah`, action: `case.created`, detail: `Sahel Commercial Bank SA` },
  ];

  const atlas = buildCase({
    id: 1, bank: `Atlas Union Bank Ltd`, country: `Morocco`, category: `Periodic review`,
    createdAt: `21 Jul 2026 10:02 UTC`, createdBy: `A. Mensah`,
  });
  atlas.sections.forEach((s) => { s.rating = 3; s.assessor = `A. Mensah`; s.questions.forEach((q) => { q.status = `Complete`; }); });
  atlas.sections[15].questions[0].redFlag = true;
  atlas.sections[15].questions[0].finding = `Adverse media identifies a director as a subject of an ongoing procurement investigation reported by two credible outlets. Referred to the DD lead.`;
  atlas.finalDecision = `Decline`;
  atlas.audit = [
    { at: `05 Aug 2026 11:31 UTC`, who: `A. Mensah`, action: `decision.saved`, detail: `Decline` },
    { at: `05 Aug 2026 11:12 UTC`, who: `A. Mensah`, action: `section.saved`, detail: `S15 15. Integrity and Reputational Due Diligence` },
    { at: `21 Jul 2026 10:02 UTC`, who: `A. Mensah`, action: `case.created`, detail: `Atlas Union Bank Ltd` },
  ];

  return [meridian, sahel, atlas];
}
