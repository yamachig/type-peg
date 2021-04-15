import peg from "./pegjsTypings/pegjs";
// import pegjs from "./optionalPegjs";


export const grammarToCode = (grammar: peg.Grammar, options: { header?: string } = {}): string => {
    const retFragments: string[] = [];
    if (options.header) retFragments.push(options.header);
    retFragments.push(getHeader());
    const initializer = initializerToCode(grammar
        .initializer);
    retFragments.push(initializer.code);
    const ruleNames: string[] = [];
    for (const rule of grammar.rules) {
        const ruleCode = ruleToCode(rule, [...initializer.addEnvNames, "error", "expected", "location", "offset", "range", "text"], 0);
        retFragments.push(ruleCode);
        ruleNames.push(rule.name);
    }
    retFragments.push(getParse(ruleNames));
    return retFragments.join("\r\n");
};

const getHeader = (): string => {
    return `
import { BaseEnv, ValueRule, stringOffsetToPos, StringPos } from "generic-parser/lib/rules/common";
import { RuleFactory } from "generic-parser/lib/rules/factory";

let currentLocation: Location<StringPos> = {
    start: {
        offset: 0,
        line: 1,
        column: 1,
    },
    end: {
        offset: 0,
        line: 1,
        column: 1,
    },
};

const location = () => currentLocation;
let options: Record<string | number | symbol, unknown> = {};

const factory = new RuleFactory<string, BaseEnv<string, StringPos>>();
`.trimStart();
};

const getParse = (ruleNames: string[]): string => {
    return `
const rules = {
${ruleNames.map(name => `${INDENTUNIT}${name}: $${name},`).join("\r\n")}
};

export const parse = (text: string, _options: Record<string | number | symbol, unknown>) => {
${INDENTUNIT}options = _options;
${INDENTUNIT}let rule: ValueRule<string, unknown> = $${ruleNames[0]};
${INDENTUNIT}if ("startRule" in options) {
${INDENTUNIT}    rule = rules[options.startRule as keyof typeof rules];
${INDENTUNIT}}
${INDENTUNIT}const result = rule.match(
${INDENTUNIT}${INDENTUNIT}0,
${INDENTUNIT}${INDENTUNIT}text,
${INDENTUNIT}${INDENTUNIT}{
${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}offsetToPos: stringOffsetToPos,
${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}registerCurrentLocation: location => {
${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}currentLocation = location;
${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}},
${INDENTUNIT}${INDENTUNIT}${INDENTUNIT}...initializer(options),
${INDENTUNIT}${INDENTUNIT}},
${INDENTUNIT});
${INDENTUNIT}if (result.ok) return result.value;
${INDENTUNIT}throw new Error(\`Expected \${result.expected} \${JSON.stringify(result)}\`);
};
`.trimStart();
};

const INDENTUNIT = "    ";

