import { colors } from '../../config/design-tokens.js';

// This public story is intentionally separate from the administrative shell.
export const cekMbgStyles = `
:root {
  --primary: ${colors.primary}; --primary-hover: ${colors['primary-container']};
  --primary-soft: ${colors['primary-fixed']}; --ink: ${colors['on-surface']};
  --muted: ${colors['on-surface-variant']}; --line: ${colors['border-subtle']};
  --paper: ${colors['surface-card']}; --canvas: ${colors.background};
  --green: ${colors.tertiary}; --amber: ${colors.secondary}; --error: ${colors.error};
}
* { box-sizing: border-box; }
body { margin: 0; color: var(--ink); background: var(--paper); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; line-height: 1.6; }
button, select { font: inherit; }
button, a, select { -webkit-tap-highlight-color: transparent; }
button, a { touch-action: manipulation; }
button { cursor: pointer; }
a { color: var(--primary); text-decoration: none; }
button:focus-visible, a:focus-visible, select:focus-visible, summary:focus-visible { outline: 3px solid var(--primary-hover); outline-offset: 4px; }
button:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
[hidden] { display: none !important; }
h1, h2, h3, p { margin: 0; }
h1, h2 { font-size: 28px; line-height: 1.3; letter-spacing: -.8px; font-weight: 700; text-wrap: balance; }
h3 { font-size: 16px; line-height: 1.5; }
.material-symbols-outlined { font-size: 24px; line-height: 1; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.story-app { min-height: 100svh; display: flex; flex-direction: column; }
.story-top { padding: 24px 32px 16px; width: 100%; max-width: 1120px; margin: 0 auto; }
.top-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.story-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--primary); white-space: nowrap; }
.brand-mark { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: var(--primary); color: white; }
.story-top-label { color: var(--muted); font-size: 12px; }
.icon-button { border: 1px solid var(--line); background: var(--paper); border-radius: 12px; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: var(--muted); flex-shrink: 0; transition: background .15s, transform .15s; }
.icon-button:hover { background: var(--canvas); color: var(--primary); }
.icon-button:active { transform: scale(.94); }
.progress-wrap { max-width: 520px; margin: 20px auto 0; }
.progress-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
.progress-track { display: flex; gap: 6px; }
.progress-segment { height: 8px; border-radius: 8px; background: var(--line); flex: 1; overflow: hidden; }
.progress-segment::after { content: ''; display: block; height: 100%; background: var(--primary); border-radius: inherit; transform: scaleX(0); transform-origin: left; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.progress-segment.done::after { transform: scaleX(1); }
.progress-segment.current::after { transform: scaleX(.35); opacity: .5; }
.story-main { width: 100%; max-width: 568px; margin: auto; padding: 24px 24px 32px; flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.story-scene { text-align: center; outline: none; animation: scene-in .35s cubic-bezier(.2,.8,.2,1) both; }
.story-scene[data-direction='back'] { animation-name: scene-back; }
.eyebrow { display: inline-flex; align-items: center; gap: 6px; color: var(--primary); font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 12px; }
.eyebrow .material-symbols-outlined { font-size: 16px; }
.scene-copy { color: var(--muted); max-width: 420px; margin: 12px auto 0; font-size: 14px; }
.scene-art { width: 192px; height: 172px; margin: 0 auto 24px; display: grid; place-items: center; position: relative; }
.scene-art::before { content: ''; position: absolute; width: 160px; height: 160px; background: var(--primary-soft); opacity: .45; border-radius: 50%; }
.report-art { position: relative; width: 116px; height: 144px; border: 3px solid var(--primary); border-radius: 16px; background: white; transform: rotate(-8deg); box-shadow: 8px 8px 0 var(--primary-soft); padding: 20px 16px; animation: report-arrive .5s ease-out both; }
.report-art .art-line { height: 6px; width: 64px; background: var(--primary-soft); border-radius: 4px; margin-bottom: 10px; }
.report-art .art-line.short { width: 40px; background: var(--primary-hover); }
.art-check { position: absolute; right: -20px; top: -12px; border: 4px solid white; border-radius: 50%; width: 48px; height: 48px; background: var(--primary); color: white; display: grid; place-items: center; }
.art-face { display: flex; justify-content: center; gap: 18px; margin-top: 18px; }
.art-face::before, .art-face::after { content: ''; width: 6px; height: 8px; background: var(--primary); border-radius: 50%; }
.art-smile { width: 20px; height: 10px; border-bottom: 3px solid var(--primary); border-radius: 0 0 20px 20px; margin: 2px auto 0; }
.art-spark { position: absolute; color: var(--primary); font-size: 24px; animation: pop-in .5s .15s both; }
.art-spark.first { left: 8px; top: 28px; }
.art-spark.second { right: 0; bottom: 24px; font-size: 16px; }
.chapter-pills { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
.chapter-pills span { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; color: var(--muted); font-size: 11px; }
.chapter-pills .material-symbols-outlined { border: 0; padding: 0; vertical-align: -4px; font-size: 16px; margin-right: 4px; color: var(--primary); }
.text-button { border: 0; background: none; color: var(--primary); font-size: 13px; font-weight: 600; min-height: 44px; padding: 8px 12px; border-radius: 8px; }
.text-button:hover { background: var(--canvas); }
.privacy { font-size: 11px; color: var(--muted); display: flex; justify-content: center; gap: 6px; align-items: center; margin-top: 12px; }
.privacy .material-symbols-outlined { font-size: 16px; }
.story-footer { position: sticky; bottom: 0; z-index: 5; background: var(--paper); border-top: 1px solid var(--line); padding: 16px 24px max(16px, env(safe-area-inset-bottom)); }
.footer-inner { max-width: 520px; margin: 0 auto; }
.footer-actions { display: flex; gap: 12px; align-items: center; }
.story-primary { min-height: 48px; flex: 1; min-width: 0; display: inline-flex; justify-content: center; align-items: center; gap: 12px; border-radius: 12px; border: 0; border-bottom: 4px solid ${colors['on-primary-fixed']}; padding: 12px 20px; color: white; background: var(--primary); font-size: 14px; font-weight: 700; transition: background .15s, transform .15s, border-width .15s; }
.story-primary:hover:not(:disabled) { background: var(--primary-hover); }
.story-primary:active:not(:disabled) { transform: translateY(3px); border-bottom-width: 1px; }
.footer-note { font-size: 10px; text-align: center; color: var(--muted); margin-top: 10px; }
.story-back { width: 48px; height: 48px; }
.form-grid { display: grid; gap: 16px; text-align: left; margin: 24px 0 0; }
.form-grid label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
.form-grid select { width: 100%; min-height: 48px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 12px; color: var(--ink); }
.form-grid select:disabled { background: var(--canvas); color: var(--muted); opacity: .6; }
.alert { border: 1px solid var(--error); color: var(--error); border-radius: 12px; padding: 12px 16px; font-size: 12px; margin-bottom: 20px; }
.alert button { margin: 8px 0 0; display: block; }
.location-result { border: 1px solid var(--line); border-bottom-width: 3px; border-radius: 16px; margin: 24px 0 16px; padding: 24px; text-align: left; }
.kitchen-icon { width: 56px; height: 56px; background: var(--primary-soft); border-radius: 16px; display: grid; place-items: center; color: var(--primary); margin: 0 auto 20px; }
.location-result h3 { color: var(--primary); margin: 8px 0; overflow-wrap: anywhere; font-size: 18px; }
.location-address { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
.mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; border-top: 1px solid var(--line); padding-top: 16px; margin-top: 20px; text-align: center; }
.mini-stats strong { display: block; font-size: 18px; }
.mini-stats span { color: var(--muted); font-size: 10px; }
.data-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: var(--amber); border: 1px solid var(--line); border-radius: 6px; padding: 2px 6px; }
.hero-metric { margin: 24px 0 20px; }
.metric-ring { width: 168px; height: 168px; margin: 0 auto; position: relative; display: grid; place-content: center; }
.metric-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.ring-track { fill: none; stroke: var(--primary-soft); stroke-width: 10px; }
.ring-value { fill: none; stroke: var(--primary); stroke-width: 10px; stroke-linecap: round; stroke-dasharray: 440; stroke-dashoffset: var(--ring-offset, 440); transition: stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1); }
.metric-number { font-size: 40px; font-weight: 700; letter-spacing: -2px; line-height: 1.2; color: var(--primary); position: relative; }
.metric-number small { font-size: 20px; letter-spacing: 0; }
.metric-caption { display: block; font-size: 11px; color: var(--muted); position: relative; margin-top: 4px; }
.metric-label { margin-top: 12px; font-size: 12px; font-weight: 600; color: var(--primary); }
.narration { display: flex; gap: 12px; align-items: flex-start; text-align: left; padding: 16px; border-radius: 12px; background: var(--canvas); margin: 16px 0; }
.narrator-icon { flex-shrink: 0; width: 32px; height: 32px; background: var(--primary-soft); border-radius: 8px; color: var(--primary); display: grid; place-items: center; }
.narrator-icon .material-symbols-outlined { font-size: 20px; }
.narration p { font-size: 12px; color: var(--muted); line-height: 1.7; }
.narration strong { color: var(--ink); }
.stat-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; }
.stat-card { border: 1px solid var(--line); border-bottom-width: 3px; border-radius: 12px; padding: 12px 16px; min-width: 0; }
.stat-card span { font-size: 10px; color: var(--muted); display: block; }
.stat-card strong { display: block; font-size: 16px; margin-top: 4px; overflow-wrap: anywhere; }
.stat-card .material-symbols-outlined { color: var(--primary); font-size: 20px; margin-bottom: 8px; }
.detail-disclosure { text-align: left; border: 1px solid var(--line); border-radius: 12px; margin-top: 16px; font-size: 12px; }
.detail-disclosure summary { padding: 12px 16px; cursor: pointer; font-weight: 600; min-height: 44px; color: var(--primary); }
.detail-body { padding: 0 16px 16px; color: var(--muted); }
.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid var(--line); padding: 10px 0; font-size: 11px; }
.detail-row strong { color: var(--ink); text-align: right; }
.detail-row > span { flex: 1; }
.detail-body p { overflow-wrap: anywhere; }
.plate { width: 168px; height: 168px; border: 8px solid white; outline: 2px solid var(--line); border-radius: 50%; background: var(--canvas); box-shadow: 0 6px 0 var(--line); margin: 0 auto 16px; position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px; padding: 8px; transform: rotate(-8deg); }
.plate-part { display: grid; place-items: center; border-radius: 6px; font-size: 28px; }
.plate-part .material-symbols-outlined { font-size: 32px; }
.plate-part.grain { background: var(--primary-soft); color: var(--primary); border-top-left-radius: 64px; }
.plate-part.protein { background: ${colors['secondary-fixed']}; color: var(--amber); border-top-right-radius: 64px; }
.plate-part.veg { background: #e5f3e8; color: var(--green); border-bottom-left-radius: 64px; }
.plate-part.fruit { background: ${colors['secondary-fixed']}; color: var(--amber); border-bottom-right-radius: 64px; }
.plate-score { position: absolute; bottom: -8px; right: -20px; transform: rotate(8deg); border: 3px solid white; border-radius: 12px; padding: 4px 10px; color: white; background: var(--primary); font-weight: 700; font-size: 16px; }
.shield-art { width: 136px; height: 152px; margin: 0 auto; position: relative; display: grid; place-content: center; }
.shield-art svg { position: absolute; width: 100%; height: 100%; inset: 0; }
.shield-art .metric-number { font-size: 52px; }
.shield-art .metric-caption { color: var(--primary); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0 16px; }
.summary-tile { border: 1px solid var(--line); border-bottom-width: 3px; background: white; border-radius: 12px; padding: 16px; text-align: left; transition: transform .15s, border-color .15s; }
.summary-tile:hover { border-color: var(--primary); transform: translateY(-2px); }
.summary-tile .material-symbols-outlined { color: var(--primary); display: block; margin-bottom: 8px; }
.summary-tile span:not(.material-symbols-outlined) { display: block; color: var(--muted); font-size: 11px; }
.summary-tile strong { font-size: 20px; color: var(--primary); }
.summary-tile small { display: block; color: var(--muted); font-size: 10px; margin-top: 4px; }
#story-step-insight-summary .scene-art { height: 104px; margin-bottom: 12px; }
#story-step-insight-summary .scene-art::before { width: 104px; height: 104px; }
#story-step-insight-summary .report-art { position: absolute; top: -20px; left: 38px; scale: .65; }
#story-step-insight-summary .summary-grid { margin-top: 16px; }
#story-step-insight-summary .scene-copy { margin-top: 8px; font-size: 12px; }
#story-step-insight-summary .summary-tile { padding: 12px; }
.demo-note { font-size: 11px; color: var(--muted); margin: 16px 0 0; line-height: 1.7; }
.demo-note strong { color: var(--amber); }
.loader { width: 64px; height: 64px; border: 5px solid var(--primary-soft); border-top-color: var(--primary); border-radius: 50%; margin: 32px auto; animation: spin 1s linear infinite; }
@keyframes scene-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scene-back { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes report-arrive { from { opacity: 0; transform: translateY(12px) rotate(-16deg); } to { opacity: 1; transform: translateY(0) rotate(-8deg); } }
@keyframes pop-in { from { opacity: 0; transform: scale(.5); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (min-width: 768px) { .story-main { padding-top: 32px; padding-bottom: 40px; } .story-top { padding-top: 24px; } .form-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) {
  .story-top { padding: 16px 20px 12px; } .story-top-label { display: none; }
  .progress-wrap { margin-top: 16px; } .story-main { padding: 16px 20px 24px; }
  h1, h2 { font-size: 24px; } .scene-art { margin-bottom: 20px; height: 160px; }
  .story-footer { padding-left: 20px; padding-right: 20px; } .scene-copy { font-size: 13px; }
  .hero-metric { margin: 20px 0 16px; } .stat-card { padding: 12px; } .stat-card strong { font-size: 14px; }
}
@media (max-height: 720px) { .scene-art { height: 128px; transform: scale(.8); margin-top: -12px; margin-bottom: 8px; } .story-main { justify-content: flex-start; } }
@media (max-height: 720px) {
  #story-step-insight-summary .scene-art { display: none; }
  #story-step-insight-summary .summary-tile small { display: none; }
  #story-step-insight-summary .summary-tile .material-symbols-outlined { float: left; margin: 0 8px 0 0; font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;
