import { notifyAllErrors } from "./decorators";

describe("notifyAllErrors", () => {
    it("suppresses errors thrown in function members of the modified class", () => {
        let one, two;
        const
            TestClass = class {
                one() {
                    one = 1;
                    throw "Not implemented 1";
                }
                two() {
                    two = 2;
                    throw "Not implemented 2";
                }
            },
            NotifyingTestClass = notifyAllErrors(TestClass),
            subject = new NotifyingTestClass();


        subject.one();
        subject.two();


        expect(one).toBe(1);
        expect(two).toBe(2);
    });

    it("leaves constructor, fields and arrow function members unchanged", () => {
        const
            TestClass = class {
                constructor(readonly one: number, readonly two: number) { }
                static Test = 1337;
                getString = () => "yorokonde";
                FieldTest = 54321;
            },
            NotifyingTestClass = notifyAllErrors(TestClass),


            result = new NotifyingTestClass(1, 2);


        expect(result.getString()).toBe("yorokonde");
        expect(result.one).toBe(1);
        expect(result.two).toBe(2);
        expect(NotifyingTestClass.Test).toBe(1337);
        expect(result.FieldTest).toBe(54321);
    });

    it("rethrows errors in constructors of decorated classes", () => {
        const
            TestClass = class {
                constructor() {
                    throw "Not implemented";
                }
            },


            NotifyingTestClass = notifyAllErrors(TestClass);


        expect(() => {
            const subject = new NotifyingTestClass();
        }).toThrowError("Not implemented");
    });

    it("rethrows errors in arrow function members of decorated classes", () => {
        const TestClass = class {
            fail = () => { throw "Not implemented"; }
        },
            NotifyingTestClass = notifyAllErrors(TestClass),
            subject = new NotifyingTestClass();


        expect(() => subject.fail()).toThrowError("Not implemented");
    });
});