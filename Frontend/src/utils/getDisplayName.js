const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const getDisplayName = (...partsOrSource) => {
  const fallback = "Unknown";

  if (partsOrSource.length === 1 && isPlainObject(partsOrSource[0])) {
    const source = partsOrSource[0];
    const nameParts = [source.firstName, source.lastName]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ")
      .trim();

    return (
      source.displayName ||
      source.userName ||
      source.name ||
      source.fullName ||
      source.Name ||
      nameParts ||
      source.businessEmail ||
      source.email ||
      source.Email ||
      fallback
    );
  }

  const joined = partsOrSource
    .flat(Infinity)
    .filter((part) => typeof part === "string" && part.trim())
    .join(" ")
    .trim();

  return joined || fallback;
};

export default getDisplayName;
