import { window } from "vscode";
import type { TypedClassDecorator, WrapperFunction } from "./abstractions";

/**Wrap all methods of a class with some extended handling
 * 
 * Note this does _not_ include:
 * * fields containing arrow functions as these require an instance.
 * * constructors
 * @param {TypedFunctionDecorator} wrapper The wrapper function to be applied to each function member.  This receives the unmodified function to be called as required.
 * @returns {TypedClassDecorator} The class decorator function which may be used to apply the modifications to a class type.
 */
export function monkeyPatchAllMethods(wrapper: WrapperFunction): TypedClassDecorator {
    return target => class extends target {
        constructor(...args: any[]) {
            super(...args);

            Reflect.ownKeys(target.prototype)
                .filter(member => typeof target.prototype[member] === "function")
                .forEach(member => Object.defineProperty(this, member, {
                    value: function (...memberArgs: any[]) {
                        return wrapper(target.prototype[member], ...memberArgs);
                    }
                }));
        }
    };
}

/**Wrap all methods of the class in a try..catch */
export const notifyAllErrors = monkeyPatchAllMethods((inner, ...args) => {
    try {
        return inner(...args);
    } catch (error) {
        console.error("Failure in %s", inner.name, error);
        window.showErrorMessage(`Failure in ${inner.name}`, String(error));
    }
});
