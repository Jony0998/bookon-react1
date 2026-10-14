// Must stay in sync with backend: src/libs/types/enums/product.enum.ts
export enum ProductSize {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    EXTRA_LARGE = "EXTRA_LARGE",
}

export enum ProductWeight {
    LIGHT = "LIGHT",
    MEDIUM = "MEDIUM",
    HEAVY = "HEAVY",
}

export enum ProductStatus {
    PAUSE = "PAUSE",
    PROCESS = "PROCESS",
    DELETE = "DELETE",
}

export enum ProductCollection {
    FICTION = "FICTION",
    NON_FICTION = "NON_FICTION",
    SCIENCE = "SCIENCE",
    HISTORY = "HISTORY",
    BIOGRAPHY = "BIOGRAPHY",
    CHILDREN = "CHILDREN",
    TEXTBOOK = "TEXTBOOK",
    REFERENCE = "REFERENCE",
    RELIGION = "RELIGION",
    OTHER = "OTHER",
}

/** "NON_FICTION" -> "Non Fiction" */
export const formatEnumLabel = (value?: string): string =>
    (value || "")
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
