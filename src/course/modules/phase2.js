// Phase 2 — Charts & Price Action
// Modules m05..m09

export const phase2 = {
  id: 'p2',
  title: 'Charts & Price Action',
  description:
    "How to read a chart honestly. The minimum viable visual literacy you need before any setup will make sense.",
  modules: [
    {
      id: 'm05',
      title: 'Candlesticks: how to read a chart in 60 seconds',
      summary:
        'A candle encodes four numbers: open, high, low, close, over a chosen timeframe. Master this and the chart starts speaking.',
      sections: [
        {
          heading: 'Anatomy of a candle',
          body: [
            "A single candle on a chart represents one fixed period of price action. On a 5-minute chart, each candle = 5 minutes. On a 1-hour chart, 1 hour. The timeframe is your choice; the candle structure is identical regardless.",
            "Each candle has four data points: **Open** (price at the start of the period), **High** (max price during the period), **Low** (min price during the period), **Close** (price at the end of the period).",
            "Visually: the **body** of the candle is the rectangle drawn between Open and Close. The **wicks** (or \"shadows\") above and below are thin lines extending to the High and Low.",
            "**Color convention:** if Close > Open, the candle closed up — usually green or white. If Close < Open, the candle closed down — usually red or black. The body color tells you direction over the period; the wicks tell you what was rejected."
          ]
        },
        {
          heading: 'Reading a candle for what actually happened',
          body: [
            "A green candle with a small body and a long upper wick: price went up, hit a high, but got rejected and gave back most of the move. Buyers tried, sellers won the second half.",
            "A long red body with no wicks: price opened high, sold continuously through the period, closed near the low. Sellers in control, no real attempt to reverse.",
            "A 'doji' (open ≈ close, with wicks): indecision. Neither side won. Often appears at turning points or in chop.",
            "**The single most important habit:** stop reading candles as patterns to memorize and start reading them as a record of who won the period. The body shows who closed in control. The wicks show what was attempted and rejected.",
            "You don't need to memorize 50 candle patterns from a textbook. Most are noise. The ones that actually matter — and we'll cover real ones in modules 8–9 — work because they reflect a clear story of intent and rejection at meaningful price levels."
          ]
        },
        {
          heading: 'The lie of the lower timeframe',
          body: [
            "A 1-minute candle and a 1-hour candle look identical on screen. But they encode very different amounts of information.",
            "On a 1-minute chart, each candle is the result of dozens of trades by maybe a few hundred participants. Noise dominates.",
            "On an hourly chart, each candle absorbs thousands of trades and reflects the conviction of much more capital. Patterns on hourly charts are more meaningful.",
            "**Practical rule:** the higher the timeframe, the more reliable the signal — and the slower the trade. The lower the timeframe, the more signals — and the more noise.",
            "Beginner mistake: trading exclusively on 1-minute charts because there are 'more setups.' Yes, there are more — and most are random. You'll spend more time trading and lose more often.",
            "Recommended starting setup for ES: a 15-minute or 5-minute primary chart for entries, a 1-hour or 4-hour chart for context. We'll formalize this in module 7."
          ]
        }
      ],
      diagram: 'candlesticks',
      takeaways: [
        { id: 'm05.t1', text: 'Each candle = OHLC over a chosen period. Body = open to close. Wicks = highs and lows that were rejected.' },
        { id: 'm05.t2', text: 'Read candles as stories: who closed in control (body) and what was rejected (wicks). Stop memorizing patterns.' },
        { id: 'm05.t3', text: 'Higher timeframes = more signal, slower. Lower timeframes = more noise, faster. Most beginners trade too fast.' }
      ],
      task: {
        title: 'Read 20 candles cold',
        steps: [
          'Open TradingView or your platform. Pull up ES on a 5-minute chart from yesterday\'s 9:30am ET cash open.',
          'For each of the first 20 candles after the open, write a one-sentence story: who won the period, and what was attempted/rejected.',
          'Don\'t look up candle pattern names. Just describe what you see.',
          'Notice: most candles have a clear story. Some don\'t (chop). The ability to distinguish "this candle has a story" from "this candle is noise" is most of price action reading.'
        ]
      },
      quiz: [
        {
          q: 'A red candle with a long lower wick and a small body, closing near the high of the period, suggests:',
          options: [
            'Sellers were in clear control all period',
            'Price sold off but was bought back hard; sellers tried, buyers won the close',
            'Indecision with no clear winner',
            'A bullish reversal is guaranteed next'
          ],
          answer: 1,
          explain: 'Long lower wick = price went down and was rejected (bought up). Closing near the high = the period ended with buyers in control. No reversal is "guaranteed" but the period\'s story is buyer aggression after an initial sell attempt.'
        },
        {
          q: 'A doji candle indicates:',
          options: [
            'A guaranteed reversal',
            'That the open and close are very close, suggesting indecision over the period',
            'A bullish pattern',
            'That volume was high'
          ],
          answer: 1,
          explain: 'Doji = open ≈ close. It means neither side closed the period in control. It does NOT guarantee a reversal — it indicates indecision, which can resolve in either direction.'
        },
        {
          q: 'Compared to an hourly candle, a 1-minute candle:',
          options: [
            'Is more reliable because it has more data',
            'Is less reliable because it represents fewer trades and less participant conviction',
            'Is equally meaningful',
            'Has different OHLC structure'
          ],
          answer: 1,
          explain: 'Lower timeframes have less participant volume per candle and thus less signal. The structure (OHLC) is the same; the meaning is weaker.'
        }
      ]
    },

    {
      id: 'm06',
      title: 'Support, resistance, and the levels that matter',
      summary:
        "Markets remember prices. Support and resistance are the simplest, most durable concept in technical analysis — and the only one that consistently shows up in price action regardless of method.",
      sections: [
        {
          heading: 'What support and resistance actually are',
          body: [
            "**Support** is a price level where buying pressure has previously appeared and stopped a decline. **Resistance** is a price level where selling pressure has previously appeared and stopped a rally.",
            "Why do these levels work? Three overlapping reasons:",
            "**1. Memory.** Traders who got long at $5800 and saw it rally to $5820 will, when price returns to $5800, often add or buy again. Their decision is anchored to the price they previously made money at. Multiply by thousands of traders, and the level has buying pressure.",
            "**2. Loss aversion.** Traders who got short at $5800 and saw price rally past them are sitting in losses. When price returns to $5800, they'll exit at breakeven — buying to cover. More buying pressure at the level.",
            "**3. Algorithmic and institutional reference.** Many systematic strategies and institutional desks reference recent highs and lows for entry/exit logic. They reinforce the level mechanically.",
            "The level is a memory anchor. The more times price has interacted with it (touched, reversed, broken), the more participants are watching it, the stronger the reaction tends to be."
          ]
        },
        {
          heading: 'How to actually draw a level',
          body: [
            "Drawing levels well is a skill. Most beginners draw too many lines too precisely. Both errors weaken the practice.",
            "**Rule 1: Levels are zones, not lines.** ES doesn't respect 5800.00 to the tick. It respects roughly the 5798–5803 area. Draw a horizontal *zone* (or a box on advanced platforms), not a thin line. This matches reality.",
            "**Rule 2: Use closes, not wicks.** A level marked by where a candle *closed* is more meaningful than where the wick reached. Wicks represent quick rejections; closes represent participant conviction at period-end.",
            "**Rule 3: More touches = more weight.** A level price has touched and bounced from 5+ times is much stronger than one touched twice.",
            "**Rule 4: Recency matters.** A level from last week is more relevant than a level from 6 months ago. Markets evolve; old levels lose attention.",
            "**Rule 5: Higher timeframe levels dominate.** A level visible on the 4-hour chart is more important than one visible only on the 5-minute. When a daily-chart level intersects an hourly level which intersects a 15-minute level, that confluence is what experienced traders watch most carefully."
          ]
        },
        {
          heading: 'Support becomes resistance, and vice versa',
          body: [
            "When a support level breaks (price closes meaningfully below it), the level often becomes resistance on the way back up. Same for resistance breaking and becoming support.",
            "The mechanism: traders who bought at support are now in losses. When price retraces back to the level, they exit at breakeven — selling. The buying-pressure level is now a selling-pressure level. The roles flip.",
            "This is one of the most reliable patterns in price action. **Broken support → resistance retest → resumption of downtrend** is a setup played in textbooks for a reason: it works because the underlying trader psychology is real.",
            "But: 'meaningfully below' matters. A wick poking 1 tick below support and reclaiming isn't a break. A clean candle close below, followed by failure to reclaim, is."
          ]
        }
      ],
      diagram: 'support_resistance',
      takeaways: [
        { id: 'm06.t1', text: 'Support and resistance work because of trader memory, loss aversion, and institutional reference levels.' },
        { id: 'm06.t2', text: 'Levels are zones, not lines. Use closes, not wicks. More touches = stronger. Higher timeframe = stronger.' },
        { id: 'm06.t3', text: 'Broken support becomes resistance (and vice versa). The retest of a flipped level is one of the most consistent setups in price action.' }
      ],
      task: {
        title: 'Mark levels on yesterday\'s ES',
        steps: [
          'Open the ES daily chart. Identify the most recent significant high and low (last 1-2 weeks).',
          'Drop down to the 1-hour chart. Mark 3-5 zones where price has clearly reversed multiple times.',
          'Drop to the 15-minute chart. Mark any additional intraday levels visible there.',
          'Now: zoom out to the daily again. Are your 15-min levels still visible? Some will be; most won\'t. The ones that survive the zoom-out are the ones that matter most.',
          'Save this chart layout. You\'ll add to it daily.'
        ]
      },
      quiz: [
        {
          q: 'Support and resistance levels work primarily because:',
          options: [
            'They are predicted by mathematical formulas',
            'Traders remember prices and act around them, plus institutional/algorithmic reference points',
            'Central banks defend them',
            'They are guaranteed to hold'
          ],
          answer: 1,
          explain: 'The mechanism is participant memory and institutional reference, not magic. They\'re probabilistic, not guaranteed.'
        },
        {
          q: 'When drawing a support level, you should:',
          options: [
            'Use the exact wick low to the tick',
            'Draw a zone around where multiple candles closed, weighting recent touches more',
            'Pick a round number and force the level to it',
            'Draw 20+ levels to be safe'
          ],
          answer: 1,
          explain: 'Zones around closes, weighted by recency and number of touches, reflect how price actually behaves. Wick-precise lines and over-marking both miss the point.'
        },
        {
          q: 'A broken support level often becomes:',
          options: [
            'Stronger support',
            'Resistance, because trapped longs exit at breakeven on a retest',
            'Irrelevant',
            'Permanent support'
          ],
          answer: 1,
          explain: 'Trapped longs are sellers on the retest. The level\'s role flips. This is one of the most reliable price action patterns.'
        }
      ]
    },

    {
      id: 'm07',
      title: 'Trend structure: HH, HL, LH, LL',
      summary:
        "Markets move in trends and ranges. The single most useful framework for telling them apart is the higher-high / higher-low / lower-high / lower-low classification.",
      sections: [
        {
          heading: 'The four building blocks',
          body: [
            "Every meaningful price move can be decomposed into a sequence of swing highs and swing lows. A **swing high** is a candle (or cluster) where price made a local peak and reversed down. A **swing low** is the opposite — a local trough where price reversed up.",
            "Once you have a series of swings, you classify each new swing relative to the previous one of the same type:",
            "**Higher High (HH):** the new swing high is above the previous swing high.",
            "**Higher Low (HL):** the new swing low is above the previous swing low.",
            "**Lower High (LH):** the new swing high is below the previous swing high.",
            "**Lower Low (LL):** the new swing low is below the previous swing low.",
            "These four labels are sufficient to describe the underlying structure of any market in any timeframe. You will use them constantly."
          ]
        },
        {
          heading: 'The three states a market is in',
          body: [
            "**Uptrend:** sequence of HH and HL. Each new high is higher than the last; each pullback bottoms higher than the last. Buyers in clear control.",
            "**Downtrend:** sequence of LH and LL. Each new high is lower; each new low is lower. Sellers in clear control.",
            "**Range / Sideways / Consolidation:** highs and lows are roughly equal. Neither side gaining ground. The market is undecided.",
            "Most of the time — easily 60% — markets are in some form of range. Trends are the minority. This is the opposite of what most beginners assume; they think the market is always trending and they're failing to find the trend. No, the trend often isn't there.",
            "Knowing which state you're in matters because the trades that work in trends fail in ranges, and vice versa. Trying to play breakouts in a range = death by a thousand fakeouts. Trying to play mean-reversion in a strong trend = caught fading the move."
          ]
        },
        {
          heading: 'Trend changes: what to look for',
          body: [
            "Trends don't reverse cleanly; they break down through a sequence:",
            "**Uptrend → Downtrend transition:** an uptrend (HH-HL-HH-HL) makes a HH, then on the next pullback the price doesn't make a HL — it makes a LL (a Lower Low) instead. This is the first warning sign. The next leg up then fails to make a HH and instead makes a LH. Now you have HL-HH-LL-LH: a structural break.",
            "Said simply: **uptrend ends when you get a LL followed by a LH**. (Mirror for downtrends ending: HH followed by HL.)",
            "Most beginners try to call tops and bottoms in real time. Don't. Wait for the structural confirmation — the LL/LH or HH/HL sequence — before trading the new direction. You'll miss the very top, but you'll catch the trend earlier and more safely."
          ]
        },
        {
          heading: 'Multi-timeframe trend alignment',
          body: [
            "A market can be in an uptrend on the daily, a downtrend on the hourly, and a range on the 5-minute simultaneously. This isn't a contradiction — it's how nested timeframes work.",
            "**Trade rule for beginners:** only take trades aligned with the trend of your higher timeframe.",
            "Concretely: pick two timeframes — say, 1-hour and 5-minute. The 1-hour trend dictates direction. The 5-minute is for entry timing. If the 1-hour is in an uptrend, you only take long setups on the 5-minute. Counter-trend trades (shorting in an uptrend) are statistically lower-probability and demand more skill.",
            "**Why this works:** the higher timeframe represents more participant conviction. Aligning with it stacks probability in your favor. Counter-trend trades require precise timing and tight management; these are advanced skills you don't have yet."
          ]
        }
      ],
      diagram: 'trend_structure',
      takeaways: [
        { id: 'm07.t1', text: 'Markets are in one of three states: uptrend (HH/HL), downtrend (LH/LL), or range. Most of the time they\'re ranging.' },
        { id: 'm07.t2', text: 'Trend changes are confirmed by structural breaks: LL after a HH (uptrend → down), or HH after a LL (downtrend → up).' },
        { id: 'm07.t3', text: 'Trade with the higher-timeframe trend. Counter-trend trading is an advanced skill.' }
      ],
      task: {
        title: 'Label the structure on a real chart',
        steps: [
          'Open ES on the 1-hour chart. Look at the last 5 trading days.',
          'Mark each swing high and swing low. Don\'t over-mark; pick clear pivots.',
          'For each swing, label it: HH, HL, LH, or LL.',
          'Now classify each segment of the chart: uptrend, downtrend, or range.',
          'Repeat on the 15-minute for today only. Notice how the lower timeframe contains more swings, more chop, and more state changes.'
        ]
      },
      quiz: [
        {
          q: 'A market in an uptrend shows a sequence of:',
          options: [
            'LH and LL',
            'HH and HL',
            'Equal highs and lows',
            'Random highs and lows'
          ],
          answer: 1,
          explain: 'Uptrend = higher highs and higher lows. Each new high above the last; each pullback bottoms above the last.'
        },
        {
          q: 'The first structural sign that an uptrend may be ending is:',
          options: [
            'A Lower Low after the most recent Higher High',
            'A new Higher High',
            'A red candle',
            'High volume'
          ],
          answer: 0,
          explain: 'Uptrend = HH/HL. If a pullback breaks the previous HL and makes a LL instead, the uptrend\'s structure is broken. Confirmation comes from the next high being a LH.'
        },
        {
          q: 'For a beginner, the most important rule about trend is:',
          options: [
            'Always counter-trend trade — it\'s where the money is',
            'Only trade in the direction of the higher-timeframe trend',
            'Trends don\'t exist',
            'Trade every breakout'
          ],
          answer: 1,
          explain: 'Aligning with the higher-timeframe trend stacks probability in your favor. Counter-trend trading requires precise skill that beginners don\'t have.'
        }
      ]
    },

    {
      id: 'm08',
      title: 'Key intraday levels: PDH, PDL, ONH, ONL, VWAP',
      summary:
        "Five reference levels that institutional traders, algorithms, and experienced retail all watch. Knowing where these are tells you where the day's most-watched battles will be fought.",
      sections: [
        {
          heading: 'Why these specific levels matter',
          body: [
            "Most retail traders draw arbitrary support/resistance based on what their eye picks out. Institutional desks and algorithms are more disciplined: they reference a specific small set of levels every day.",
            "Knowing what they're watching means you're trading the same map. Trades that align with these levels have institutional flow on your side; trades that ignore them are running blind.",
            "Five levels matter every day, in this order of importance: VWAP, prior day high/low, overnight high/low, opening range high/low, and the daily open."
          ]
        },
        {
          heading: 'VWAP: the institutional benchmark',
          body: [
            "**VWAP = Volume-Weighted Average Price.** It's the average price traded so far today, weighted by volume at each price. It updates continuously as new trades print.",
            "Why does it matter? Two reasons:",
            "**1. Execution benchmark.** Large institutional orders are typically executed against VWAP — meaning the desk is judged on whether they bought below VWAP (good) or above (bad). This creates real, directional flow around the level.",
            "**2. Mean reversion anchor.** Price tends to oscillate around VWAP intraday. When price is far above VWAP, mean-reversion sellers appear; far below, mean-reversion buyers appear.",
            "**Practical use:** if ES is trading well above VWAP, longs entered today are in profit and the path of least resistance has been higher. If ES is trading below VWAP, the day has been a sellers' market. A trend day is one where price moves away from VWAP and stays away. A range day is one where price oscillates around VWAP.",
            "**Most platforms have VWAP as a built-in indicator.** Add it to your ES chart now. You should never trade ES without VWAP visible."
          ]
        },
        {
          heading: 'PDH and PDL: prior day\'s high and low',
          body: [
            "**PDH = Prior Day High. PDL = Prior Day Low.** These are the high and low of the *cash session* (RTH: 9:30am–4pm ET) of the previous trading day.",
            "Why they matter: yesterday's range is the most recent reference for what \"high\" and \"low\" mean. A break above PDH today signals that today's session is taking out the prior day's bullish extreme — a directional event. A reclaim of PDL after breaking it can signal reversal.",
            "**Mark these every day.** They're often the most-watched levels in the entire chart, especially in the first hour after the open."
          ]
        },
        {
          heading: 'ONH and ONL: overnight high and low',
          body: [
            "**ONH = Overnight High. ONL = Overnight Low.** These are the high and low of price action between yesterday's cash close (4pm ET) and today's cash open (9:30am ET).",
            "The overnight session is usually low-volume drift, but it's not random. Often the first move after the cash open is to test ONH or ONL — to check if the level holds.",
            "**Common pattern:** ES opens, drives directly into ONH (or ONL), and either breaks through with conviction or reverses sharply. Watching this play out in the first 15 minutes of the cash session is one of the cleanest reads of intent that exists."
          ]
        },
        {
          heading: 'Daily open and the opening range',
          body: [
            "**Daily Open** is the first print of the cash session at 9:30am ET. Many strategies reference whether price is currently above or below the open — it's a binary day-direction signal.",
            "**Opening Range (OR)** is the high and low of the first 5, 15, or 30 minutes of the cash session (different traders use different definitions; 30 minutes is common). The OR captures the initial battle between participants. A break of the OR often signals the intraday direction.",
            "**Trader rule of thumb:** if price holds above the OR high after a breakout, the day tends to trend up. If price reclaims the OR low after breaking it (a failed breakout), the day often reverses down. The OR is one of the most actively watched intraday levels by professional traders."
          ]
        }
      ],
      diagram: 'key_levels',
      takeaways: [
        { id: 'm08.t1', text: 'Five levels matter daily: VWAP, PDH/PDL, ONH/ONL, daily open, opening range. Mark them.' },
        { id: 'm08.t2', text: 'VWAP is the institutional benchmark — never trade ES without it visible. Above VWAP = bullish bias intraday. Below = bearish.' },
        { id: 'm08.t3', text: 'PDH/PDL/ONH/ONL are the most-watched levels in the first hour of cash. Reactions there are real.' },
        { id: 'm08.t4', text: 'Opening range breaks (and failed breaks) signal intraday direction. Watch the first 15-30 minutes for the day\'s tone.' }
      ],
      task: {
        title: 'Build your daily levels checklist',
        steps: [
          'Open ES on the 5-minute chart in TradingView.',
          'Add the VWAP indicator (search "VWAP" in indicators).',
          'Manually draw horizontal lines for: yesterday\'s high (PDH), yesterday\'s low (PDL), today\'s overnight high (ONH), today\'s overnight low (ONL), today\'s daily open.',
          'Label each line clearly.',
          'Watch how price reacts at each level today. Are they tested? Held? Broken?',
          'Save this template. Every trading day, before 9:30am ET, refresh the levels.'
        ]
      },
      quiz: [
        {
          q: 'VWAP stands for and primarily matters because:',
          options: [
            'Volume-Weighted Average Price; it\'s an institutional execution benchmark and intraday mean-reversion anchor',
            'Volatility Weighted Average Position; tracks options flow',
            'Variable Width Adaptive Plot; it\'s a charting technique',
            'Volume Weighted Aggregate Pricing; only matters for stocks'
          ],
          answer: 0,
          explain: 'VWAP = Volume-Weighted Average Price. Institutions execute against it; price tends to oscillate around it intraday. It\'s the most-watched intraday level after PDH/PDL.'
        },
        {
          q: 'Prior Day High (PDH) refers to the high of:',
          options: [
            'The full 24-hour session including overnight',
            'The cash session (RTH: 9:30am–4pm ET) of yesterday',
            'Last week',
            'Premarket'
          ],
          answer: 1,
          explain: 'PDH/PDL refer to the cash/RTH session high and low of the prior day. The 24-hour high (which would include overnight) is a different level.'
        },
        {
          q: 'A typical clean intraday signal is when:',
          options: [
            'Price ignores all key levels',
            'Price breaks the opening range high and holds above it for the rest of the day, suggesting a trend day',
            'Price stays exactly at VWAP all day',
            'Volume is low'
          ],
          answer: 1,
          explain: 'Opening range breakouts that hold are one of the most consistent intraday signals. Failed breakouts (price reclaims the broken level) are the inverse: a reversal signal.'
        }
      ]
    },

    {
      id: 'm09',
      title: 'The patterns that actually work (and the ones that don\'t)',
      summary:
        "Most candle patterns from textbooks are noise. A small handful are real because they encode genuine participant behavior. Here are the ones worth knowing.",
      sections: [
        {
          heading: 'Why most candle patterns fail',
          body: [
            "Open any beginner trading book and you'll see 30+ named patterns: bullish engulfing, three white soldiers, morning star, abandoned baby, hanging man, harami cross, and so on.",
            "Empirically, when these are tested in academic studies on real data, most have no statistical edge. They're folklore — patterns named because they're visually distinctive, not because they predict price.",
            "What does work, sometimes, is patterns that encode a specific story of participant behavior at a meaningful price level. Note the conditional: at a meaningful price level. Pattern at a random price = noise. Pattern at PDH or VWAP = potentially actionable.",
            "**The pattern is never the trade. The level is the trade. The pattern is just the trigger that confirms participants are reacting at the level.**"
          ]
        },
        {
          heading: 'Pattern 1: Rejection at a level (the long wick)',
          body: [
            "Setup: price approaches a key level (say, PDH from below). It pierces through briefly — wicks above the level — but the candle closes back below. The wick is rejection.",
            "What it means: buyers tried to push above the level and failed. Sellers stepped in and pushed price back down. The level held.",
            "Trade implication: a short entry on the close, with a stop just above the wick high, targeting the recent swing low or VWAP. Risk is defined (above wick), reward is the move back into the prior range.",
            "**Critical caveat:** this only works at meaningful levels. The same candle structure in the middle of a chop range means nothing — there's no participant story there."
          ]
        },
        {
          heading: 'Pattern 2: Failed breakout (the bull/bear trap)',
          body: [
            "Setup: price breaks above a key level (PDH, opening range high, etc.) on what looks like a clean breakout. Momentum traders pile in long. But within a few candles, price drops back below the level. The breakout failed.",
            "What it means: buyers tried, exhausted, and supply at the level overwhelmed them. The trapped longs are now in losses, providing fuel for the reversal as they exit.",
            "Trade implication: short on the reclaim of the broken level (i.e., when price closes back below it), stop above the failed-breakout high, target back into the prior range or to next level.",
            "Why this works: it's a real psychological event. The pattern reflects actual trader pain. The trapped buyers will exit, and that exit IS the move."
          ]
        },
        {
          heading: 'Pattern 3: Higher-low support test (continuation)',
          body: [
            "Setup: market is in an uptrend (HH/HL on your chosen timeframe). Price pulls back to a previous resistance-now-support level, or to VWAP, or to a HL from earlier in the move. It tests the level — wicks down, brief interaction — and bounces with a strong close.",
            "What it means: pullback got bought. Trend integrity intact. Buyers re-entering at the discount.",
            "Trade implication: long on the bounce, stop below the swing low of the test, target the next HH or beyond. The trend trade is the highest-probability setup that exists; this is one form of trend continuation.",
            "Why it works: it aligns with the higher-timeframe direction (uptrend), enters at a defined level (the prior HL or support), and has a clear stop (below the test). All three boxes checked."
          ]
        },
        {
          heading: 'A final word on patterns',
          body: [
            "These three are not magic. They fail constantly. The point is not that you take every one and print money — the point is that they're the patterns where there's a coherent story about why participants would behave this way.",
            "Random pattern in random place = noise. Pattern at a level + aligned with higher-timeframe trend + clear stop = trade candidate.",
            "When you build your playbook in Phase 5, these patterns (and 1-2 others you'll add) become the entries. The level is the location. The trend is the direction. The pattern is just the timing trigger. All three together = a setup."
          ]
        }
      ],
      diagram: 'patterns',
      takeaways: [
        { id: 'm09.t1', text: 'Most named candle patterns have no edge. The few that work do so because they encode real participant behavior at meaningful levels.' },
        { id: 'm09.t2', text: 'The pattern is not the trade. The level is the trade. The pattern is the trigger that confirms participant reaction.' },
        { id: 'm09.t3', text: 'Three patterns worth knowing: rejection at a level (long wick), failed breakout, and higher-low support test in an uptrend.' }
      ],
      task: {
        title: 'Find these three patterns on real charts',
        steps: [
          'On TradingView, scroll back through the last 2 weeks of ES on the 15-minute chart.',
          'Find one example of each pattern: a rejection at PDH or PDL, a failed breakout of an opening range, and a higher-low test in an uptrend.',
          'Screenshot each. Note the exact level the pattern occurred at.',
          'For each, ask: was the level meaningful? What was the participant story? Was the higher-timeframe trend aligned?',
          'Save these as your "real example" file. You\'ll add to it weekly.'
        ]
      },
      quiz: [
        {
          q: 'A bullish engulfing candle pattern in the middle of a chop range, with no relation to any key level, is:',
          options: [
            'A guaranteed buy signal',
            'Probably noise — pattern without context has no edge',
            'A short signal',
            'A pattern that always works on ES'
          ],
          answer: 1,
          explain: 'Patterns without context (no level, no trend alignment) are statistically noise. The pattern is not the trade — the level is.'
        },
        {
          q: 'A failed breakout above PDH, where price reclaims back below, suggests:',
          options: [
            'The breakout will resume next candle',
            'Trapped buyers above PDH will exit, providing selling pressure for a reversal',
            'Price will hold at PDH forever',
            'The chart is broken'
          ],
          answer: 1,
          explain: 'Trapped longs are now sellers. The reversal move is partly fueled by them exiting. This is a real psychological event, not magic.'
        },
        {
          q: 'The highest-quality setup combines:',
          options: [
            'Pattern alone',
            'Level alone',
            'Trend alone',
            'Pattern + level + alignment with higher-timeframe trend'
          ],
          answer: 3,
          explain: 'All three together = a real edge. Any one alone is much weaker. Confluence is the discipline.'
        }
      ]
    }
  ]
};
