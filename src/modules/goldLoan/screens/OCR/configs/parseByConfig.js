import { createField } from "./createField";


export const parseByConfig = (text, config) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const result = {};
  Object.keys(config.fields).forEach(key => {
    result[key] = createField('', 0);
  });

  lines.forEach(line => {
    Object.entries(config.fields).forEach(([key, regex]) => {
      if (regex.test(line)) {
        result[key] = createField(line, 0.9);
      }
    });
  });

  return result;
};
