import type { MappingResult } from "./types";

// Gender mapping
export function mapGender(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  switch (normalized) {
    case "m":
    case "man":
    case "male":
      return { value: "Man", original: value, confidence: "high" };

    case "f":
    case "woman":
    case "female":
      return { value: "Woman", original: value, confidence: "high" };

    case "they/them":
    case "non-binary":
    case "nonbinary":
    case "non binary":
      return { value: "NonBinary", original: value, confidence: "high" };

    case "n":
    case "":
    case "prefer not to state":
      return {
        value: "PreferNotToState",
        original: value,
        confidence: "medium",
      };

    default:
      return {
        value: "Other",
        original: value,
        confidence: "low",
        notes: `Unmapped gender value: ${value}`,
      };
  }
}

// District mapping
export function mapDistrict(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  // Handle district numbers
  const districtMatch = normalized.match(/district\s*(\d+)/);
  if (districtMatch) {
    const num = parseInt(districtMatch[1]);
    if (num >= 1 && num <= 11) {
      return {
        value: `District${num}`,
        original: value,
        confidence: "high",
      };
    }
  }

  // Handle specific locations that should map to "Other"
  const otherLocations = [
    "marina",
    "oakland",
    "berkeley",
    "east bay",
    "south bay",
    "peninsula",
    "marin",
    "pacifica",
    "daly city",
    "south san francisco",
    "burlingame",
    "walnut creek",
    "mountain view",
    "palo alto",
    "san mateo",
    "sunnyvale",
    "emeryville",
    "alameda",
    "concord",
    "fremont",
    "san jose",
    "cupertino",
    "millbrae",
    "brisbane",
    "half moon bay",
    "redwood city",
    "menlo park",
    "foster city",
    "belmont",
    "san carlos",
    "tracy",
    "clayton",
    "martinez",
    "napa",
    "sonoma",
    "petaluma",
    "santa rosa",
    "novato",
    "san rafael",
    "sausalito",
    "tiburon",
    "mill valley",
    "corte madera",
    "larkspur",
  ];

  for (const location of otherLocations) {
    if (normalized.includes(location)) {
      return {
        value: "Other",
        original: value,
        confidence: "high",
        notes: `Mapped ${value} to Other district`,
      };
    }
  }

  // Empty or unknown
  if (!normalized || normalized === "n/a") {
    return { value: null, original: value, confidence: "medium" };
  }

  return {
    value: "Other",
    original: value,
    confidence: "low",
    notes: `Unknown district: ${value}`,
  };
}

