// The prototype's editor properties (data-props on the dc script), now fixed configuration.
// startScreen is deliberately absent: it skipped sign-in as Administrator (Application Guide D13).
export const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || 'Denham + Grey';
export const REPORTING_YEAR = Math.round(Number(process.env.NEXT_PUBLIC_REPORTING_YEAR || 2026)) || 2026;
export const SHOW_GUIDANCE = process.env.NEXT_PUBLIC_SHOW_GUIDANCE !== 'false';
export const ENFORCE_JUSTIFICATION = process.env.NEXT_PUBLIC_ENFORCE_JUSTIFICATION !== 'false';
