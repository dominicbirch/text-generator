export const DefaultThemes = [
    "Alice in wonderland",
    "Lorem ipsum"
] as const;

export type DefaultTheme = typeof DefaultThemes[number]; // union type from array