// Tennis ranking mapping
export function mapTennisRanking(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  if (!normalized || normalized === "n/a" || normalized === "") {
    return { value: null, original: value, confidence: "medium" };
  }

  // Handle decimal rankings
  const numValue = parseFloat(normalized);
  if (!isNaN(numValue)) {
    if (numValue >= 1.0 && numValue < 1.5) {
      return { value: "ONE_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 1.5 && numValue < 2.0) {
      return { value: "ONE_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 2.0 && numValue < 2.5) {
      return { value: "TWO_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 2.5 && numValue < 3.0) {
      return { value: "TWO_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 3.0 && numValue < 3.5) {
      return { value: "THREE_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 3.5 && numValue < 4.0) {
      return { value: "THREE_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 4.0 && numValue < 4.5) {
      return { value: "FOUR_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 4.5 && numValue < 5.0) {
      return { value: "FOUR_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 5.0 && numValue < 5.5) {
      return { value: "FIVE_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 5.5 && numValue < 6.0) {
      return { value: "FIVE_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 6.0 && numValue < 6.5) {
      return { value: "SIX_ZERO", original: value, confidence: "high" };
    } else if (numValue >= 6.5 && numValue < 7.0) {
      return { value: "SIX_FIVE", original: value, confidence: "high" };
    } else if (numValue >= 7.0) {
      return { value: "SEVEN_ZERO", original: value, confidence: "high" };
    }
  }

  return {
    value: null,
    original: value,
    confidence: "low",
    notes: `Unable to map tennis ranking: ${value}`,
  };
}

// Age range mapping
export function mapAgeRange(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  if (!normalized || normalized === "prefer not to state") {
    return { value: "PreferNotToState", original: value, confidence: "high" };
  }

  // Handle age ranges like "18-25", "26-35", etc.
  if (normalized.includes("18-25")) {
    return {
      value: "EIGHTEEN_TO_TWENTY_FIVE",
      original: value,
      confidence: "high",
    };
  } else if (normalized.includes("26-35")) {
    return {
      value: "TWENTY_SIX_TO_THIRTY_FIVE",
      original: value,
      confidence: "high",
    };
  } else if (normalized.includes("36-45")) {
    return {
      value: "THIRTY_SIX_TO_FORTY_FIVE",
      original: value,
      confidence: "high",
    };
  } else if (normalized.includes("46-55")) {
    return {
      value: "FORTY_SIX_TO_FIFTY_FIVE",
      original: value,
      confidence: "high",
    };
  } else if (normalized.includes("55+") || normalized.includes("55 plus")) {
    return { value: "FIFTY_FIVE_PLUS", original: value, confidence: "high" };
  }

  // Handle specific ages
  const ageNum = parseInt(normalized);
  if (!isNaN(ageNum)) {
    if (ageNum >= 18 && ageNum <= 25) {
      return {
        value: "EIGHTEEN_TO_TWENTY_FIVE",
        original: value,
        confidence: "high",
      };
    } else if (ageNum >= 26 && ageNum <= 35) {
      return {
        value: "TWENTY_SIX_TO_THIRTY_FIVE",
        original: value,
        confidence: "high",
      };
    } else if (ageNum >= 36 && ageNum <= 45) {
      return {
        value: "THIRTY_SIX_TO_FORTY_FIVE",
        original: value,
        confidence: "high",
      };
    } else if (ageNum >= 46 && ageNum <= 55) {
      return {
        value: "FORTY_SIX_TO_FIFTY_FIVE",
        original: value,
        confidence: "high",
      };
    } else if (ageNum > 55) {
      return { value: "FIFTY_FIVE_PLUS", original: value, confidence: "high" };
    }
  }

  return {
    value: null,
    original: value,
    confidence: "low",
    notes: `Unable to map age: ${value}`,
  };
}

// Ethnicity mapping
export function mapEthnicity(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  if (
    !normalized ||
    normalized === "n/a" ||
    normalized === "prefer not to state"
  ) {
    return { value: null, original: value, confidence: "medium" };
  }

  // Handle multiple ethnicities (take the first recognizable one)
  const ethnicityMappings = [
    {
      keywords: ["american indian", "alaska native", "native american"],
      enum: "AmericanIndianOrAlaskaNative",
    },
    {
      keywords: ["pacific islander", "hawaiian", "samoan", "tongan", "fijian"],
      enum: "PacificIslander",
    },
    {
      keywords: ["black", "african american", "african-american"],
      enum: "BlackOrAfricanAmerican",
    },
    { keywords: ["white", "caucasian", "european"], enum: "White" },
    {
      keywords: [
        "arab",
        "middle eastern",
        "persian",
        "iranian",
        "lebanese",
        "egyptian",
        "moroccan",
      ],
      enum: "Arab",
    },
    {
      keywords: [
        "asian",
        "chinese",
        "japanese",
        "korean",
        "vietnamese",
        "thai",
        "filipino",
        "indian",
        "south asian",
      ],
      enum: "Asian",
    },
    {
      keywords: [
        "hispanic",
        "latino",
        "latina",
        "latinx",
        "mexican",
        "puerto rican",
        "cuban",
        "salvadoran",
      ],
      enum: "HispanicOrLatinx",
    },
    {
      keywords: ["mixed", "mixed-race", "multiracial", "biracial"],
      enum: "MixedRace",
    },
  ];

  for (const mapping of ethnicityMappings) {
    for (const keyword of mapping.keywords) {
      if (normalized.includes(keyword)) {
        return {
          value: mapping.enum,
          original: value,
          confidence: "high",
        };
      }
    }
  }

  return {
    value: "Other",
    original: value,
    confidence: "low",
    notes: `Unmapped ethnicity: ${value}`,
  };
}

// TMAC Gear preference mapping
export function mapGearPreference(value: string): MappingResult<string> {
  const normalized = value.toLowerCase().trim();

  if (!normalized || normalized === "n/a") {
    return { value: null, original: value, confidence: "medium" };
  }

  if (
    normalized.includes("hat") ||
    normalized.includes("cap") ||
    normalized.includes("visor")
  ) {
    return { value: "Hat", original: value, confidence: "high" };
  } else if (normalized.includes("sock")) {
    return { value: "Socks", original: value, confidence: "high" };
  } else if (
    normalized.includes("shirt") ||
    normalized.includes("tee") ||
    normalized.includes("top")
  ) {
    return { value: "Shirt", original: value, confidence: "high" };
  }

  return {
    value: "Other",
    original: value,
    confidence: "medium",
    notes: `Mapped to Other: ${value}`,
  };
}

// Gear size mapping
export function mapGearSize(value: string): MappingResult<string> {
  const normalized = value.toUpperCase().trim();

  const validSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  if (validSizes.includes(normalized)) {
    return { value: normalized, original: value, confidence: "high" };
  }

  // Handle some common variations
  if (normalized === "EXTRA SMALL" || normalized === "X-SMALL") {
    return { value: "XS", original: value, confidence: "high" };
  } else if (normalized === "SMALL") {
    return { value: "S", original: value, confidence: "high" };
  } else if (normalized === "MEDIUM") {
    return { value: "M", original: value, confidence: "high" };
  } else if (normalized === "LARGE") {
    return { value: "L", original: value, confidence: "high" };
  } else if (normalized === "EXTRA LARGE" || normalized === "X-LARGE") {
    return { value: "XL", original: value, confidence: "high" };
  }

  if (!normalized || normalized === "N/A") {
    return { value: null, original: value, confidence: "medium" };
  }

  return {
    value: null,
    original: value,
    confidence: "low",
    notes: `Invalid size: ${value}`,
  };
}
