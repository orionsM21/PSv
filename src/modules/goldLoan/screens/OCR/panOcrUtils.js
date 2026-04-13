// PAN field regex rules
export const PAN_FIELD_RULES = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  dob: /\b\d{2}\/\d{2}\/\d{4}\b/,
  name: /^[A-Z ]{3,}$/i,
};

// Detect PAN card region using anchor text
export const getPanRegion = (blocks) => {
  const anchor = blocks.find(b =>
    /INCOME TAX DEPARTMENT|GOVT OF INDIA|PERMANENT ACCOUNT NUMBER/i.test(b.text)
  );

  if (!anchor) return null;

  return {
    left: Math.max(0, anchor.box.left - anchor.box.width * 0.4),
    top: Math.max(0, anchor.box.top - anchor.box.height * 3),
    right: anchor.box.left + anchor.box.width * 1.6,
    bottom: anchor.box.top + anchor.box.height * 6,
  };
};

// Extract ONLY required PAN fields
export const extractPanFieldBlocks = (blocks) => {
  const region = getPanRegion(blocks);
  if (!region) return [];

  return blocks.filter(({ text, box }) => {
    // outside PAN card
    if (
      box.left < region.left ||
      box.top < region.top ||
      box.left + box.width > region.right ||
      box.top + box.height > region.bottom
    ) return false;

    // allowed PAN fields only
    return (
      PAN_FIELD_RULES.pan.test(text) ||
      PAN_FIELD_RULES.dob.test(text) ||
      PAN_FIELD_RULES.name.test(text)
    );
  });
};
