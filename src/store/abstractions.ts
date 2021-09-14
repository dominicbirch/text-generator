export type Class<T = any> = {
    new(...args: any[]): T;
}

export interface TextStore {
    getSentence(): string;
    getParagraph(): string;

    getFullName(): string;
    getFirstName(): string;
    getLastName(): string;
}
