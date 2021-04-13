import { assert } from "chai";
import { SeqEqualRule } from "./seqEqual";
import { BaseEnv, MatchResult } from "./common";
import { RuleFactory } from "./factory";
import { stringOffsetToPos, StringPos } from "./string/env";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    options: {},
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

// const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
// const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
//     [dummyStringArraySymbol]: "dummy",
//     options: {},
//     offsetToPos: arrayLikeOffsetToPos,
// });
// type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test NextIsRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "<abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>").
            nextIs(r => r.seqEqual("abc"));
        const result: MatchResult<undefined, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
