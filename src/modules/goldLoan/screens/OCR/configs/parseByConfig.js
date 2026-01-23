import { createField } from "./createField";

export const parseByConfig = (input, config) => {
  const lines = Array.isArray(input)
    ? input.map(l => String(l).trim()).filter(Boolean)
    : String(input)
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

  const result = {};
  Object.keys(config.fields).forEach(key => {
    result[key] = createField('', 0);
  });

  for (const rawLine of lines) {
    const line = rawLine.toUpperCase();

    for (const [key, field] of Object.entries(config.fields)) {
      if (
        !result[key].value &&
        field.regex.test(line)
      ) {
        result[key] = createField(rawLine, field.confidence ?? 0.9);
      }
    }
  }

  return result;
};
