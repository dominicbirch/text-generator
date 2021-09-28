

export type WithAlias<T> = T & { __alias?: string };


export function InAllCasesIt<T extends Object>(title: string, cases: T[], fn: (testCase: T) => (void | Promise<void>), getCaseLabel?: (testCase: T) => string, timeout?: number) {
    cases.forEach((c, i) => it(`${title} - ${getCaseLabel ? getCaseLabel(c) : `Case ${i + 1}`}`, async () => {
        const result = fn(c);
        if (result) {
            return await result;
        }
    }, timeout));
}