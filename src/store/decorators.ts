import { window } from "vscode";
import type { Class } from "./abstractions";

/**Wrap all methods of a class with some extended handling */
export function monkeyPatchAllMethods(wrapper: (inner: Function, ...args: any[]) => any) {
    return <T extends Class>(target: T) => class extends target {
        constructor(...args: any[]) {
            super(...args);

            Reflect.ownKeys(target.prototype).forEach(member => {
                if (typeof target.prototype[member] === "function") {
                    Object.defineProperty(this, member, {
                        value: function (...memberArgs: any[]) {
                            return wrapper(target.prototype[member], ...memberArgs);
                        }
                    });
                }
            });
        }
    };
}

/**Wrap all methods of the class in a try..catch which shows error toast notifications */
export const notifyAllErrors = monkeyPatchAllMethods((inner, ...args) => {
    try {
        return inner(...args);
    } catch (error) {
        window.showErrorMessage(String(error));
    }
});