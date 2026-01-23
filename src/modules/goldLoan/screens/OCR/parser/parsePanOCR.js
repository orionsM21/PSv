import { createField } from '../configs/createField';
import { PAN_OCR_CONFIG } from '../configs/pan.config';

export const parsePanOCR = (input) => {
  // 🔐 Normalize input (ARRAY | STRING)
  const lines = Array.isArray(input)
    ? input.map(l => String(l).trim()).filter(Boolean)
    : String(input)
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

  const { pan, dob, name } = PAN_OCR_CONFIG.fields;

  const result = {
    firstName: createField('', 0),
    middleName: createField('', 0),
    lastName: createField('', 0),
    pan: createField('', 0),
    dob: createField('', 0),
  };

  for (const rawLine of lines) {
    const line = rawLine.toUpperCase(); // normalize once

    /* ---------------- PAN ---------------- */
    if (!result.pan.value && pan.regex.test(line)) {
      result.pan = createField(line, pan.confidence);
      continue;
    }

    /* ---------------- DOB ---------------- */
    if (!result.dob.value && dob.regex.test(line)) {
      result.dob = createField(line, dob.confidence);
      continue;
    }

    /* ---------------- NAME ---------------- */
    if (
      !result.firstName.value &&
      name.regex.test(line) &&
      (!name.exclude || !name.exclude.test(line))
    ) {
      const parts = rawLine.split(/\s+/); // preserve original casing

      result.firstName = createField(parts[0] || '', name.confidence);

      result.middleName = createField(
        parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
        Math.max(name.confidence - 0.1, 0)
      );

      result.lastName = createField(
        parts.length > 1 ? parts[parts.length - 1] : '',
        name.confidence
      );
    }
  }

  return result;
};
