

## Problem

The HubSpot form is not rendering because `hbspt.forms.create()` receives a DOM element as `target`, but the HubSpot API expects a **CSS selector string** (e.g. `"#hubspot-form-container"`).

## Fix

In `src/components/PurchaseRequestDialog.tsx`:

1. Add a unique `id` to the container div: `id="hubspot-form-container"`
2. Change `target: containerRef.current` → `target: "#hubspot-form-container"` (CSS selector string)
3. Keep the `containerRef` for cleanup purposes only

This is a one-line fix in the `target` property plus adding an `id` attribute to the div.

## Note
The HubSpot script loads from an external CDN. In the Lovable preview iframe it may be blocked by CSP or sandboxing. You should test this on the **published URL** (jhleasing.lovable.app) after deploying, as external scripts often work there but not in the preview.

