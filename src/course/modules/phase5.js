// Phase 5 — Strategy & Playbook
// Modules m18..m21

export const phase5 = {
  id: 'p5',
  title: 'Strategy & Playbook',
  description:
    "Build your own simple, testable playbook. The setups, the rules, and the discipline to test before going live.",
  modules: [
    {
      id: 'm18',
      title: 'What a playbook is, and why you need one',
      summary:
        "A playbook is a small written collection of rule-based setups that you trade and only those. The opposite of \"taking what the market gives me\" is what makes a trader consistent.",
      sections: [
        {
          heading: 'The playbook concept',
          body: [
            "A trader without a playbook has thousands of choices every session: which setups to take, which to skip, how big, when to exit, when to reverse. Each choice is a moment of cognitive load. Cognitive load drains decision quality fast.",
            "A trader with a playbook has 2-3 specific setups they take and only those. Every other pattern on the chart, they ignore. The playbook narrows the universe of decisions to a manageable handful.",
            "**A setup in a playbook contains:**",
            "- **Trigger conditions:** what specific market state must be true (e.g. \"VWAP reclaim after a 3-touch low test, with HTF in uptrend\").",
            "- **Entry:** exact entry rule (e.g. \"buy on close of first 5-min candle that closes above VWAP after the test\").",
            "- **Stop:** exact stop rule (e.g. \"below the swing low of the test, +3 tick buffer\").",
            "- **Target:** exact profit-taking rule (e.g. \"first target at +2R, partial 50%; trail stop on remainder to +1R\").",
            "- **Invalidation:** any condition that means \"don't take this trade\" or \"abort if happens after entry\" (e.g. \"if news event in next 30 min, skip\").",
            "**Every part of every rule should be specific enough that two different traders looking at the same chart would identify the trade identically.** \"Trade pullbacks\" is not a setup. \"Long entry on a 5-min close above VWAP, after price has tested VWAP from below at least once with a clear rejection wick, in an uptrend on the 1-hour chart\" is a setup."
          ]
        },
        {
          heading: 'Why specificity matters',
          body: [
            "Two traders with vague rules will execute differently every day, even with the same chart, because vague rules permit interpretation. Interpretation is where bias creeps in: \"that pullback wasn't quite deep enough\" → skip when you should have taken; \"that breakout looks promising even though it's against the trend\" → take when you should have skipped.",
            "**Specific rules eliminate interpretation in the moment.** They were written when you were calm and analytical. They get followed in the heat of trading.",
            "This is also what makes the playbook **testable**. You cannot backtest \"trade pullbacks.\" You can backtest \"long on a 5-min close above VWAP after a tested rejection in an uptrend.\" The first is opinion; the second is a rule."
          ]
        },
        {
          heading: 'How many setups should a playbook contain?',
          body: [
            "**For a beginner: 1-2 setups.** Master one before adding a second.",
            "**For an intermediate: 2-4 setups.** Each tested independently, each with its own measured expectancy.",
            "**For an advanced trader: 4-7 setups maximum.** More than that and you can't track them or maintain quality.",
            "**Why so few?** Because each setup needs:",
            "- Enough screen time to recognize in real time without hesitation",
            "- Enough trades (50+) to estimate expectancy with confidence",
            "- Active mental load to execute correctly",
            "Three setups times 50 trades each = 150 trades minimum to validate. That's months of trading. Most beginners try to build a 10-setup playbook before they've validated one. Result: they never know which setup is profitable, because none of them have a meaningful sample.",
            "**Pick one. Trade only it for 50 trades. Measure expectancy. Add a second if and only if the first is positive expectancy. Keep going.**"
          ]
        },
        {
          heading: 'The setups beginners should consider',
          body: [
            "Three high-quality setups commonly used as starting points for new ES traders:",
            "**1. VWAP reclaim in trend.** Higher-timeframe (1H+) is in an uptrend. Price pulls back to VWAP, tests, rejects with a long lower wick or clear rejection candle, then closes back above VWAP. Long entry on the close. Stop below the test. Target +2R or next HH.",
            "**2. Failed Initial Balance break.** Price breaks above (or below) the IB high/low after 10:30am ET, then within 1-2 candles closes back inside the IB range. Short entry on the reclaim (for a failed long break). Stop above the failed-breakout high. Target opposite side of IB.",
            "**3. Higher-low support test.** In an uptrend, price pulls back to the most recent HL or to a flagged support zone. Test, hold, bounce. Long entry on the bounce candle close. Stop below the swing low of the test. Target prior HH or +2R.",
            "**Pick one of these three.** Trade ONLY it for 50 trades on sim. After 50, measure. If expectancy is positive, you've got a building block. If not, you need to refine the setup or pick another."
          ]
        }
      ],
      diagram: 'playbook',
      takeaways: [
        { id: 'm18.t1', text: 'A playbook is a small set of rule-based setups. Specificity (testable, executable without interpretation) matters more than completeness.' },
        { id: 'm18.t2', text: 'Each setup needs trigger, entry, stop, target, and invalidation rules — written, specific.' },
        { id: 'm18.t3', text: 'Beginner: 1-2 setups. Trade ONLY those for 50+ trades each before adding more.' },
        { id: 'm18.t4', text: 'Three good starting setups: VWAP reclaim in trend, failed IB break, HL support test in uptrend.' }
      ],
      task: {
        title: 'Write your first setup',
        steps: [
          'Pick ONE of the three setups above.',
          'In your journal or a separate document, write out: trigger conditions, entry rule, stop rule, target rule, invalidation rule. Be specific to the point that another trader could read it and execute identically.',
          'Add: "Required confluence" — what other factors must be present (HTF trend alignment, key level confluence, volume?).',
          'Add: "Skip if" — list 3-5 conditions that mean don\'t take the setup even if the trigger fires (news, low liquidity, extended already, etc.).',
          'Print or save this as a single page. Reference it before every trade. Trade NOTHING that doesn\'t match the page.',
          'You now have a playbook of one. The discipline is to keep trading only this for the next 50 trades.'
        ]
      },
      quiz: [
        {
          q: 'A good playbook setup is one that:',
          options: [
            'Sounds clever',
            'Is specific enough that two different traders looking at the same chart would identify the trade identically',
            'Wins every time',
            'Never produces losses'
          ],
          answer: 1,
          explain: 'Specificity is what makes a setup testable, repeatable, and executable without interpretation. Vague setups produce inconsistent results and can\'t be backtested.'
        },
        {
          q: 'For a beginner, the right number of setups in a playbook is:',
          options: [
            '10+',
            '5-7',
            '1-2, mastered before adding more',
            'No setups — pure intuition'
          ],
          answer: 2,
          explain: 'Each setup needs 50+ trades to validate. With 1-2 setups, this is achievable. With 10, you never gather enough data per setup to know what works.'
        },
        {
          q: 'You\'ve traded one setup for 30 trades and have +0.4R expectancy. The right next move is:',
          options: [
            'Add 5 more setups immediately',
            'Continue to 50+ trades to validate, then consider adding a second setup',
            'Quit trading',
            'Triple position size'
          ],
          answer: 1,
          explain: '30 trades is suggestive but not statistically robust. 50+ trades gives you confidence in expectancy. Then you can responsibly add a second setup, validating it the same way. Patience here pays for itself many times over.'
        }
      ]
    },

    {
      id: 'm19',
      title: 'Backtesting and replay practice',
      summary:
        "Before risking money on a setup, validate it on historical data. Backtesting and chart replay are the cheapest way to find out a setup doesn't work.",
      sections: [
        {
          heading: 'Why backtest at all',
          body: [
            "Trading any setup live without testing it is paying tuition to learn what could have been learned for free.",
            "Backtesting answers: \"If I had been trading this exact setup on the last 6 months of data, what would have happened?\"",
            "If the answer is positive expectancy across 100+ historical trades, you have evidence — not proof, evidence — that the setup has edge. If the answer is negative or break-even, the setup isn't ready and you would have lost money trading it live.",
            "**Key caveat:** backtesting on historical data is not the same as live performance. Markets change. A setup that worked 2 years ago might not work now. But a setup that didn't work historically is unlikely to work going forward — historical backtest is necessary but not sufficient.",
            "**Anything that can't be backtested isn't a real setup.** It's an opinion. The act of formalizing your rules well enough to backtest them is itself the most useful thing about backtesting."
          ]
        },
        {
          heading: 'How to actually backtest a setup on ES',
          body: [
            "**Manual backtesting via chart replay** is the standard for discretionary traders. Most platforms (TradingView, NinjaTrader, Sierra Chart) have a replay or bar-replay mode. You scroll back to a point in history and step the chart forward bar by bar.",
            "**Procedure:**",
            "1. Pick a 6-month window of ES data, e.g. the last 6 months. (You want enough data for 100+ setup occurrences but not so much that the regime is different from now.)",
            "2. In replay mode, step through bar by bar. When your setup triggers, record: entry price, stop price, target, the trade outcome (hit target, hit stop, time-stopped at end of session, etc.), and any context (day type, HTF trend, news on calendar).",
            "3. Continue until you have 50-100 occurrences.",
            "4. Calculate: win rate, average win in R, average loss in R, expectancy, max drawdown sequence.",
            "**This is slow.** Plan for 4-8 hours of focused replay work. Don't try to do this while distracted; you'll miss setups or fudge entries. Give it a real session.",
            "**Don't cheat.** If a candle you can already see suggests the next move, don't peek and use that to filter your setup. Use only information available at the moment of the entry trigger. Otherwise your backtest is fantasy."
          ]
        },
        {
          heading: 'Common mistakes that invalidate backtests',
          body: [
            "**Hindsight bias:** \"That was an obvious skip — I would have known.\" Maybe. Probably not. If your setup rules don't say to skip, your live trading wouldn't have skipped either. Be honest.",
            "**Cherry-picking the period:** testing only the period that worked best for the setup. Test multiple non-overlapping windows. If the setup works in three different 6-month windows, that's robustness. If it works only in one, it's fitting to noise.",
            "**Loose rules:** \"This wasn't really my setup\" — said about losers, never winners. If the rules are loose enough that you can disqualify trades retroactively, the rules are too loose for live trading.",
            "**Ignoring context:** counting trades that happened during FOMC announcements, holidays, or other anomalies. Either include them all (live, you'll face them) or define explicit \"skip\" rules for those days, but don't quietly omit.",
            "**Mismeasuring R:** rounding favorable, ignoring slippage. Real ES trading has 0.25-1 tick of slippage on average market orders, and sometimes much more during fast moves. Bake in conservative slippage assumptions: 1 tick per trade entry and 1 tick per trade exit, minimum."
          ]
        },
        {
          heading: 'After backtest: paper trade live',
          body: [
            "Backtest validates the rules historically. **Paper trading (simulator)** validates that you can execute the rules in real time, with real psychological pressure (even if the money is fake).",
            "**Procedure:**",
            "1. After 100 backtest trades show positive expectancy, switch to sim trading.",
            "2. Trade only your validated setup, on live data, in a simulator account.",
            "3. Target 30-50 sim trades. Same metrics as backtest.",
            "4. **Compare sim performance to backtest.** If sim expectancy is meaningfully worse than backtest, the issue is execution, not the setup. Review your sim journal: missed entries, late stops, exited targets early, etc.",
            "**Most traders are surprised by how much worse their sim performance is than their backtest.** This is execution risk made visible. The cure is more sim time and disciplined journal review of execution errors.",
            "**Only after sim trading shows expectancy similar to backtest** should you consider real money. And even then, start at minimum size (1 ES contract, or MES if you wanted to be smart) and scale up only with continued evidence of edge in live conditions."
          ]
        }
      ],
      diagram: 'backtest_flow',
      takeaways: [
        { id: 'm19.t1', text: 'Backtest before sim. Sim before live. Live small before scaling. Skipping steps is paying tuition the hard way.' },
        { id: 'm19.t2', text: 'Manual chart replay through 100+ historical setup occurrences gives you evidence (not proof) of edge.' },
        { id: 'm19.t3', text: 'Be brutally honest in backtest: no hindsight, no cherry-picking, no loose rules. Bake in conservative slippage.' },
        { id: 'm19.t4', text: 'Sim trading reveals execution error. If sim expectancy is much worse than backtest, the issue is you, not the setup.' }
      ],
      task: {
        title: 'Backtest your one setup, 50 trades minimum',
        steps: [
          'Open ES on a chart with replay/bar-replay mode (TradingView Replay is free; NinjaTrader Market Replay requires data).',
          'Set replay starting point to 6 months ago. Use the timeframe your setup uses (5-min or 15-min for most intraday setups).',
          'Step bar by bar through the data. When your setup triggers, log it: date, time, entry, stop, target, outcome.',
          'Aim for 50 setup occurrences minimum.',
          'After: calculate win rate, avg win R, avg loss R, expectancy. Document the result.',
          'Be honest. If expectancy is negative or break-even, refine the setup or pick a different one. Do not proceed to sim with a setup that didn\'t backtest well.'
        ]
      },
      quiz: [
        {
          q: 'The right order of validation for a new setup is:',
          options: [
            'Live trading first, then backtest',
            'Backtest, then sim, then small live, then scale',
            'Sim only',
            'No validation, just execute'
          ],
          answer: 1,
          explain: 'Backtest validates the rules. Sim validates execution. Small live validates real psychology. Scaling validates robustness. Each step earns the next.'
        },
        {
          q: 'Cherry-picking the test period is when you:',
          options: [
            'Trade only at the open',
            'Test only the period where the setup worked best, ignoring periods it didn\'t',
            'Use ES instead of MES',
            'Use 5-minute charts'
          ],
          answer: 1,
          explain: 'Cherry-picking inflates apparent edge. Testing across multiple non-overlapping periods reveals robustness vs. noise-fitting. Always test multiple windows.'
        },
        {
          q: 'Your backtest shows +0.5R expectancy, but in 30 sim trades your expectancy is +0.05R. The most likely cause is:',
          options: [
            'The setup stopped working',
            'Execution error: late entries, mismanaged stops, early exits — visible in real time pressure',
            'Bad luck only',
            'The market is broken'
          ],
          answer: 1,
          explain: 'Sim performance much worse than backtest is almost always execution. Real-time decisions diverge from backtest assumptions. The cure is journal review and more sim time, not abandoning the setup.'
        }
      ]
    },

    {
      id: 'm20',
      title: 'Sim trading: rules, mindset, and the trap',
      summary:
        "Sim is essential and dangerous. Essential because it's where you learn execution. Dangerous because it can lull you into thinking you're ready when you're not.",
      sections: [
        {
          heading: 'How to use the simulator productively',
          body: [
            "**Treat sim like real money.** Same size you'd trade live, same risk discipline, same journal entries. If you wouldn't risk $500 on a trade live, don't risk it in sim. The simulator is only useful if it mimics live conditions and decisions.",
            "**Trade only your validated setup.** Sim is not for exploring random ideas. It's for executing your one tested setup in real time and measuring how closely your execution matches the backtest.",
            "**Journal every sim trade.** Date, setup, entry, stop, target, outcome, R-multiple, execution notes. The journal you built into this app — use it. Sim trades count as data.",
            "**Run sim for at least 50-100 trades before considering live.** Less and you don't have a real sample of execution under pressure."
          ]
        },
        {
          heading: 'Why sim feels different from live',
          body: [
            "Even with perfect execution discipline, sim and live differ in three measurable ways:",
            "**1. Slippage is often understated in sim.** Most simulators fill at the mid or at the asked price. Live, you'll get filled with the bid-ask spread (already factored if you use limits) plus occasional poor fills during fast moves.",
            "**2. Psychological pressure is muted.** Watching $200 of fake money disappear is not the same as watching $200 of real money. Real losses produce visceral reactions that sim cannot simulate.",
            "**3. Execution latency varies.** Sim platforms generally execute instantly. Live, market orders sometimes slip during volatile windows. Limit orders sometimes don't fill when you expect.",
            "**The result:** live performance is reliably 10-30% worse in expectancy than sim, even with strict discipline. Sim that shows +0.3R expectancy may be break-even live. Sim that shows +0.5R expectancy may be +0.3R live.",
            "**Plan for this.** Don't size up live based on sim performance — size down, expecting some degradation, and scale up only with evidence."
          ]
        },
        {
          heading: 'The sim graduation criteria',
          body: [
            "You're ready to leave sim and start small live trading when ALL of:",
            "**1.** 50+ sim trades on a single validated setup, with positive expectancy of at least +0.2R after slippage adjustments.",
            "**2.** Discipline metrics: at least 90% of sim trades are valid setups (i.e., you took only the setup, not random trades). Stop discipline: never moved a stop after entry. Daily loss limit: respected on every session.",
            "**3.** Execution quality: average slippage matches realistic assumptions. Few or no \"missed\" entries that you should have taken.",
            "**4.** Journal review: you can articulate, after every losing trade, what went wrong (was it valid setup that just didn't work, or was it an execution error?).",
            "**If any of these aren't met, more sim, not live.** Sim is cheap. Live mistakes are expensive. The sim phase is your last opportunity to learn for free."
          ]
        },
        {
          heading: 'The sim trap: false confidence',
          body: [
            "The opposite failure mode: traders who become *too* comfortable in sim, see consistent profits, and assume live will be the same. Then take small live and find their performance has collapsed.",
            "**Sim isn't real, and there's a part of your brain that knows it.** That part lets you take trades you wouldn't take with real money. It lets you accept losses that would tilt you live. It hides the real test of psychology.",
            "**The remedy:** the moment you go live, start at the minimum viable size. 1 ES contract, or 1 MES contract. The dollar amount should be small enough that 5 losses in a row is unpleasant but not damaging. Get 50+ live trades at this size before scaling.",
            "**You will perform worse live than sim.** This isn't pessimism; it's empirical. Plan for it, size accordingly, and earn your way up to bigger size with evidence."
          ]
        }
      ],
      diagram: 'sim_to_live',
      takeaways: [
        { id: 'm20.t1', text: 'Treat sim like real money: same size, same discipline, same journal. Otherwise sim is wasted.' },
        { id: 'm20.t2', text: 'Live performance is typically 10-30% worse than sim due to slippage, psychology, and execution variance.' },
        { id: 'm20.t3', text: 'Sim graduation: 50+ trades on validated setup, +0.2R expectancy minimum, perfect discipline metrics, articulate post-trade review.' },
        { id: 'm20.t4', text: 'Going live, start at minimum size. Earn scale with evidence, not enthusiasm.' }
      ],
      task: {
        title: 'Set up your sim discipline',
        steps: [
          'Open your broker\'s sim account (Tradovate has a free sim; NinjaTrader has a connected sim).',
          'Set the starting balance to a realistic number you\'d actually trade with — not $1M for fun. $50,000 if you might go to a $50K prop eval is reasonable.',
          'Set a daily loss limit in your head: $1,500 (3%). Stop trading at that level even in sim.',
          'Trade ONLY your validated setup. Skip everything else.',
          'After every sim session, log every trade in your journal app. Calculate running expectancy.',
          'Plan: 50 sim trades minimum before considering live. No exceptions.'
        ]
      },
      quiz: [
        {
          q: 'A common reason sim performance overstates live performance is:',
          options: [
            'Sim software is buggy',
            'Sim understates slippage and removes psychological pressure',
            'Sim fees are higher',
            'Live data is wrong'
          ],
          answer: 1,
          explain: 'Sim usually fills at favorable prices and removes the visceral feel of real losses. Both effects make sim look better than live will be. Plan for 10-30% degradation.'
        },
        {
          q: 'You should leave sim for live trading when:',
          options: [
            'You feel ready',
            'After 5 sim trades go well',
            'After 50+ sim trades on a validated setup with positive expectancy and full discipline',
            'When you run out of sim time'
          ],
          answer: 2,
          explain: 'Sim graduation requires sample size, expectancy, and discipline metrics. Feeling ready is not enough. Numbers matter.'
        },
        {
          q: 'When you finally go live for the first time, the right initial position size is:',
          options: [
            'Whatever you traded in sim',
            'Larger, since you\'re finally ready',
            'The minimum: 1 contract on the smaller instrument (or 1 ES if that\'s within 1% risk), accepting performance degradation',
            'Aggressive, to compound fast'
          ],
          answer: 2,
          explain: 'Live performance reliably drops below sim. Start small. Earn size with live evidence. The first 50 live trades are diagnostic, not income — get cheap data on yourself.'
        }
      ]
    },

    {
      id: 'm21',
      title: 'The journal review loop: how you actually improve',
      summary:
        "Trading is a feedback-driven skill. The journal IS the feedback. Without disciplined journal review, you're just generating noise — repeating mistakes without knowing it.",
      sections: [
        {
          heading: 'Why most traders don\'t improve',
          body: [
            "The hard truth: most traders trade for years without getting meaningfully better. They take the same setups, make the same mistakes, blow up the same way.",
            "Why? Because trading provides terrible natural feedback. Outcomes are noisy: a good decision can lose, a bad decision can win. You can't tell from a single trade whether you executed well.",
            "The only way to extract signal from the noise is **systematic post-trade review**. Looking at trades not as wins/losses, but as decisions. Was the setup valid? Was the entry on time? Was the stop placed correctly and respected? Was the exit by rule or by emotion?",
            "**Without this review, your improvement is random.** Some habits get reinforced (good or bad), others fade. With review, you can identify what's actually working and what isn't, and intentionally adjust."
          ]
        },
        {
          heading: 'The minimum viable journal entry',
          body: [
            "After every trade, log:",
            "- **Date and time of entry/exit**",
            "- **Setup used** (one of your defined playbook setups, or \"off-playbook\" — ideally never the latter)",
            "- **Entry price, stop price, target price** (planned)",
            "- **Exit price** (actual)",
            "- **R-multiple** (outcome divided by initial risk)",
            "- **Day type** if you can identify it (normal, trend, neutral)",
            "- **Notes:** one sentence on what went right or wrong. Specifically, did you follow your rules? If not, where did you deviate?",
            "Your journal app already captures most of these. Add a daily note section if you want longer reflections.",
            "**The minimum is: every trade gets a journal entry. No exceptions.**"
          ]
        },
        {
          heading: 'The weekly review',
          body: [
            "Once a week, sit down with your journal and review every trade from the past week. Ask:",
            "**1. Setup quality:** were all trades valid setups? Or did some sneak in that didn't fit my playbook? (Off-playbook trades are the #1 leak for most traders.)",
            "**2. Execution quality:** for each trade, did I enter on the trigger, set the stop correctly, and exit by rule? Or were there execution errors?",
            "**3. By-setup expectancy:** how is each playbook setup performing this week? Compare to your backtest baseline.",
            "**4. Patterns in losses:** are losses concentrated in particular conditions (specific time of day, specific day types, specific market conditions)? This is signal.",
            "**5. Patterns in wins:** what was working? Same question, opposite direction.",
            "**Most useful single question:** \"What 1-2 changes would have improved my performance this week without changing my setups?\" Often: better execution, better day-type filtering, fewer off-playbook trades.",
            "**The goal isn't to dwell on losses.** The goal is to extract learnings, write them down as concrete adjustments, and apply them next week. Journal review without action is therapy. Journal review with action is improvement."
          ]
        },
        {
          heading: 'The monthly deep review',
          body: [
            "Once a month, do a longer review:",
            "**1. Overall expectancy** by setup, with sample size for each. Has any setup degraded? Any setup ready to be added or pruned?",
            "**2. Drawdown analysis:** what was the worst sequence? Was it within expected variance, or was it caused by specific repeated errors?",
            "**3. Behavioral metrics:** number of off-playbook trades, number of moved stops (should be 0), number of revenge trades (should be 0), number of skipped setups that you regret skipping.",
            "**4. Adjustments to make for next month:** specific, written, measurable. \"I will only trade between 9:30am and 11am ET.\" \"I will skip any trade where the daily ATR is below 30.\" Etc.",
            "**5. The big question:** is your trading getting better, plateauing, or declining over the trailing 3 months?",
            "**This monthly review is what compounds.** Small improvements every month become large improvements over a year. Most traders don't do this and wonder why their results are flat. The review IS the improvement mechanism."
          ]
        }
      ],
      diagram: 'review_loop',
      takeaways: [
        { id: 'm21.t1', text: 'Trading provides terrible natural feedback because outcomes are noisy. Systematic review is how signal is extracted.' },
        { id: 'm21.t2', text: 'Every trade gets a journal entry. No exceptions. The minimum is setup, R, and a one-line note on what went right/wrong.' },
        { id: 'm21.t3', text: 'Weekly review: setup quality, execution quality, patterns in wins/losses, 1-2 changes for next week.' },
        { id: 'm21.t4', text: 'Monthly review: expectancy by setup, drawdown analysis, behavioral metrics, adjustments. This is what compounds improvement.' }
      ],
      task: {
        title: 'Set up your weekly review ritual',
        steps: [
          'Pick a fixed time each week for review. Sunday morning is common — calm, and prepares you for the week ahead.',
          'Block 30-60 minutes for it.',
          'Open your journal app. Filter to the past week.',
          'For each trade, ask: was it a valid setup? Was execution clean? What 1-2 things would have improved performance?',
          'Write down the 1-2 takeaways for next week. Actionable, measurable.',
          'Repeat every week. Skip a week and the discipline breaks.',
          'After 8 weeks, you\'ll see the leverage: small adjustments compounding into measurably better trading.'
        ]
      },
      quiz: [
        {
          q: 'The reason most traders don\'t improve over time is:',
          options: [
            'They lack natural talent',
            'They don\'t have access to good information',
            'They don\'t systematically review their trades, so they can\'t extract signal from noisy outcomes',
            'The market is rigged'
          ],
          answer: 2,
          explain: 'Trading provides poor natural feedback. Without disciplined review, mistakes get repeated invisibly and improvements happen by accident. Review is the improvement mechanism.'
        },
        {
          q: 'In a weekly review, the most useful single question is:',
          options: [
            '"How much money did I make?"',
            '"What 1-2 changes would have improved my performance this week without changing my setups?"',
            '"Should I switch strategies?"',
            '"Did I have fun?"'
          ],
          answer: 1,
          explain: 'This question forces specificity and action. It separates execution issues (fixable) from setup issues (deeper). And it produces concrete adjustments, not vague self-criticism.'
        },
        {
          q: 'An "off-playbook" trade is one that:',
          options: [
            'Was profitable',
            'Was taken outside the trader\'s defined playbook setups — usually impulsive or rationalized in the moment',
            'Was placed via a paper journal',
            'Is in a different instrument'
          ],
          answer: 1,
          explain: 'Off-playbook trades are the #1 leak for most retail traders. They show up in the journal as "I just felt like..." or "the chart looked good." Eliminating these is often the single highest-leverage improvement.'
        }
      ]
    }
  ]
};
