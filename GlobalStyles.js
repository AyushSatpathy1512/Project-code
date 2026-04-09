/**
 * GlobalStyles.js — Single Source of Truth
 *
 * All shared colours, spacing, typography, and reusable component
 * styles are defined HERE and imported wherever needed.
 *
 * ─────────────────────────────────────────────────────────────
 *  HOW TO USE
 * ─────────────────────────────────────────────────────────────
 *  import { COLORS, TYPOGRAPHY, globalStyles } from '../styles/GlobalStyles';
 *
 *  // Use a colour directly
 *  color: COLORS.primary
 *
 *  // Use a global style
 *  style={globalStyles.modalSaveBtn}
 *
 *  // Spread into a local StyleSheet
 *  myBtn: { ...globalStyles.modalSaveBtn, marginTop: 8 }
 * ─────────────────────────────────────────────────────────────
 */
 
import { StyleSheet } from 'react-native';
 
// ═════════════════════════════════════════════
//  COLOUR PALETTE
//  Every colour used across the app lives here.
//  Never use raw hex strings in screen files.
// ═════════════════════════════════════════════
export const COLORS = {
  // ── Brand ──────────────────────────────────
  primary:        '#4a3fa0',   // indigo — primary action colour
  primaryLight:   '#f0eeff',   // light indigo — backgrounds, hover
  primaryMid:     '#7c6ec7',   // mid indigo — accents
 
  // ── Background ─────────────────────────────
  screenBg:       '#eceaf8',   // app-wide screen background
  cardBg:         '#ffffff',   // white card background
  inputBg:        '#f3f4fa',   // input field background
  overlayBg:      'rgba(20,10,50,0.45)', // modal dark backdrop
 
  // ── Text ───────────────────────────────────
  textDark:       '#2d2150',   // headings, primary text
  textMid:        '#4e4670',   // body text
  textLight:      '#9b94b8',   // subtitles, captions, labels
  textFaint:      '#b4aed0',   // placeholder-level text
 
  // ── Border / Divider ───────────────────────
  border:         '#e4dffa',   // standard input border
  borderLight:    '#f5f3fc',   // subtle dividers inside modals
  divider:        'rgba(160,140,220,0.18)', // section dividers
 
  // ── Semantic ───────────────────────────────
  danger:         '#e05c5c',   // delete / destructive actions
  dangerBg:       '#fce8e8',   // delete button background
  success:        '#2e9b6b',   // success / confirm
  warning:        '#c98a10',   // warnings, achievements icon
 
  // ── Shadow ─────────────────────────────────
  shadowPrimary:  '#6450b4',   // card shadows
  shadowDark:     '#2d2150',   // modal shadows
};
 
// ═════════════════════════════════════════════
//  TYPOGRAPHY
//  Font sizes and weights used across the app.
// ═════════════════════════════════════════════
export const TYPOGRAPHY = {
  // Font sizes
  xs:   10,
  sm:   11,
  base: 13,
  md:   14,
  lg:   16,
  xl:   18,
  xxl:  22,
  hero: 26,
 
  // Font weights
  regular:    '400',
  medium:     '500',
  semibold:   '600',
  bold:       '700',
 
  // Letter spacing
  tight:   0.2,
  normal:  0.3,
  wide:    1.0,
  wider:   1.5,
  widest:  2.0,
};
 
// ═════════════════════════════════════════════
//  SPACING
//  Consistent padding and margin values.
// ═════════════════════════════════════════════
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 14,
  lg:   16,
  xl:   18,
  xxl:  22,
  hero: 24,
};
 
// ═════════════════════════════════════════════
//  BORDER RADIUS
// ═════════════════════════════════════════════
export const RADIUS = {
  sm:     8,
  md:     10,
  lg:     12,
  xl:     14,
  xxl:    20,
  card:   24,
  pill:   999,
};
 
// ═════════════════════════════════════════════
//  GLOBAL STYLES
//  Shared StyleSheet objects imported by screens
//  and components. These are the exact same styles
//  that were previously copy-pasted across files.
// ═════════════════════════════════════════════
export const globalStyles = StyleSheet.create({
 
  // ─────────────────────────────────────────
  //  Screen Base
  // ─────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
 
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.lg,
  },
 
  // ─────────────────────────────────────────
  //  Card
  // ─────────────────────────────────────────
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  cardIcon: {
    width: 32, height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textDark,
    marginLeft: SPACING.sm + 2,
  },
 
  // ─────────────────────────────────────────
  //  Modal — Overlay & Box
  // ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.card,
    padding: SPACING.xxl,
    elevation: 16,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    maxHeight: '88%',
  },
  // Bottom-sheet variant (ProjectDetails modal slides up from bottom)
  modalBoxSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.xxl,
    maxHeight: '90%',
    elevation: 16,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
 
  // ─────────────────────────────────────────
  //  Modal — Typography
  // ─────────────────────────────────────────
  modalTitle: {
    fontSize: TYPOGRAPHY.xl - 1,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.xs + 1,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textLight,
    letterSpacing: TYPOGRAPHY.wide,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs + 2,
    marginTop: SPACING.sm + 2,
  },
 
  // ─────────────────────────────────────────
  //  Modal — Input Fields
  // ─────────────────────────────────────────
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalInputMulti: {
    height: 90,
    paddingTop: SPACING.sm + 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.primaryLight,
    marginVertical: SPACING.base,
  },
 
  // ─────────────────────────────────────────
  //  Modal — List Rows (skills, achievements)
  // ─────────────────────────────────────────
  modalListScroll: { maxHeight: 160 },
  modalListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalListLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.medium,
  },
  modalListSub: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textLight,
    marginTop: 1,
  },
 
  // ─────────────────────────────────────────
  //  Modal — Action Buttons Row
  //  Used at the bottom of EVERY modal.
  // ─────────────────────────────────────────
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
    gap: SPACING.sm + 2,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  modalSaveBtn: {
    paddingVertical: 9,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.cardBg,
  },
 
  // ─────────────────────────────────────────
  //  Delete Button (✕ inside modal list rows)
  //  Used in Skills modal, Achievements modal,
  //  and ProjectEditModal.
  // ─────────────────────────────────────────
  deleteBtn: {
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  deleteBtnText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.bold,
  },
 
  // ─────────────────────────────────────────
  //  Colour Swatches (skill picker)
  // ─────────────────────────────────────────
  colorPickerRow:    { flexDirection: 'row', marginTop: 4, marginBottom: 6 },
  colorSwatch:       { width: 26, height: 26, borderRadius: 13, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: COLORS.textDark, transform: [{ scale: 1.15 }] },
 
  // ─────────────────────────────────────────
  //  Inline Add Row
  //  (TextInput + Add button side by side)
  //  Used in ProjectEditModal for tech + bullets.
  // ─────────────────────────────────────────
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  inlineAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.base,
  },
  inlineAddBtnText: {
    fontSize: TYPOGRAPHY.xs + 2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.cardBg,
  },
});

export default GlobalStyles;