const safeChar = (str: string) => {
    return str.replace(/[\u007F-\uFFFF]/g, c => {
        return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
};

const assertNever = (value: never) => {
    throw new Error(`unexpected ${JSON.stringify(value)}`);
};

const initializerToCode = (initializer?: peg.ast.Initializer): {code: string, addEnvNames: string[]} => {
    return {
        code: `
${initializer?.code ?? ""}
`.replace(/^\r?\n/, ""),
        addEnvNames: [],
    };
};

const ruleToCode = (rule: peg.ast.Rule, envNames: string[], indent: number): string => {
    const retFragments: string[] = [];
    retFragments.push(`const $${rule.name} = factory`);
    let expression = rule.expression;
    if (expression.type === "named") {
        retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.withName("${expression.name}")`);
        expression = expression.expression;
    }
    const { code } = expressionToCode(expression, envNames, indent + 1);
    retFragments.push(code);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.abstract()`);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)};`);
    retFragments.push("");
    return retFragments.join("\r\n");
};

const expressionToCode = (expression: peg.ast.Expression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    let result: {code: string, addEnvNames: string[]};
    if (expression.type === "action") {
        result = actionToCode(expression, envNames, indent);
    } else if (expression.type === "any") {
        result = anyToCode(expression, envNames, indent);
    } else if (expression.type === "choice") {
        result = choiceToCode(expression, envNames, indent);
    } else if (expression.type === "class") {
        result = classToCode(expression, envNames, indent);
    } else if (expression.type === "group") {
        result = groupToCode(expression, envNames, indent);
    } else if (expression.type === "literal") {
        result = literalToCode(expression, envNames, indent);
    } else if (expression.type === "optional" || expression.type === "zero_or_more" || expression.type === "one_or_more") {
        result = suffixedToCode(expression, envNames, indent);
    } else if (expression.type === "rule_ref") {
        result = refToCode(expression, envNames, indent);
    } else if (expression.type === "semantic_and" || expression.type === "semantic_not") {
        result = predicateToCode(expression, envNames, indent);
    } else if (expression.type === "sequence" || expression.type === "labeled") {
        const e: peg.ast.SequenceExpression =
            expression.type === "labeled"
                ? {
                    type: "sequence",
                    elements: [expression],
                    location: expression.location,
                } : expression;
        result = sequenceToCode(e, envNames, indent);
    } else if (expression.type === "simple_and" || expression.type === "simple_not" || expression.type === "text") {
        result = prefixedToCode(expression, envNames, indent);
    } else {
        throw assertNever(expression.type);
    }
    return result;
};

const actionToCode = (expression: peg.ast.ActionExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const { code, addEnvNames } = expressionToCode(expression.expression, envNames, indent + 1);
    retFragments.push(`
${INDENTS}.action(r => r
${code}
${INDENTS}, (({ ${[...envNames, ...addEnvNames].join(", ")} }) => {
${expression.code.trim()}
${INDENTS}})
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const anyToCode = (_expression: peg.ast.AnyMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.anyOne()
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const choiceToCode = (expression: peg.ast.ChoiceExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.choice(c => c
${expression.alternatives.map(e => `
${INDENTS}${INDENTUNIT}.or(r => r
${expressionToCode(e, envNames, indent + 2).code}
${INDENTS}${INDENTUNIT})
`.replace(/^\r?\n/, "").trimEnd()).join("\r\n")}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const groupToCode = (expression: peg.ast.GroupExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    return {
        ...expressionToCode(expression.expression, envNames, indent),
        addEnvNames: [],
    };
};

const literalToCode = (expression: peg.ast.LiteralMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    if (expression.ignoreCase) {
        retFragments.push(`
${INDENTS}.regExp(/${safeChar(JSON.stringify(expression.value).slice(1, -1)).replace(/[.+*?^$()[]{}|]/g, "\\$&")}/i)
    `.replace(/^\r?\n/, "").trimEnd());
    } else {
        retFragments.push(`
${INDENTS}.seqEqual(${safeChar(JSON.stringify(expression.value))})
`.replace(/^\r?\n/, "").trimEnd());

    }
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const classToCode = (expression: peg.ast.CharacterClassMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const inverted = expression.inverted ? "^" : "";
    const parts = safeChar(expression.parts.map(p => (typeof p === "string" ? [p] : p).map(pp => JSON.stringify(pp).slice(1, -1).replace(/[.+*?^$()[]{}|]/g, "\\$&")).join("")).join(""));
    const ignoreCase = expression.ignoreCase ? "i" : "";
    retFragments.push(`
${INDENTS}.regExp(/[${inverted}${parts}]/${ignoreCase})
    `.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const suffixedToCode = (expression: peg.ast.SuffixedExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "optional"
            ? "zeroOrOne"
            : expression.type === "zero_or_more"
                ? "zeroOrMore"
                : expression.type === "one_or_more"
                    ? "oneOrMore"
                    : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(expression.expression, envNames, indent + 1).code}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const refToCode = (expression: peg.ast.RuleReferenceExpression, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.ref(() => $${expression.name})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const predicateToCode = (expression: peg.ast.SemanticPredicateExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "semantic_and"
            ? "assert"
            : expression.type === "semantic_not"
                ? "assertNot"
                : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(({ ${envNames.join(", ")} }) => {
${expression.code.trim()}
${INDENTS}})
    `.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const sequenceElementToCode = (expression: peg.ast.SuffixedExpression | peg.ast.LabeledExpression | peg.ast.PrefixedExpression | peg.ast.PrimaryExpression, pickExists: boolean, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        !pickExists || (expression.type === "labeled" && expression.pick)
            ? "and"
            : "andOmit";
    const label =
        expression.type === "labeled" && expression.label
            ? `, "${expression.label}"`
            : "";
    const e = expression.type === "labeled" ? expression.expression : expression;
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(e, envNames, indent + 1).code}
${INDENTS}${label})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames:
            expression.type === "labeled" && expression.label
                ? [expression.label]
                : []
    };
};

const sequenceToCode = (expression: peg.ast.SequenceExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const pickExists = expression.elements.some(e => e.type === "labeled" && e.pick);
    const retFragments: string[] = [];
    const newAddEnvNames: string[] = [];
    retFragments.push(`${INDENTS}.sequence(c => c`);
    for (const e of expression.elements) {
        const { code, addEnvNames } = sequenceElementToCode(e, pickExists, [...envNames, ...newAddEnvNames], indent + 1);
        retFragments.push(code);
        newAddEnvNames.push(...addEnvNames);
    }
    retFragments.push(`${INDENTS})`);
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: newAddEnvNames,
    };
};

const prefixedToCode = (expression: peg.ast.PrefixedExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "simple_and"
            ? "nextIs"
            : expression.type === "simple_not"
                ? "nextIsNot"
                : expression.type === "text"
                    ? "asSlice"
                    : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(expression.expression, envNames, indent + 1).code}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};
