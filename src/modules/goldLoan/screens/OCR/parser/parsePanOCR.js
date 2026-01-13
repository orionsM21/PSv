import { createField } from '../configs/createField';
import { PAN_OCR_CONFIG } from '../configs/pan.config';

export const parsePanOCR = (text) => {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const {
    pan,
    dob,
    name,
  } = PAN_OCR_CONFIG.fields;

  const result = {
    firstName: createField('', 0),
    middleName: createField('', 0),
    lastName: createField('', 0),
    pan: createField('', 0),
    dob: createField('', 0),
  };

  for (const line of lines) {
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
      const parts = line.split(/\s+/);

      result.firstName = createField(parts[0] || '', name.confidence);
      result.middleName = createField(
        parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
        name.confidence - 0.1
      );
      result.lastName = createField(
        parts.length > 1 ? parts[parts.length - 1] : '',
        name.confidence
      );
    }
  }

  return result;
};
