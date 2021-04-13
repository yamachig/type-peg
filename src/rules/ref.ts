import { MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget, AddEnvOfRule, NewEnvOfRule, MatchSuccess } from "./common";

export class RefRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    ValueOfRule<TRule>,
    PrevEnvOfRule<TRule>,
    AddEnvOfRule<TRule>
> {
    public readonly classSignature = "RefRule" as const;

    public constructor(
        public rule: TRule,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        ValueOfRule<TRule>,
        NewEnvOfRule<TRule>
    > {
        const result = this.rule.match(pos, target, env);
        if (result.ok) {
            return result as MatchSuccess<ValueOfRule<TRule>, NewEnvOfRule<TRule>>;
        } else {
            return this.name === null
                ? result
                : {
                    ok: false,
                    pos,
                    expected: this.toString(),
                };
        }
    }

    public toString(): string { return this.name ?? this.rule.toString(); }
}