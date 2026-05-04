// Phase 3 — Risk & Position Sizing
// Modules m10..m13
// THE most important phase. Most traders lose because they fail this section.

export const phase3 = {
  id: 'p3',
  title: 'Risk & Position Sizing',
  description:
    "The math that keeps you alive. If you skip everything else and master this phase, you're already ahead of 90% of retail traders. Setups don't matter if your sizing kills you.",
  modules: [
    {
      id: 'm10',
      title: 'The 1% rule and why it exists',
      summary:
        "Risk no more than 1% of your account on a single trade. This isn't conservative. It's the math of survival.",
      sections: [
        {
          heading: 'The rule',
          body: [
            "**Risk no more than 1% of your account equity on a single trade.** This is the most important sentence in this course.",
            "If you have a $50,000 account, your maximum risk per trade is $500. That's the dollar amount you'd lose if the stop is hit. Not the position size — the loss.",
            "From this number, everything else flows: how many contracts you trade, where your stop goes, how big a winner needs to be to make sense.",
            "Some traders stretch this to 2% — defensible if your edge is genuinely high. Some go to 0.5% if they're new or in drawdown. **Below 0.5% is too small to compound meaningfully; above 2% is where most blowups happen. The reasonable range is 0.5% to 2%.**",
            "**For your first six months as a futures trader, use 1% maximum, ideally 0.5%.** No exceptions, no \"this trade is special.\""
          ]
        },
        {
          heading: 'Why this number, specifically',
          body: [
            "The 1% rule isn't arbitrary. It's the answer to a specific math problem: \"How much can I risk per trade so that a normal cluster of losses doesn't end my career?\"",
            "Even good traders go on losing streaks. A 60% win rate (excellent) still produces a 5-loss streak roughly once every 100 trades. A 50% win rate (mediocre but still possibly profitable with good R:R) produces 5-loss streaks every 32 trades, and 7-loss streaks every 128.",
            "**At 1% risk per trade**, a 5-loss streak is a 5% drawdown. Recoverable, manageable, painful but not catastrophic.",
            "**At 5% risk per trade** (still common among amateur futures traders), the same 5-loss streak is a 25% drawdown. To recover, you need a 33% gain. Most traders never recover from this.",
            "**At 10% risk per trade**, a 5-loss streak is a 50% drawdown. You need to double the remaining capital to recover. This is the math by which futures accounts blow up — not because the trader was fundamentally wrong, but because they sized as if losses were impossible."
          ]
        },
        {
          heading: 'The corollary: max daily loss',
          body: [
            "1% per trade is the per-trade limit. You also need a per-day limit.",
            "**Standard rule: stop trading after a 3% account loss in a day, or 3 consecutive losses, whichever comes first.**",
            "Why: tilt is real. After 3 losses, your judgment is degraded. After a 3% drawdown in a single session, your psychological state is no longer suitable for trading. The numbers don't lie about this — track yourself and you'll see it.",
            "**On a prop account, this rule is enforced by the firm.** Topstep's daily loss limit on a $50K eval is $1,000 (2%). Hit it intraday, the account is gone. The rule isn't optional. It's how the firm survives funding tens of thousands of evaluators.",
            "Internalize this rule before you even sign up for an eval. If you can't stop yourself voluntarily after a 3% personal loss in sim, you will never pass a prop eval — because the rules will stop you, painfully, after fewer trades than you needed to recover."
          ]
        },
        {
          heading: 'The objection you\'re going to have',
          body: [
            "Beginners look at 1% risk and think: \"At 1% on a $50K account, that's $500 per trade. I can only do 1-2 contracts on ES with a tight stop. That's nothing. I need to size up to make real money.\"",
            "This thought is the most common reason new traders blow up. Let me address it directly:",
            "**1.** $500 per trade × 4-5 trades per day × 50% win rate × 1.5 R:R = roughly $250-500/day expectancy on a $50K account. Annualized, that's 100%+ returns. If you're consistently profitable.",
            "**2.** \"If you're consistently profitable\" is doing all the work in that sentence. Most traders aren't. The 1% rule is designed for the world where you're not yet profitable. It buys you time to become profitable.",
            "**3.** Once you ARE consistently profitable across hundreds of trades, you can scale size up. Until then, every dollar you risk above 1% is a dollar more likely to ruin you than to enrich you.",
            "**4.** Prop firms exist precisely to solve the \"my account is too small to size up\" problem. Pass an eval, trade their capital, keep 80%+ of profits. The path is: prove edge on small size → access bigger size through prop. Not: skip proving edge and over-size personal capital."
          ]
        }
      ],
      diagram: 'risk_table',
      takeaways: [
        { id: 'm10.t1', text: 'Risk maximum 1% of account per trade. 0.5% for the first six months. Below 0.5% won\'t compound; above 2% kills accounts.' },
        { id: 'm10.t2', text: 'Stop trading after 3% daily loss or 3 consecutive losses, whichever first. Tilt is real and measurable.' },
        { id: 'm10.t3', text: 'A 5-loss streak at 5% risk = 25% drawdown = you need 33% to recover. Most don\'t.' },
        { id: 'm10.t4', text: 'Prop firms exist to solve "my account is too small". Don\'t over-size personal capital — prove edge first, then access prop capital.' }
      ],
      task: {
        title: 'Build your personal risk table',
        steps: [
          'Decide on a sim/practice starting account: e.g. $50,000.',
          'Calculate: 1% per trade = $X. 0.5% = $Y. 3% daily max = $Z.',
          'Now check: with a 4-point ES stop (typical), how many contracts does $X correspond to? (Hint: 1 contract × 4 points × $50/point = $200 risk per contract.)',
          'Repeat for 6, 8, and 10-point stops. You\'ll see: tighter stops let you size up; wider stops force you to size down. The dollar risk stays constant.',
          'Write the table: stop in points → max contracts at 1% risk. Stick this next to your screen. Reference it before every trade.'
        ]
      },
      quiz: [
        {
          q: 'You have a $40,000 account and risk 5% per trade. After 5 consecutive losses, your account is approximately:',
          options: [
            '$38,000 — manageable',
            '$36,000',
            '$31,400 — a 21% drawdown requiring 27% gain to recover',
            '$20,000'
          ],
          answer: 2,
          explain: '5% × 5 losses, compounded: $40k × 0.95^5 = $31,367. That\'s a 22% drawdown requiring ~28% gain to recover. This is why 5% per trade is reckless.'
        },
        {
          q: 'Your stop is 5 points away on ES. With $500 max risk per trade (1% of $50k), how many contracts can you trade?',
          options: [
            '1 contract',
            '2 contracts',
            '5 contracts',
            '10 contracts'
          ],
          answer: 1,
          explain: '1 ES contract × 5 points × $50 = $250 risk. $500 / $250 = 2 contracts. Always calculate before entry.'
        },
        {
          q: 'After 3 consecutive losses in one session, the right move is:',
          options: [
            'Increase size to "win it back"',
            'Stop trading for the day. Tilt is real and judgment is now degraded.',
            'Switch to a smaller timeframe',
            'Trade a different instrument'
          ],
          answer: 1,
          explain: 'Recovery psychology after 3 losses is one of the most consistent failure modes. Stop. Review tomorrow.'
        }
      ]
    },

    {
      id: 'm11',
      title: 'Stops: where they go and why',
      summary:
        "A stop is not a number. It's the price at which you've concluded the trade thesis was wrong. Place it where the structure invalidates, not where you're comfortable losing.",
      sections: [
        {
          heading: 'Two kinds of stops, and why most traders use the wrong one',
          body: [
            "**Structural stop:** placed at a price where the trade thesis is invalidated. If you're long because price held above support at 5800, your stop goes below 5800 — because if 5800 fails, your reason for being long is gone.",
            "**Account-based stop:** placed at a price that produces a comfortable dollar loss, regardless of structure. \"I'll risk $200, so I'll set a stop 4 points away.\"",
            "Beginners use account-based stops. Then they learn the painful lesson that the market doesn't care about your comfort. Setting a stop at 4 points when the structural stop is 6 points means you'll get stopped out by random noise before the trade has a chance.",
            "**The right approach:** structural stop first. Calculate the dollar risk. If it's too large for your account, **reduce position size, not the stop distance**. If it's still too large at 1 contract, the trade is too big for your account — skip it."
          ]
        },
        {
          heading: 'How to place a structural stop',
          body: [
            "**For a long trade:**",
            "- Below the most recent swing low that the trade respects.",
            "- Below the support level you're trading off of (give it a buffer of a few ticks — wicks happen).",
            "- Below the candle low of the rejection/entry candle, if shorter-term.",
            "**For a short trade:**",
            "- Above the most recent swing high.",
            "- Above the resistance level you're trading off of, with a tick or two buffer.",
            "- Above the entry candle high.",
            "**The buffer matters.** Stops placed exactly at the swing low get hit by random ticks. Stops placed 2-3 ticks beyond the level give the trade room to breathe without changing the underlying logic. The cost is a slightly larger loss if wrong, but a far higher probability of not being stopped out by noise.",
            "**Key habit: identify the stop BEFORE entering.** If you can't articulate the price at which you're wrong, you don't have a trade — you have a feeling."
          ]
        },
        {
          heading: 'Trailing stops: useful, but not always',
          body: [
            "A **trailing stop** moves with price as the trade goes in your favor, locking in gains. If you're long and price moves up 5 points, your trailing stop moves up 5 points too.",
            "**When trailing stops help:** in clear trend days, where price isn't going to retrace much. They let you capture extended moves without manually managing.",
            "**When trailing stops hurt:** in choppy conditions, where normal pullbacks within a continuation will hit the trail and exit you prematurely. You then watch the trade resume in your favor without you.",
            "**Practical rule:** for your first year, manage exits manually based on price action and structure, not automatic trails. Trailing is a tool for once you've internalized when trends are real and when they're chop. Beginners use trails and get whipsawed."
          ]
        },
        {
          heading: 'The rule you will be tempted to break',
          body: [
            "**Never widen a stop after entry.**",
            "Repeat. Never widen a stop after entry.",
            "Once you're in, the stop is fixed. If price approaches it, you do not move it further away because \"the trade just needs more room.\" That's the moment most traders take the loss that ruins them — because they widen and widen and eventually face a 5%+ loss they can't tolerate emotionally, leading to panic exits at the worst price.",
            "If you find yourself wanting to widen the stop, you're admitting the original stop was wrong. Better to take the small loss as planned, step away, and come back with a clearer head.",
            "**The discipline:** stop placed before entry, sized appropriately, then sacred. The stop is not negotiable. Either it gets hit (small planned loss) or it doesn't (move on with the trade)."
          ]
        }
      ],
      diagram: 'stop_placement',
      takeaways: [
        { id: 'm11.t1', text: 'Stop goes where the trade thesis is invalidated, not where the dollar loss feels comfortable.' },
        { id: 'm11.t2', text: 'For longs: below recent swing low or support, with 2-3 tick buffer. For shorts: above recent swing high or resistance, with buffer.' },
        { id: 'm11.t3', text: 'If the structural stop produces too much risk, reduce size — not stop distance. If still too much at 1 contract, skip the trade.' },
        { id: 'm11.t4', text: 'Never widen a stop after entry. Either it gets hit or it doesn\'t. Widening is how small losses become catastrophic ones.' }
      ],
      task: {
        title: 'Plot stops on real charts',
        steps: [
          'Open ES on a 15-minute chart. Pick 5 hypothetical entries from the last 5 days (long or short, doesn\'t matter — pick where you\'d have entered).',
          'For each, mark where the structural stop should go. Below swing low / support for longs, above for shorts. Use 2-3 tick buffer.',
          'Calculate dollar risk for each: stop distance in points × $50.',
          'Calculate: at 1% risk on a $50k account ($500), how many contracts could you have traded each?',
          'Notice: tighter setups let you size up, wider setups force smaller size. Both can work. The discipline is matching size to stop, not the other way around.'
        ]
      },
      quiz: [
        {
          q: 'You\'re long ES at 5800 with a structural stop at 5793 (7 points). Risk per contract is:',
          options: [
            '$50',
            '$175',
            '$350',
            '$700'
          ],
          answer: 2,
          explain: '7 points × $50 = $350 risk per contract. With $500 max risk (1% of $50k), you could trade 1 contract (1.4 rounded down). 2 contracts would be $700 — over the limit.'
        },
        {
          q: 'Your structural stop produces a $700 risk per contract, but your max risk is $500. The right move is:',
          options: [
            'Trade 1 contract anyway and accept the over-risk',
            'Move the stop closer to fit the risk',
            'Skip the trade or wait for a setup with a tighter structural stop',
            'Trade 0.5 contracts (impossible on ES)'
          ],
          answer: 2,
          explain: 'Cannot move the stop closer (gets you stopped by noise). Cannot fractionalize ES. Skip the trade or find one where the structural stop fits your risk budget. ES is also why MES exists — fractional sizing.'
        },
        {
          q: 'After entering, price moves against you and approaches your stop. The right action is:',
          options: [
            'Widen the stop because the trade needs more room',
            'Let the stop get hit, take the planned loss, move on',
            'Add to the position to lower the average price',
            'Cancel the stop and hope'
          ],
          answer: 1,
          explain: 'Widening a stop after entry is the most common path from small loss to catastrophic loss. Take the planned loss as a discipline. Adding (averaging down) is even worse — it doubles risk on a thesis that\'s already failing.'
        }
      ]
    },

    {
      id: 'm12',
      title: 'R-multiples and expectancy: do you actually have edge?',
      summary:
        "Expectancy is the math that tells you whether your trading is profitable on average. Most traders never calculate it. Most are surprised by what they find.",
      sections: [
        {
          heading: 'What R is, and why traders use it',
          body: [
            "**R = your initial risk on a trade, in dollars.** If your stop is set such that you'd lose $400 if hit, then for that trade, R = $400.",
            "Trade outcomes are then expressed as R-multiples. Lost the full stop? -1R. Hit a target equal to your stop distance? +1R. Hit a target twice the stop distance? +2R. Got stopped at half the loss because price moved against you and you exited early? -0.5R.",
            "**Why this matters:** raw dollar P/L means nothing across trades of different sizes. A $400 win on a $400 risk and a $400 win on a $200 risk are not the same. The first is +1R; the second is +2R. The second was a much better trade — the first was lucky to hit a 1:1 target.",
            "Expressing every trade as an R-multiple lets you compare across all your trades, regardless of position size, account size, or instrument. **R is the common currency.**"
          ]
        },
        {
          heading: 'Expectancy: the formula that decides profitability',
          body: [
            "**Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)**, where wins and losses are in R-multiples.",
            "Example: you win 50% of trades, with average win of +1.5R and average loss of -1R.",
            "Expectancy = (0.50 × 1.5R) - (0.50 × 1.0R) = 0.75R - 0.50R = +0.25R per trade.",
            "Means: on average, every trade you take produces +0.25R of profit. With 4 trades a day at $400 risk per trade, that's $400/day expectancy. Over 200 trading days, $80,000.",
            "Now flip the numbers: 50% win rate, +1R average win, -1R average loss. Expectancy = (0.50 × 1) - (0.50 × 1) = 0. Break even. Despite winning half your trades. Because your wins don't cover your losses.",
            "Or: 60% win rate, +0.7R average win, -1R average loss. Expectancy = (0.60 × 0.7) - (0.40 × 1) = 0.42 - 0.40 = +0.02R. Barely profitable, vulnerable to commissions and slippage.",
            "**Most amateur traders have negative expectancy and don't know it.** They remember winners and forget the magnitude of losers."
          ]
        },
        {
          heading: 'The two paths to positive expectancy',
          body: [
            "There are essentially two profiles of profitable trading:",
            "**High win rate, modest reward:** win 60-70% of trades with average +1R wins and -1R losses. Common with mean-reversion or scalping strategies. Feels good (lots of wins) but every loss feels disproportionately painful and tilt risk is high.",
            "**Lower win rate, large reward:** win 30-40% of trades with average +3R+ wins and -1R losses. Common with trend-following strategies. Feels bad (more losses than wins) but the wins are large enough to dominate. Requires high psychological tolerance for losing streaks.",
            "Both work mathematically. Most traders intuitively try to combine them — high win rate AND large rewards — but this is rare in practice because a tight stop (which produces large R wins) tends to get hit more often (lowering win rate). The market makes you choose.",
            "**For ES specifically:** trend days produce large R opportunities (+3R or more on a sustained move); range days reward smaller R targets at structure. Most traders develop a specific style that fits their personality. We'll cover playbook construction in Phase 5."
          ]
        },
        {
          heading: 'How to actually calculate your expectancy',
          body: [
            "You need a journal. The journal you built. After every trade, log: the R amount risked, the R amount won or lost, and the trade type/setup.",
            "After 30+ trades, you can compute:",
            "- Win rate: # winners / # total trades",
            "- Average win in R: sum of (winner R) / # winners",
            "- Average loss in R: sum of (loser R) / # losers, expressed as a positive (so it goes into the formula correctly)",
            "- Expectancy: as the formula above",
            "**30 trades is the minimum sample for any meaningful inference.** Below that, you're looking at variance, not signal. 100+ trades is where statistics start to stabilize.",
            "Calculate expectancy by setup type as well. Often a trader has 3 setups: one is highly profitable (+0.4R expectancy), one is break-even, one is a money-loser. Cutting the loser and trading more of the winner is the highest-leverage improvement most traders never make because they never measure."
          ]
        }
      ],
      diagram: 'expectancy',
      takeaways: [
        { id: 'm12.t1', text: 'R = the dollar risk on a trade. All outcomes are expressed in R-multiples for comparison across position sizes.' },
        { id: 'm12.t2', text: 'Expectancy = (win rate × avg win R) - (loss rate × avg loss R). Positive = profitable on average. Most amateurs have negative expectancy.' },
        { id: 'm12.t3', text: 'Two profiles work: high win rate with modest R, or low win rate with large R. Mixing both is rare.' },
        { id: 'm12.t4', text: 'Calculate expectancy by setup. The biggest improvement most traders never make is cutting their losing setup and trading their winning one more.' }
      ],
      task: {
        title: 'Calculate sample expectancy',
        steps: [
          'Take 10 hypothetical trades and assign outcomes: +1R, -1R, +2R, -1R, +1.5R, -0.5R, +1R, -1R, +2.5R, -1R.',
          'Wins: 5 out of 10 = 50% win rate.',
          'Sum of winners: +1 +2 +1.5 +1 +2.5 = +8R. Average win: 8/5 = 1.6R.',
          'Sum of losers (as positives): 1 + 1 + 0.5 + 1 + 1 = 4.5R. Average loss: 4.5/5 = 0.9R.',
          'Expectancy: (0.5 × 1.6) - (0.5 × 0.9) = 0.8 - 0.45 = +0.35R per trade.',
          'Now do this with 10 of your own past trades (or hypothetical ones if you haven\'t traded yet). Calculate. This is what you\'ll be doing forever.'
        ]
      },
      quiz: [
        {
          q: 'You risk $400 on a trade and win $600. The R-multiple of the trade is:',
          options: [
            '+0.67R',
            '+1R',
            '+1.5R',
            '+2R'
          ],
          answer: 2,
          explain: '$600 / $400 = 1.5R. Always express outcomes as multiples of the initial risk.'
        },
        {
          q: 'Win rate 60%, avg win +1R, avg loss -1R. Expectancy is:',
          options: [
            '+1R per trade',
            '+0.6R per trade',
            '+0.2R per trade',
            '0R per trade (break even)'
          ],
          answer: 2,
          explain: '(0.6 × 1) - (0.4 × 1) = 0.6 - 0.4 = +0.2R per trade. Profitable, but modest. A 60% win rate with 1:1 R is barely better than coin flip.'
        },
        {
          q: 'A trader has three setups. Setup A: +0.5R expectancy over 50 trades. Setup B: -0.1R over 50 trades. Setup C: +0.05R over 30 trades. The single highest-leverage change is:',
          options: [
            'Trade more of all three',
            'Stop trading Setup B; trade Setup A more',
            'Increase size on Setup C',
            'Add a fourth setup'
          ],
          answer: 1,
          explain: 'Setup B is bleeding capital. Cutting it removes the bleed. Setup A is the engine — trade more of what works. This is the single most consistent improvement amateur traders never make because they never measure.'
        }
      ]
    },

    {
      id: 'm13',
      title: 'Drawdown psychology and the Kelly trap',
      summary:
        "Even profitable systems produce uncomfortable drawdowns. Understanding the math beforehand keeps you from breaking the system mid-stride. And: why optimal sizing is smaller than you think.",
      sections: [
        {
          heading: 'Drawdown is not failure',
          body: [
            "If you have +0.3R expectancy with a 50% win rate, what do you think your worst drawdown will be over 1,000 trades?",
            "Math (run via simulation across many runs): the typical worst drawdown is 12-18R. The 95th-percentile worst drawdown is 25R+. **A profitable system will, often, draw down 25 times its average risk before recovering.**",
            "This means: a trader risking $400/trade with positive expectancy will routinely see periods of $5,000-$10,000 drawdown. Not because they're bad — because that's what variance looks like.",
            "**Most traders abandon their system during a normal drawdown, thinking it's broken.** They switch strategies, only for the new strategy to enter its own drawdown phase. They cycle through systems forever, never giving any one a chance to show its expectancy.",
            "The discipline is to *expect* drawdowns of 15-20R as a routine occurrence, not a crisis. If you've never quantified this in advance, the first time it happens you'll panic. Quantify it now."
          ]
        },
        {
          heading: 'The path-dependence trap',
          body: [
            "Two traders, identical edge, identical 100-trade sequence. Both end with +30R total profit.",
            "Trader A's sequence starts with 8 wins in a row, then a normal mix.",
            "Trader B's sequence starts with 8 losses in a row, then a normal mix.",
            "After trade 8, Trader A is up +8R and confident. Trader B is down -8R, in 16% drawdown if at 2% risk, and questioning everything.",
            "Both end at the same place. But Trader B is much more likely to quit, change systems, or size down at the wrong moment, never reaching the +30R.",
            "**Path matters.** If you start with a losing sequence (which happens by chance to many otherwise-profitable traders), you must hold the line. The math says the system will return to expectancy if you stay sized correctly. The psychology says \"this isn't working,\" and most traders listen to the psychology.",
            "**This is why you size at 1% — not because the math demands it, but because at 1% a 15R drawdown is 15% of account, painful but recoverable. At 5% it's 75%, mathematically and emotionally lethal.**"
          ]
        },
        {
          heading: 'The Kelly criterion and why you shouldn\'t use it',
          body: [
            "There's a formula called the **Kelly criterion** that calculates the \"optimal\" position size to maximize long-term growth, given your edge. For a 60%-win-rate, 1:1 R/R system, Kelly says risk 20% per trade.",
            "**Kelly is mathematically right and practically suicidal.** Three reasons:",
            "**1. Estimation error.** Kelly requires you to know your true edge. You don't. You estimate it from a small sample. If your true win rate is 55% but you observed 60% by chance, Kelly tells you to risk 20% when the optimal is 10%. Wrong by a factor of 2.",
            "**2. Drawdown depth.** At full Kelly, expected drawdown reaches 50% routinely. No human (or institutional risk manager) can sit through that.",
            "**3. Non-stationarity.** Markets change. Your edge today may not be your edge in 6 months. Sizing for current edge while edge degrades = ruin.",
            "**Practical rule used by most professional traders: size at fractional Kelly, typically 1/4 to 1/10 of full Kelly.** For most retail traders this works out to... 1-2% per trade. Which is exactly what we said in module 10. The 1% rule isn't conservative; it's roughly 1/10 Kelly, which is what professional desks use after accounting for estimation error and emotional capacity."
          ]
        },
        {
          heading: 'The hidden brutal truth',
          body: [
            "You will, at some point, have a 10-trade losing streak. Not because you're bad — because losing streaks are statistically inevitable.",
            "When it happens, three things will be true simultaneously:",
            "**1.** The math will say: hold size, follow the system, expectancy returns.",
            "**2.** Your gut will say: something is broken, change everything.",
            "**3.** Your account will be down 10% (at 1% risk) or 50% (at 5% risk).",
            "Which voice you listen to determines whether you survive. Most people who blow up don't lack edge — they lack the framework to interpret normal variance as normal.",
            "**Your job in advance is to internalize that drawdowns of 10-20R are routine, that path matters, and that the answer is never to size up to recover.** When in drawdown, size down or stop, never up."
          ]
        }
      ],
      diagram: 'drawdown_curve',
      takeaways: [
        { id: 'm13.t1', text: 'Even profitable systems routinely draw down 15-25R. This is variance, not failure. Plan for it.' },
        { id: 'm13.t2', text: 'Path matters: same edge can produce wildly different early experiences. Most quitters quit during normal drawdowns.' },
        { id: 'm13.t3', text: 'Kelly is mathematically optimal but practically suicidal due to estimation error and drawdown depth. Use 1/10 Kelly = roughly 1% per trade.' },
        { id: 'm13.t4', text: 'When in drawdown, size down or stop. Never size up to "recover faster." That\'s the most consistent path to ruin.' }
      ],
      task: {
        title: 'Pre-commit your drawdown plan',
        steps: [
          'Write down: "I expect drawdowns of 10-15R as routine, and 20-25R as occasional. These are not signals to change systems."',
          'Write down: "If I draw down 5R in a week, I size down by 50% until I recover above breakeven."',
          'Write down: "If I draw down 10R, I stop trading for 1-2 days, review my journal for execution errors, and resume only after I have a clear plan."',
          'Write down: "If I draw down 20R, I take a full week off. The market will be there. I will not."',
          'Sign and date the document. Reference it before you start each session.'
        ]
      },
      quiz: [
        {
          q: 'A profitable trader with positive expectancy will most likely:',
          options: [
            'Never have a drawdown',
            'Have drawdowns of 15-25R as a routine part of trading',
            'Only have small drawdowns under 5R',
            'Have 50%+ drawdowns regularly'
          ],
          answer: 1,
          explain: 'Variance produces drawdowns of 15-25R routinely even with positive expectancy. Planning for this in advance is what separates traders who survive from those who quit during normal variance.'
        },
        {
          q: 'After 8 consecutive losses, the right action is:',
          options: [
            'Size up to recover faster',
            'Hold size and stay disciplined; if drawdown becomes severe, size down or stop',
            'Switch to a new strategy',
            'Add to the next losing position to lower the average'
          ],
          answer: 1,
          explain: 'Sizing up in drawdown is the most reliable path to account destruction. Sizing down or pausing preserves capital while you assess. Switching strategies forces you to re-prove edge from scratch — the new system will also have drawdowns.'
        },
        {
          q: 'The Kelly criterion suggests 20% risk per trade for your system. You should:',
          options: [
            'Use 20% — the math is the math',
            'Use 1-2% (roughly 1/10 Kelly) because Kelly is fragile to estimation error and drawdown is unbearable at full Kelly',
            'Use 50% to be aggressive',
            'Ignore math entirely'
          ],
          answer: 1,
          explain: 'Full Kelly assumes perfect knowledge of edge, which you don\'t have, and produces drawdowns no human can tolerate. Fractional Kelly (1/10) is what professionals actually use, which lands at roughly 1-2% per trade.'
        }
      ]
    }
  ]
};
