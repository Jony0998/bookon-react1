// Must stay in sync with backend: src/libs/types/enums/product.enum.ts
export enum ProductLanguage {
    UZ = "UZ",
    RU = "RU",
    EN = "EN",
    OTHER = "OTHER",
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
