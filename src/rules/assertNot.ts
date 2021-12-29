import { ActionEnv, BaseEnv, BasePos, Empty, makeActionEnv, MatchResult, PosOf, Rule, UnknownTarget } from "../core";

export class AssertNotRule<
    TTarget extends UnknownTarget,
    TPrevEnv extends BaseEnv<TTarget, BasePos>
> extends Rule<
    TTarget,
    undefined,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "AssertNotRule" as const;

    public constructor(
        public func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => unknown,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
        // context: MatchContext,
    ): MatchResult<
        undefined,
        TPrevEnv
    > {
        const value = this.func(makeActionEnv(
            offset,
            offset,
            target,
            env as unknown as BaseEnv<UnknownTarget, PosOf<TPrevEnv>>,
        ) as unknown as ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv);
        if (value) {
            return {
                ok: false,
                offset,
                expected: this.toString(),
                prevFail: null,
            };
        } else {
            return {
                ok: true,
                nextOffset: offset,
                value: undefined,
                env,
            };
        }
    }

    public toString(): string { return this.name ?? "!{assert}"; }
}
