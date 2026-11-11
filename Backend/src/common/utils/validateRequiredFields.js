import mongoose from "mongoose";

export const validateRequired = (fields, body) => {
  const missing = [];
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === "") {
      missing.push(f);
    }
  }
  return missing;
};

export const validateObjectIds = (fieldsObj) => {
  const invalidIds = [];

  for (const [key, value] of Object.entries(fieldsObj)) {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      invalidIds.push(key);
    }
  }

  return {
    isValid: invalidIds.length === 0,
    invalidFields: invalidIds,
  };
};

export const checkMissingFields = (fields) => {
  return Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
};

