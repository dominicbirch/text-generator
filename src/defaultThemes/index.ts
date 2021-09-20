export const DefaultThemes = [
    "Alice in Wonderland",
    "Ghost in the Shell",
    "Lorem Ipsum"
] as const;

export type DefaultTheme = typeof DefaultThemes[number]; // union type from array