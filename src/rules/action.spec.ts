import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, Location, MatchResult } from "./common";
import { RuleFactory } from "./factory";
import { stringOffsetToPos, StringPos } from "./string/env";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    options: {},
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    options: {},
    offsetToPos: arrayLikeOffsetToPos,
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test ActionRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => {
                const ret = r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "a")
                        .and(r => r.seqEqual("abc"))
                        .and(r => r.seqEqual("abc"), "b")
                    );
                return ret;
            }, (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 5;
        const text = "xyz\r\nabcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 14,
            value: {
                location: {
                    start: {
                        offset: 5,
                        line: 2,
                        column: 1,
                    },
                    end: {
                        offset: 14,
                        line: 2,
                        column: 10,
                    },
                },
                text: "abcdefghi",
            },
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "ghi",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("def"))
                .and(r => r.seqEqual("ghi"), "b")
                .action(({ location, text }) => {
                    return {
                        location: location(),
                        text: text(),
                    };
                })
            );

        const result: MatchResult<
            {
                location: Location<StringPos>,
                text: string,
            },
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(s => s.seqEqual("abc"), "a")
                .and(s => s.seqEqual("abc"))
                .and(s => s.seqEqual("abc"), "b")
                .action(({ a, b }) => {
                    return a.length + b.length;
                })
            );

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(s => s.seqEqual("abc"), "a")
                .and(s => s.seqEqual("abc"))
                .and(s => s.seqEqual("abc"), "b")
            ).action(({ a, b }) => {
                return a.length + b.length;
            });

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = ["a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextPos: 9,
            value: ["a,b,c", "a,b,c"],
        } as const;
        const expectedEnv = {
            a: ["a", "b", "c"],
            b: ["a", "b", "c"],
        };

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual(["a", "b", "c"]), "a")
                    .and(s => s.seqEqual(["a", "b", "c"]))
                    .and(s => s.seqEqual(["a", "b", "c"]), "b")
                ), (
                ({ a, b }) => {
                    return [a.join(","), b.join(",")] as const;
                }
            ));

        const result: MatchResult<
            readonly [string, string],
            DummyStringArrayEnv & {
                a: string[];
                b: string[];
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 12,
            value: ["a", "b", "c", "a", "b", "c"],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result: MatchResult<
            readonly string[],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 9,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result: MatchResult<
            readonly string[],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 9,
            expected: "<abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .withName("<abc rule>")
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result: MatchResult<
            readonly string[],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});