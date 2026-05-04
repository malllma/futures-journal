// Phase 6 — Psychology & Prop Eval
// Modules m22..m24

export const phase6 = {
  id: 'p6',
  title: 'Psychology & Prop Eval',
  description:
    "How your brain sabotages you, and how to fund a trading career through prop firms instead of risking your own savings. Topstep and MFFU rules, mechanics, and the math of passing.",
  modules: [
    {
      id: 'm22',
      title: 'Trading psychology: the failure modes that get most traders',
      summary:
        "Tilt, revenge trading, FOMO, and overconfidence are the four horsemen. Knowing them by name doesn't immunize you, but it's a precondition for managing them.",
      sections: [
        {
          heading: 'The setup: trading is hostile to your brain',
          body: [
            "Your brain evolved to keep you alive in a small tribe of 100 people. It didn't evolve to make calm probabilistic decisions about $50,000 of leveraged exposure while you stare at green and red flashing numbers.",
            "What this means in practice: under stress (a losing trade, a fast market, an account drawdown), your brain reverts to evolutionary defaults that are exactly wrong for trading. Loss aversion makes you hold losers too long. Sunk-cost fallacy makes you double down. Tribal validation seeking makes you copy the loud people in chat rooms. Pattern-matching makes you see setups that aren't there.",
            "**The professional trader is not the one without these instincts. They're the one who has built systems and habits that prevent the instincts from controlling the click.**",
            "There are four specific failure modes that produce 90% of preventable trading losses. Know each by name. Catch yourself before you commit to the action."
          ]
        },
        {
          heading: 'Failure mode 1: Tilt',
          body: [
            "**Tilt** is degraded judgment after a string of losses. The poker term applies cleanly to trading.",
            "**Symptoms:** sizing up to recover, taking marginal setups, abandoning your stop, switching timeframes mid-trade, trading instruments you don't normally trade.",
            "**Mechanism:** the brain registers losses as physical threat. Cortisol rises. Prefrontal cortex (deliberate decision-making) suppressed. Limbic system (emotional, reactive) takes over. You're literally not the same trader for the next hour.",
            "**Prevention (the only real defense): pre-commitment.** Before the session starts, write your daily loss limit and your loss-streak limit. \"Stop at 3 consecutive losses or 3% account drawdown.\" Then stop. Walk away from the screen. Don't \"see if it gets better.\"",
            "**The hardest discipline in trading.** Every cell in your body will say \"one more trade and I'll be back to even.\" That voice is wrong. Not a probability — wrong. Your judgment is degraded; the next trade has worse expectancy than your normal expectancy.",
            "**Practical rule:** when you hit your daily stop, close the platform. Not minimize — close. Open it tomorrow."
          ]
        },
        {
          heading: 'Failure mode 2: Revenge trading',
          body: [
            "**Revenge trading** is a specific form of tilt: trying to immediately \"get back\" at the market or a specific setup that just lost.",
            "**Pattern:** you take a loss on a long. You immediately look for another long entry. You enter. It loses too. You're now -2R in 10 minutes. You enter a third time. Etc.",
            "**Why this is so destructive:** revenge trades are not your tested setups. They're rationalized impulses. Their expectancy is, at best, random; usually negative because you're forcing setups in conditions that don't merit them.",
            "**The cure:** between trades, mandatory cooldown. After any loss, wait 5-15 minutes before considering the next trade. Use the time to write the journal entry for the previous trade.",
            "**This sounds excessive. It isn't.** Most traders who blow up don't do it through one bad trade — they do it through a sequence of revenge trades following the first loss. The cooldown breaks the sequence.",
            "**Stronger cure: define your max trades per day in advance.** Many professionals cap at 3-5 trades per session. After your max, done — even if you're up. The cap removes the choice in the moment."
          ]
        },
        {
          heading: 'Failure mode 3: FOMO and chasing',
          body: [
            "**FOMO (fear of missing out)** is the urge to enter trades that have already moved without you, fearing that further price movement will leave you behind.",
            "**Pattern:** ES makes a clean breakout above PDH. You watched it from the sidelines, thinking about whether to enter. It moves 5 points. 10 points. Now it's 15 points off the breakout level. You enter, late, with a stop that's now far away from the proper structural stop.",
            "**Why FOMO loses:** late entries have terrible R:R. The structural stop hasn't moved (still below the breakout level), but your entry is 15 points worse, so your risk is now 15 points instead of 5, while the potential upside has shrunk.",
            "**Prevention:** define entry triggers in advance. \"I will enter on the close of the candle that breaks PDH, or on the first pullback to PDH after the break, with a stop below PDH. If neither happens, I miss the trade.\" Then if you miss, you miss. The market will give you another setup.",
            "**The discipline mantra:** \"There is always another setup.\" The market produces 5+ valid setups per session. Missing one isn't a tragedy. Chasing one is."
          ]
        },
        {
          heading: 'Failure mode 4: Overconfidence after winning streaks',
          body: [
            "Winning streaks are as dangerous as losing streaks. After 5-10 wins in a row, your brain decides you've figured it out. You size up. You take marginal setups. You skip your stop because \"I know where it's going.\"",
            "**Then a normal-sized loss hits.** Except now it's at oversized risk. Or the marginal setup turns into a -3R loser. Or the skipped stop becomes a -10R catastrophe.",
            "**The 5-loss-streak math is real. The 10-win-streak euphoria is also real, and is often what produces the loss streak.** Many of the worst drawdowns in retail trading happen immediately after the best winning sequences, because the trader sized up at the worst possible moment.",
            "**Cure:** size discipline does not flex with recent results. After 10 wins, you trade the same size. After 5 losses, you trade the same size (or smaller). The size is set by the math (1% of equity), not by how you feel.",
            "**Track this in your journal:** size on each trade. If it varies based on recent P/L, you have a problem. The fix is to commit, in advance, to a sizing rule and follow it mechanically."
          ]
        }
      ],
      diagram: 'psychology',
      takeaways: [
        { id: 'm22.t1', text: 'Tilt is degraded judgment after losses. The only defense is pre-committed daily limits and walking away.' },
        { id: 'm22.t2', text: 'Revenge trading: cooldown of 5-15 min between trades. Cap daily trades. The cap removes the choice in the moment.' },
        { id: 'm22.t3', text: 'FOMO/chasing: define entries in advance. Missing a setup is fine. Chasing one is not. The market always produces another.' },
        { id: 'm22.t4', text: 'Overconfidence after wins: size discipline does not flex with recent results. Size is set by the math, not by how you feel.' }
      ],
      task: {
        title: 'Write your psychology rules document',
        steps: [
          'In a single page, write: "My daily loss limit is $X (3% of account)." "My loss-streak limit is 3 consecutive losses." "When either triggers, I close the platform and walk away."',
          'Add: "After every loss, I wait 5+ minutes before considering the next trade. I use the time to journal the loss."',
          'Add: "My maximum trades per day is 5. After 5, I am done, regardless of P/L."',
          'Add: "My position size is fixed by the 1% rule. It does not flex with recent winners or losers."',
          'Add: "If I find myself about to violate any of these rules, I close the platform for the day."',
          'Print this. Keep it next to your screen. Read it before each session.',
          'When you violate a rule (and you will, eventually), the next session starts with re-reading the document. The violation is the data point that makes the rules real.'
        ]
      },
      quiz: [
        {
          q: 'The most reliable defense against tilt is:',
          options: [
            'Stronger willpower',
            'Pre-committed daily loss and loss-streak limits, plus walking away when triggered',
            'Trading bigger to recover faster',
            'Switching to a different instrument'
          ],
          answer: 1,
          explain: 'Willpower fails under stress. Pre-commitment, executed mechanically, doesn\'t require willpower in the moment — it requires only following the rule you set when calm.'
        },
        {
          q: 'After a 10-trade winning streak, the right action is:',
          options: [
            'Size up to capture the hot streak',
            'Trade the same size as always — sizing is set by the math, not by recent results',
            'Stop trading',
            'Switch strategies'
          ],
          answer: 1,
          explain: 'Sizing flex with recent results is one of the most common precursors to large drawdowns. The math (1% of equity) is the size. Discipline = sizing the same on trade #11 as on trade #1.'
        },
        {
          q: 'FOMO trades are most reliably prevented by:',
          options: [
            'Trading more aggressively',
            'Defining entry triggers in advance and accepting that missed setups are fine',
            'Watching more chart patterns',
            'Using larger size'
          ],
          answer: 1,
          explain: 'Pre-defined entries make "missed" setups a non-event. Chasing happens when entries weren\'t defined and you decide to enter mid-move. The mantra: there is always another setup.'
        }
      ]
    },

    {
      id: 'm23',
      title: 'Topstep: rules, mechanics, and the math of passing',
      summary:
        "Topstep is the most established prop futures evaluator. The rules are specific and the eval is passable with discipline — but most fail not from lack of edge, but from rule violations.",
      sections: [
        {
          heading: 'What Topstep is',
          body: [
            "**Topstep** is a prop firm that funds traders who pass an evaluation. You pay a monthly fee for access to the eval. You trade their simulated capital under their rules. If you hit a profit target without violating rules, you graduate to a funded account, where you trade their real capital and keep the majority of profits.",
            "**It exists because** funding traders who can prove edge under controlled conditions is profitable for the firm — they take a cut of profits, you get capital you couldn't otherwise access. It's a real business with thousands of funded traders, not a scam.",
            "**Cost:** roughly $50-150/month per evaluation, depending on account size. The $50K Combine (their evaluation) is the most popular, around $150/month at the time of writing.",
            "**Profit split when funded:** 100% of the first $5,000 in profits go to the trader; 90% of profits beyond that. Note: rates change — verify current terms on Topstep's website before signing up.",
            "**Most traders fail.** Industry estimates suggest 90%+ of evaluators fail at least once before passing, and most never pass at all. The reason isn't lack of edge — it's rule violations during normal drawdowns. Understanding the rules and respecting them is the entire game."
          ]
        },
        {
          heading: 'The Topstep $50K Combine rules (verify current at topstep.com)',
          body: [
            "**Profit target: $3,000.** Hit this on the eval and you advance.",
            "**Maximum trailing drawdown: $2,000.** This is the killer rule. Your account is tracked from the highest point it has reached. If equity drops $2,000 below that high, the account is failed. The drawdown trails up as you make money — once your trailing high reaches $52,000, the floor is $50,000 and stays there permanently. Until then, the floor moves up with each new high.",
            "**Maximum daily loss: $1,000.** Lose $1,000 in a single trading day (intraday or end-of-day, depending on plan), and the account is failed for that day. Some plans fail the account entirely on hitting daily loss; others just stop trading for the day.",
            "**Minimum trading days:** typically 5 days minimum before you can pass.",
            "**Position size limits:** typically 5 ES contracts maximum. Cannot exceed.",
            "**Scaling plan:** for the funded account, you must scale into size (start with smaller positions, prove consistency, then scale up).",
            "**Consistency rule:** no single day can produce more than ~50% of total profits during the eval. Hits a $2,000 day on a $3,000 target? Disqualified for being too lumpy.",
            "**EOD position rule:** must close all positions by 4:10pm CT (5:10pm ET) to avoid overnight risk.",
            "**These rules change.** The above is approximate as of recent versions. Always verify current rules on Topstep's site before relying on specific numbers."
          ]
        },
        {
          heading: 'The math of passing',
          body: [
            "**Target: $3,000. Drawdown: $2,000. Daily loss: $1,000. Minimum days: 5.**",
            "If you risk $200/trade (which is 0.4% of $50K, conservative) and average +0.3R expectancy, your daily P/L is approximately $200 × 0.3 × (4 trades/day) = $240/day expected.",
            "At $240/day expected, you reach the $3,000 target in roughly 12-13 trading days. With variance, this can stretch to 20+ days or shrink to 8.",
            "**The drawdown rule is what kills people.** Even with positive expectancy, a routine 5-loss streak at $200 risk = $1,000 drawdown. Combined with normal variance, your trailing drawdown can hit -$1,500 to -$2,000 quickly. **One bad day plus normal variance = fail.**",
            "**Strategic implication: size smaller than you think you need to.** $150 risk per trade ($150 × 4 trades × 0.3R = $180/day expected) takes longer (17 days to hit target), but reduces the chance of hitting the trailing drawdown during normal variance.",
            "**Also:** stop trading after 2 losses in a day. Not 3. Topstep's $1,000 daily limit at $200 risk is hit after 5 stops. At $400 risk it's hit after 2-3. Sizing smaller and stopping earlier is the strategy that passes."
          ]
        },
        {
          heading: 'How most evaluators fail',
          body: [
            "**Mode 1: Trailing drawdown blowup.** Trader makes $1,500 quickly, gets close to target, then has a 5-loss streak and drops below the trailing drawdown floor. Account failed before reaching target.",
            "**Mode 2: Daily loss blowup.** Trader has a bad day, sizes up to recover, and exceeds the daily loss limit. Account failed.",
            "**Mode 3: Consistency rule violation.** Trader has one big day that produces most of the eval profit. Disqualified for lumpy P/L.",
            "**Mode 4: EOD violation.** Trader holds a position past close on a Friday or expiry, accidentally violating the EOD rule. Account failed for a procedural error.",
            "**The pattern:** virtually all failures are rule violations under stress, not lack of edge. The traders who pass are the ones who treat the rules as the strategy, not as constraints to optimize around.",
            "**Practical advice:** before paying for the eval, sim trade for 30+ days with Topstep's exact rules in mind. Daily loss limit. Trailing drawdown. EOD close. If you can pass in sim consistently, you're ready. If you can't, a real eval will fail."
          ]
        }
      ],
      diagram: 'topstep_rules',
      takeaways: [
        { id: 'm23.t1', text: 'Topstep is real, profitable, and most traders fail their evals not from lack of edge but from rule violations during drawdown.' },
        { id: 'm23.t2', text: '$50K Combine: $3K target, $2K trailing drawdown, $1K daily loss limit, 5-day minimum, EOD close required, consistency rule.' },
        { id: 'm23.t3', text: 'Math of passing: size smaller than feels right ($150-200 risk on $50K). The trailing drawdown rule kills people who size aggressively.' },
        { id: 'm23.t4', text: 'Sim trade with Topstep rules in mind for 30+ days before paying for an eval. If you can\'t pass in sim, you can\'t pass live.' }
      ],
      task: {
        title: 'Run a Topstep simulation in your sim account',
        steps: [
          'In your simulator, set the account to $50,000.',
          'Track manually: max drawdown from any high point, max daily loss.',
          'Simulate the rules: $3,000 profit target, $2,000 trailing drawdown limit, $1,000 daily loss limit. Stop trading the moment any rule is breached.',
          'Trade ONLY your validated playbook setup, sized at $150-200 risk per trade.',
          'See how many sessions you need to either pass or fail.',
          'Repeat 3 times. If you pass 2 of 3, you\'re likely ready for a real eval. If 0/3, more sim work first.'
        ]
      },
      quiz: [
        {
          q: 'On a Topstep $50K Combine, the trailing drawdown rule is dangerous because:',
          options: [
            'It moves with each new high, but never moves down — meaning a normal losing streak after gains can fail the account',
            'It is fixed at $50K',
            'It doesn\'t exist',
            'It is unlimited'
          ],
          answer: 0,
          explain: 'Trailing drawdown trails up with new equity highs but never trails down. So after gains, your floor has risen, and a normal losing streak can drop you below it. Sizing smaller mitigates this; sizing aggressively makes it likely.'
        },
        {
          q: 'The most common reason traders fail Topstep evals is:',
          options: [
            'Lack of trading edge',
            'Rule violations under stress: drawdown, daily loss, EOD, consistency — not lack of edge',
            'Topstep is rigged',
            'Bad luck'
          ],
          answer: 1,
          explain: 'Most fails are procedural — drawdown violation from sizing too large during normal variance, daily loss from chasing recovery, etc. Edge isn\'t the issue; discipline within constraints is.'
        },
        {
          q: 'For a $50K Topstep Combine with $200 risk per trade, the strategic move is:',
          options: [
            'Size up after winners to hit target faster',
            'Stop trading after 2 losses in a day to preserve drawdown buffer; size conservatively until target nearly hit',
            'Hold positions overnight to avoid EOD restrictions',
            'Take only one trade per day'
          ],
          answer: 1,
          explain: 'Stopping early preserves the trailing drawdown buffer. Aggressive sizing/recovery is what fails most evals. Patience within the rules is the entire strategy.'
        }
      ]
    },

    {
      id: 'm24',
      title: 'MFFU and graduation: alternatives, comparisons, and next steps',
      summary:
        "MFFU offers different rules that some traders find easier. Plus: how you know you're actually ready to trade real capital, and what \"good\" looks like long-term.",
      sections: [
        {
          heading: 'What MFFU is',
          body: [
            "**My Funded Futures (MFFU)** is one of several Topstep alternatives that have emerged in the last few years. The pitch: simpler rules, lower fees, faster payouts.",
            "**Account sizes:** typically $50K, $100K, $150K, with corresponding profit targets and drawdown limits.",
            "**Cost:** typically $80-200/month per evaluation, similar to Topstep.",
            "**Important honesty:** the prop futures industry has had its share of failures and rule changes. Several firms have folded or significantly changed terms in ways that hurt traders. Topstep is the most established (oldest, most traders) but also the strictest. MFFU and similar firms (TPT, Apex, etc.) offer more lenient rules but operational risk is higher — meaning the firm itself might change rules or have payout issues.",
            "**Verify current terms before paying.** The rules in this module are illustrative as of writing; check the firm's site for current details and read recent reviews about payout reliability."
          ]
        },
        {
          heading: 'Key rule differences (illustrative — verify current)',
          body: [
            "**MFFU vs Topstep, key differences traders care about:**",
            "**Drawdown type.** Topstep uses trailing drawdown — the most punishing kind. Some MFFU plans use **end-of-day (EOD) drawdown** — the floor is your account balance at the end of the previous day, not your highest intraday point. Easier to pass because your floor doesn't trail your peak intraday equity.",
            "**Daily loss limit.** Topstep enforces a hard daily loss limit. Some MFFU plans have no daily loss limit, only the overall max drawdown. This gives more room to recover from a bad day intraday but increases the danger of single-day blowups for tilt-prone traders.",
            "**Scaling plan.** Topstep requires gradual scaling on funded accounts. MFFU typically has fewer restrictions on size from day one of funded.",
            "**Consistency rule.** Topstep enforces; MFFU varies by plan.",
            "**Payout and profit split.** Both typically pay 80-90% of profits to trader, with first-payout caps and minimum profit thresholds before payout. Specifics differ — check current terms.",
            "**Net assessment:** for tilt-prone traders, MFFU's looser rules can be a trap (more rope to hang yourself). For disciplined traders trading conservative size, MFFU's lighter constraints can mean faster funded status. Choose based on your honest assessment of your discipline."
          ]
        },
        {
          heading: 'Which firm should you pick?',
          body: [
            "**Honest answer: it depends on your trading style and discipline level.**",
            "**Pick Topstep if:** you want the most established firm with the most public track record. You\'re willing to accept stricter rules for greater operational stability. You\'re a disciplined trader who can size conservatively.",
            "**Pick MFFU (or another newer firm) if:** Topstep\'s trailing drawdown is too restrictive for your style and you\'re confident your discipline is real. You\'re comfortable with somewhat higher operational risk.",
            "**Pick neither, yet, if:** you haven\'t demonstrated 3+ months of consistent profit in sim with full rule discipline. Paying for an eval before you\'re ready is a tax on premature ambition.",
            "**Practical recommendation for your situation:** start with the Topstep $50K Combine. If you fail because of trailing drawdown specifically (and your trade quality was good), consider MFFU\'s EOD plan next. If you fail because of tilt or rule violations, more sim work — neither firm will fix that."
          ]
        },
        {
          heading: 'Graduation: when are you actually ready?',
          body: [
            "Across all 24 modules, the question this course exists to answer is: **when are you actually ready to trade real capital, whether your own or a prop firm\'s?**",
            "The honest answer is a checklist, not a feeling. The graduation checklist (visible separately in the course nav) is the gate. Until you\'ve completed it, you\'re still in development.",
            "**The checklist captures:**",
            "- Mastery of foundations (you can answer Phase 1-2 cold without notes).",
            "- Risk discipline demonstrated in sim (50+ trades with full rule adherence, no violations).",
            "- Validated playbook setup (backtested 100+ historical occurrences, sim 50+ trades, both positive expectancy).",
            "- Daily and per-trade limits internalized (you stop yourself reliably).",
            "- Journal review habit established (8+ consecutive weeks of weekly reviews logged).",
            "- Psychological rules document written and respected (no rule violations in last 30 days of sim).",
            "**This is a months-long process.** 3-6 months of focused work for someone serious. Less is possible only if you\'re unusually disciplined; longer is normal and not a failure.",
            "**The honest bar:** if you can\'t check every box on the graduation checklist, you\'re not ready for prop eval, and you\'re definitely not ready to risk meaningful personal capital. The rules don\'t care about how long you\'ve been studying — they care about whether you\'ve demonstrated edge with discipline."
          ]
        },
        {
          heading: 'What \"good\" looks like long-term',
          body: [
            "**Realistic expectations for a successful retail futures trader:**",
            "**Year 1:** mostly studying, simming, small live size. Likely net negative or break-even. The cost of education.",
            "**Year 2:** consistent positive months become more frequent. Maybe a funded prop account. Modest income, well below replacement of a typical job.",
            "**Year 3:** if you\'re still trading and profitable, you\'re in rare territory. Probably can match a moderate professional salary.",
            "**Beyond:** the small minority who reach this point can scale meaningfully — multiple prop accounts, significant personal capital, or both. But this is unusual.",
            "**The 90%+ failure rate is real.** Most retail futures traders quit, not from blowing up but from running out of patience or money before reaching consistency. **Trading is not get-rich-quick. It\'s skill-acquire-slow with high upside if it works.**",
            "**Final advice:** treat the next 12-24 months as tuition. Most of what you learn will be about yourself — your discipline, your tilt patterns, your tolerance for variance. The trading-specific knowledge in this course is necessary but small. The internal work is the larger task.",
            "**You\'ve got the structured material now. The work from here is execution, journal, review, repeat. There are no shortcuts beyond what\'s in these 24 modules.** Anyone selling shortcuts is selling something else."
          ]
        }
      ],
      diagram: 'graduation_checklist',
      takeaways: [
        { id: 'm24.t1', text: 'MFFU and similar firms offer EOD (vs trailing) drawdown and looser daily limits. Tradeoff: easier rules but higher operational risk.' },
        { id: 'm24.t2', text: 'For most: start with Topstep $50K. If drawdown was the issue (not discipline), try MFFU. If discipline was the issue, more sim.' },
        { id: 'm24.t3', text: 'Graduation = a checklist, not a feeling. Foundations, risk discipline, validated playbook, journal habit, psychological rules — all must be checked.' },
        { id: 'm24.t4', text: 'Realistic timeline: Year 1 is tuition, Year 2 maybe break-even, Year 3+ rare territory. 90%+ failure rate is real.' }
      ],
      task: {
        title: 'Complete your graduation checklist (the final task)',
        steps: [
          'Open the Graduation Checklist in the course sidebar.',
          'For each item, only check it when it is genuinely true. Be brutally honest — false checks help no one.',
          'For items that aren\'t checked, identify what specific work would check them. Write that down.',
          'Set a date to revisit the checklist in 30 days. Track your progress.',
          'When (and only when) every box is checked, you\'re ready for a Topstep or MFFU eval.',
          'Until then, sim, review, and improve. The market will be there.'
        ]
      },
      quiz: [
        {
          q: 'A key difference between Topstep and many MFFU plans is:',
          options: [
            'Topstep is illegal',
            'MFFU plans often use end-of-day drawdown (less punishing) instead of trailing drawdown, and may have looser daily limits',
            'MFFU funds traders for free',
            'Both have identical rules'
          ],
          answer: 1,
          explain: 'EOD drawdown vs trailing drawdown is the most-discussed difference. Trailing tracks intraday peak equity (Topstep). EOD tracks closing balance (some MFFU). EOD is more forgiving for traders who give back gains intraday.'
        },
        {
          q: 'You\'re ready to take a prop eval when:',
          options: [
            'You feel ready',
            'You can check every item on the graduation checklist (foundations, risk, validated playbook, journal habit, psychology rules)',
            'You\'ve been studying for a year regardless of progress',
            'You see a discount on the eval fee'
          ],
          answer: 1,
          explain: 'Readiness is defined by demonstrated competencies, not feeling, time, or convenience. The checklist is brutally honest — you can\'t pass an eval if you can\'t pass it on yourself first.'
        },
        {
          q: 'A realistic expectation for the first year of focused futures trading is:',
          options: [
            'Replacement income from month 1',
            '6-figure profits',
            'Mostly break-even or net negative as you learn — the cost of tuition for genuine skill acquisition',
            'Guaranteed prop funding within 30 days'
          ],
          answer: 2,
          explain: 'Year 1 is realistically tuition for most traders, even diligent ones. Year 2 is where consistency tends to emerge. Year 3+ is where meaningful scaling becomes possible. Anyone promising faster outcomes is selling, not teaching.'
        }
      ]
    }
  ]
};
