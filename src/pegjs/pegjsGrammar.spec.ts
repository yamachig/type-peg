import { assert } from "chai";
import { parse } from "./pegjsGrammar";
import { inspect } from "util";
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import peg from "pegjs-dev/packages/pegjs";

const parseGrammar = (source: string) => {
    const ast = parse(source);
    const passes = peg.util.convertPasses( peg.compiler.passes as unknown as peg.IStageMap );
    const session = new peg.compiler.Session( { passes } );
    const parser = peg.compiler.compile(ast, session, { output: "parser" });
    if (typeof parser === "string") throw new Error();
    return { ast, parser };
};

describe("Test pegjsGrammar", () => {

    it("Success case", () => {
        const source = `
plus = "+"
`;
        const { parser } = parseGrammar(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("+", { startRule: "plus" });
        assert.strictEqual(result, "+");
    });

    it("Success case", () => {
        const source = `
sum = $([0-9]+ "+" [0-9]+)
`;
        const { parser } = parseGrammar(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, "1+1");
    });

    it("Success case", () => {
        const source = `
sum = left:$[0-9]+ "+" right:$[0-9]+
        { return Number(left) + Number(right) }
`;
        const { parser } = parseGrammar(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, 2);
    });

    it("Success case", () => {
        const source = `
sum = left:num "+" right:num
        { return left + right }

num = strNum:$([0-9]+)
        { return Number(strNum) }
`;
        const { parser } = parseGrammar(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, 2);
    });

    it("Success case", () => {
        const source = fs.readFileSync(path.join(__dirname, "../../node_modules/pegjs-dev/src/parser.pegjs"), { encoding: "utf-8" });

        const targetAst = parse(source);
        const targetAstStr = inspect(targetAst, undefined, null);
        fs.writeFileSync(path.join(__dirname, "temp_target_ast.txt"), targetAstStr, { encoding: "utf-8" });

        const origAst = peg.parser.parse(source, { extractComments: true });
        const origAstStr = inspect(origAst, undefined, null);
        fs.writeFileSync(path.join(__dirname, "temp_orig_ast.txt"), origAstStr, { encoding: "utf-8" });

        assert.strictEqual(targetAstStr, origAstStr);
    });

});
