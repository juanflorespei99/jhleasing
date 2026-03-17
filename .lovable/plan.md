

## Problem

The reCAPTCHA is forced by HubSpot's portal settings — `captchaEnabled: false` in the embed code has no effect. When the reCAPTCHA challenge popup opens, the Radix Dialog's **focus trap** prevents clicking inside the challenge iframe. CSS z-index alone doesn't fix this because the focus trap captures all pointer/keyboard events back to the dialog.

## Solution: Replace Dialog with a Sheet (side drawer)

A `Sheet` component (already available at `src/components/ui/sheet.tsx`) slides in from the right and does **not** use an aggressive focus trap like Dialog. This eliminates the conflict with the reCAPTCHA challenge popup entirely.

### Changes

**`src/components/PurchaseRequestDialog.tsx`**:
- Replace `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription` imports with `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle`/`SheetDescription`
- Change the component to render a `SheetContent side="right"` instead of `DialogContent`
- Keep all HubSpot form logic unchanged
- The Sheet's overlay doesn't trap focus the same way, allowing the reCAPTCHA challenge to be interacted with

This is a minimal change — same component API (`open`, `onOpenChange`, `vehicleName`, `vin`), same HubSpot embed logic, just a different container that doesn't conflict with external iframes.

### Files to modify
- `src/components/PurchaseRequestDialog.tsx` — swap Dialog → Sheet

