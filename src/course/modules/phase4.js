// Phase 4 — Order Flow & Market Structure
// Modules m14..m17

export const phase4 = {
  id: 'p4',
  title: 'Order Flow & Market Structure',
  description:
    "How the market actually works under the chart. Auction theory, the DOM, time and sales, market profile basics. Most retail traders never learn this. The ones who do have a real edge over those who don't.",
  modules: [
    {
      id: 'm14',
      title: 'Auction theory: what the market actually is',
      summary:
        "Markets are continuous two-way auctions. Price isn't a number that moves randomly — it's a discovery mechanism for finding levels at which buyers and sellers agree to transact. Once you see this, charts read differently.",
      sections: [
        {
          heading: 'The market as auction',
          body: [
            "Pete Steidlmayer, who developed the Market Profile concept at the Chicago Board of Trade, framed it best: every market is a continuous double auction. At every moment, buyers are bidding (offering to buy at a price); sellers are asking (offering to sell at a price). Trade happens where bids meet asks.",
            "**Price moves up when buyers raise their bids to attract sellers.** This implies buyers are more eager than sellers — they're willing to pay more to get filled. The price has to rise until enough sellers are tempted out of the woodwork.",
            "**Price moves down when sellers lower their asks to attract buyers.** Sellers are more eager — willing to take less to get out.",
            "**Price stays in a range when neither side is desperate.** Buyers and sellers transact comfortably in a band. The auction is balanced.",
            "This sounds obvious. The implication isn't: **price levels are not arbitrary numbers; they're memories of where buyers and sellers agreed to transact in the past, and reasons buyers/sellers might or might not appear there again in the future.**"
          ]
        },
        {
          heading: 'Two market modes: balance and imbalance',
          body: [
            "**Balance** is when price oscillates within a defined range. Both sides are content trading inside the range. Volume distributes evenly across the range. Most days are balance days — 60-70% of trading sessions on ES.",
            "**Imbalance** is when price decisively breaks out of a range and trends. One side has overpowered the other. Volume builds at new prices outside the prior range. Trend days are imbalance days — they happen, but they're a minority.",
            "**Why this matters for trading:** the strategies that work in balance are the opposite of those that work in imbalance.",
            "**In balance:** fade the edges of the range (sell highs, buy lows) because the auction is stuck. Mean reversion works. Breakout strategies fail because most breakouts are false.",
            "**In imbalance:** ride the trend (buy pullbacks in uptrends, short rallies in downtrends). Continuation works. Mean reversion fails because price keeps making new extremes.",
            "**Most days look like one or the other.** The trader's job in the first hour is to figure out: is today balance or imbalance? Then apply the correct playbook. Misreading the day is the largest single source of preventable losses."
          ]
        },
        {
          heading: 'Volume: the truth-teller',
          body: [
            "Price tells you where the market is. Volume tells you who cares.",
            "**High volume at a price means strong conviction — many participants transacted there.** That price is a meaningful level; the market \"validated\" it.",
            "**Low volume at a price means low conviction — few transacted there.** That price is more like a transit zone, where the auction was passing through.",
            "Imbalance days produce **volume profiles that are skewed**: most volume happens at new prices in the trend direction, with thin volume in the prior range that's now being abandoned.",
            "Balance days produce **bell-shaped volume profiles**: most volume at the middle of the range, less at the edges. The middle is where buyers and sellers agreed; the edges are where one side rejected.",
            "This is the foundation of Market Profile, which we cover in module 17. For now, the principle: **volume tells you where consensus formed. Watch for volume to validate or invalidate price levels.**"
          ]
        }
      ],
      diagram: 'auction',
      takeaways: [
        { id: 'm14.t1', text: 'Markets are continuous double auctions. Price moves up when buyers are more eager; down when sellers are. Levels are memories of agreement.' },
        { id: 'm14.t2', text: 'Two modes: balance (range, mean-reversion works) and imbalance (trend, continuation works). 60-70% of days are balance.' },
        { id: 'm14.t3', text: 'Volume tells you where consensus formed. High-volume prices are meaningful levels; low-volume prices are transit zones.' }
      ],
      task: {
        title: 'Identify mode for each of the last 5 days',
        steps: [
          'On the ES daily chart, look at the last 5 trading days.',
          'For each, classify: was it a balance day (range) or imbalance day (trend)?',
          'How would you have known by 10:30am ET? Look at the first hour\'s structure: was price oscillating around a midpoint or making sustained directional progress?',
          'For each day, note: did the day stay true to its early signal, or did it transition mid-session?',
          'This exercise is what experienced traders do every morning. The first hour tells you which playbook to run.'
        ]
      },
      quiz: [
        {
          q: 'A "balance" day is one where:',
          options: [
            'Price trends in one direction all day',
            'Price oscillates within a range, with volume distributed evenly across the range',
            'Volume is zero',
            'Only one side is trading'
          ],
          answer: 1,
          explain: 'Balance = range-bound auction with both sides content. Bell-shaped volume profile. Most days are balance days.'
        },
        {
          q: 'In an imbalance (trend) day, the strategy that works best is:',
          options: [
            'Fading the highs and lows (mean reversion)',
            'Continuation — buying pullbacks in the trend direction',
            'Breakeven trades',
            'No trades at all'
          ],
          answer: 1,
          explain: 'Trends reward continuation. Mean reversion in trends gets crushed. Reading the day correctly is the foundation of which playbook to run.'
        },
        {
          q: 'A high-volume price level is:',
          options: [
            'Random noise',
            'A meaningful level where many participants transacted, likely to be defended again',
            'Always a turning point',
            'A guaranteed reversal'
          ],
          answer: 1,
          explain: 'High volume = many participants validated the price. The level is "real" in the sense that participants will reference it again. Not guaranteed turning point — but more likely to react there than at random prices.'
        }
      ]
    },

    {
      id: 'm15',
      title: 'The DOM and time & sales: reading order flow',
      summary:
        "Before there are charts, there are bids, asks, and trades. The DOM and time & sales show the actual order flow. Reading them tells you what's happening right now, not what already happened.",
      sections: [
        {
          heading: 'The DOM: a window into the order book',
          body: [
            "DOM = Depth of Market, also called the order book or ladder. It shows resting orders at each price level: how many contracts traders are willing to buy (bids) at each price below the current price, and how many they're willing to sell (asks) at each price above.",
            "On a typical ES DOM, you might see: 200 contracts bidding at 5800.00, 150 at 5799.75, 180 at 5799.50, etc. — and on the ask side, 180 at 5800.25, 220 at 5800.50, 250 at 5800.75, etc.",
            "**The current price is where the bid and ask meet.** The current best bid (\"best bid\") is the highest price someone is willing to buy at. The current best ask is the lowest price someone is willing to sell at. The gap between them is the **spread**.",
            "On ES, the spread is almost always 1 tick = 0.25 = $12.50. ES is liquid enough that spreads tighter than that are rare and wider than that mean the market is in a stress event."
          ]
        },
        {
          heading: 'What the DOM does and doesn\'t tell you',
          body: [
            "**What it shows:** resting limit orders. Traders who have committed to buy or sell at specific prices and are waiting.",
            "**What it doesn\'t show:** market orders that are about to be sent. Stops that are about to trigger. Hidden \"iceberg\" orders that show only a fraction of their size. Algorithmic spoofers (showing fake orders to mislead other participants, then pulling them).",
            "**A naive trader sees a 500-contract bid and thinks \"strong support — I'll buy with that.\"** Then the bid gets pulled before any of it fills, and price drops 10 points. The bid was never going to be there for a real fill — it was display, possibly to create the illusion of demand and trick smaller traders into buying ahead of a planned sell.",
            "**Sophisticated DOM reading is mostly a 2010-era skill.** Modern markets are dominated by HFT algorithms that can spoof, layer, and pull within microseconds. For retail, the DOM is most useful for: seeing the spread, judging immediate liquidity (is there 100 or 1000 contracts in the next 5 ticks?), and watching for sudden disappearance of resting orders, which can precede a fast move.",
            "Don't try to trade off DOM patterns alone. They're noisy at best, manipulated at worst."
          ]
        },
        {
          heading: 'Time & sales: the trade tape',
          body: [
            "Time & Sales (T&S, also called the \"tape\") is a streaming list of every trade that has executed. Each line shows: time, price, size, and which side it hit (bid or ask).",
            "**A trade hitting the ask** means a buyer was aggressive — they accepted the offer price. This is buying pressure.",
            "**A trade hitting the bid** means a seller was aggressive — they accepted the bid price. This is selling pressure.",
            "**The information is in the size.** A 1-contract trade is noise. A 50-contract trade is somebody. A 200-contract trade is someone with serious size.",
            "**A useful read:** when you see a cluster of 100+ contract trades hitting the ask in quick succession, somebody is buying aggressively. If price doesn't move much despite the buying, there's strong supply at the level absorbing it. If price moves up immediately, supply has been overwhelmed.",
            "**The opposite:** large prints hitting the bid with no price move = strong demand absorbing the selling. Large prints hitting the bid with price collapsing = supply has overwhelmed demand.",
            "This is **absorption** vs. **exhaustion**. Reading absorption requires watching the tape continuously — it's an active skill, not a glance."
          ]
        },
        {
          heading: 'Practical use of DOM and T&S for ES',
          body: [
            "For most retail ES traders, DOM and T&S are most useful as **execution tools** rather than primary signals:",
            "**1.** When entering a trade, glance at the DOM to make sure liquidity is there. If the next 5 ticks have only 50 contracts total, your market order is going to slip badly. Wait or use a limit.",
            "**2.** When you see price approach a key level, watch the tape for absorption (large prints with no follow-through) vs. continuation (large prints with strong follow-through). Absorption suggests reversal; continuation suggests breakout.",
            "**3.** During fast moves, check the spread on the DOM. If it widens from 1 tick to 2-3 ticks, the market is in stress and slippage will be worse than normal — adjust expectations.",
            "**Footprint charts** (which we cover briefly in module 16) attempt to systematize order-flow reading by displaying volume at each price level over each candle. They're better than raw DOM watching for retail because they show the historical record rather than requiring real-time tape reading. Many futures traders use footprints as their primary chart in the last 5-10 years."
          ]
        }
      ],
      diagram: 'dom_tape',
      takeaways: [
        { id: 'm15.t1', text: 'DOM = resting limit orders at each price. Shows liquidity available, but can be manipulated by spoofing/layering.' },
        { id: 'm15.t2', text: 'Time & Sales = stream of executed trades. Hitting ask = aggressive buyer; hitting bid = aggressive seller.' },
        { id: 'm15.t3', text: 'Watch for absorption (large prints with no price move = level holding) vs. continuation (large prints with follow-through = breakout real).' },
        { id: 'm15.t4', text: 'For retail, DOM/T&S are best used as execution tools (checking liquidity, watching at key levels) rather than primary signals.' }
      ],
      task: {
        title: 'Watch the DOM and tape during the cash open',
        steps: [
          'Before the cash open at 9:30am ET, open ES on a platform with DOM and T&S visible (Tradovate, Sierra Chart, NinjaTrader all support this).',
          'For the first 30 minutes of the session, watch ONLY the DOM and tape. No charts.',
          'Note: the spread (does it widen on fast moves?), the size of resting orders (does it shrink during volatile moments?), the size of prints on the tape (any 100+ contract trades?).',
          'Can you tell from the tape alone whether buyers or sellers are more aggressive?',
          'Then bring up the chart. Does what you saw on the tape match the chart? This is order-flow reading. It\'s a learned skill that takes weeks to develop.'
        ]
      },
      quiz: [
        {
          q: 'A trade printing on the ask side of the tape means:',
          options: [
            'A seller was aggressive',
            'A buyer was aggressive (they accepted the ask price)',
            'No information',
            'The trade was canceled'
          ],
          answer: 1,
          explain: 'Hitting the ask = a buyer paid the ask price. They were aggressive. Hitting the bid = a seller accepted the bid price.'
        },
        {
          q: 'You see a 500-contract bid suddenly appear on the DOM at a key support level. The most reliable interpretation is:',
          options: [
            'Strong support — definitely buy here',
            'It might be real demand, or it might be spoofing/layering. Watch what happens to the bid: does it stay and absorb, or get pulled before any of it fills?',
            'Always sell into displayed demand',
            'Ignore the DOM entirely'
          ],
          answer: 1,
          explain: 'Displayed orders can be manipulated. Real demand absorbs flow without disappearing. Watching whether the order stays or pulls is the diagnostic, not the displayed size alone.'
        },
        {
          q: 'Absorption is best described as:',
          options: [
            'When price moves through a level easily',
            'When a level is hit with strong order flow but price doesn\'t move much, suggesting the level is holding',
            'A type of stop order',
            'When volume is low'
          ],
          answer: 1,
          explain: 'Absorption = the level is taking flow without giving way. Often precedes a reversal because the aggressive side is exhausting itself against a wall of opposite intent.'
        }
      ]
    },

    {
      id: 'm16',
      title: 'Footprint charts and volume at price',
      summary:
        "Footprint charts make order flow visible historically rather than requiring real-time tape reading. They're how most modern futures traders see what's happening under the candle.",
      sections: [
        {
          heading: 'What a footprint chart shows',
          body: [
            "A footprint chart is a candle chart with extra information: at each candle, you can see the volume traded at each price level within that candle, broken down by buy volume (volume at ask) vs. sell volume (volume at bid).",
            "Where a normal candle just shows OHLC, a footprint candle is a vertical column of price levels, each showing the buy/sell volume at that level. Some platforms color-code: green for buy-dominant prices, red for sell-dominant.",
            "**The information you get for free:** which prices within the candle had buying pressure vs. selling pressure. Whether the high or low was tested with volume or just briefly wicked through. Whether the close happened with conviction or fade.",
            "Many ES traders use the footprint as their primary chart, with the standard candle chart only as a reference for higher-timeframe context."
          ]
        },
        {
          heading: 'Reading a footprint candle',
          body: [
            "**A bullish candle with volume concentrated at the high, with buy-volume dominance:** real buying drove the candle up. Probable continuation.",
            "**A bullish candle that closed strong, but volume concentrated at the low with sell-volume dominance:** the up move was thin. Buyers got the close but not the volume. Suspicious continuation.",
            "**A doji where buy and sell volumes are roughly balanced at every price:** a true balance candle. Indecision is real, not just visual.",
            "**A doji where one side is dominant on inspection but the open and close are close:** participants disagreed but neither won the close. Often a transition signal — the next candle reveals which side wins.",
            "Reading footprints is a skill that takes weeks. Start by simply observing: which prices in a given candle had the most volume? Did the high get volume (real test) or just wick (briefly poked)? This habit alone improves your read of price action substantially."
          ]
        },
        {
          heading: 'Volume Profile: the same idea, applied across time',
          body: [
            "**Volume Profile** is a sibling of footprint: it shows total volume traded at each price level, aggregated across a chosen time period (today's session, last week, last month, etc.).",
            "Plotted as a horizontal histogram on the right side of the chart, with thick bars at high-volume prices and thin bars at low-volume prices.",
            "**Key concepts from volume profile:**",
            "**POC (Point of Control):** the price with the most volume. Usually the \"fair price\" of the session — where buyers and sellers agreed most.",
            "**VAH and VAL (Value Area High and Low):** the price range containing the central 70% of volume. Often acts as a range within which the market is comfortable trading.",
            "**HVN (High Volume Node):** local volume peaks. Often act as support/resistance.",
            "**LVN (Low Volume Node):** thin spots in the profile. Price tends to move quickly through these because there's no liquidity to absorb. Identifying LVNs in advance can predict where moves will accelerate."
          ]
        },
        {
          heading: 'Practical use for ES',
          body: [
            "For an ES day trader, the most useful volume profile elements are:",
            "**1.** The prior day's POC (yPOC) and Value Area (yVA). These act as magnets and reference points for today's auction. If today opens above yVAH, it's signaling a higher-time-frame imbalance day. If today opens within yVA, the prior day's range is likely to be in play.",
            "**2.** Today's developing POC. Updates throughout the session. Shows the current \"fair price\" of the auction.",
            "**3.** LVNs from recent sessions. Price often accelerates through LVNs and stalls at HVNs. Knowing where the next LVN is tells you where to expect either a fast move or a likely pause.",
            "**Most modern charting platforms have volume profile built in.** TradingView's free version has it; Sierra Chart, NinjaTrader, and dxFeed-based platforms all include it. Add it to your chart now."
          ]
        }
      ],
      diagram: 'volume_profile',
      takeaways: [
        { id: 'm16.t1', text: 'Footprint charts show buy/sell volume at each price within each candle. Reveal whether moves were conviction or thin.' },
        { id: 'm16.t2', text: 'Volume Profile aggregates volume by price across a period. POC = highest-volume price. Value Area = central 70% of volume.' },
        { id: 'm16.t3', text: 'LVNs (low-volume nodes) are thin areas where price accelerates through. HVNs (high-volume nodes) tend to attract and pause price.' },
        { id: 'm16.t4', text: 'For ES, prior-day POC, VAH, VAL are key reference levels. Today\'s developing profile shows where current consensus is forming.' }
      ],
      task: {
        title: 'Add volume profile to your ES chart',
        steps: [
          'In TradingView, search "Volume Profile" or "Session Volume Profile" in indicators. Add the Session Volume Profile (free version).',
          'On a 5-minute or 15-minute chart, observe yesterday\'s session profile. Identify: yPOC, yVAH, yVAL.',
          'Mark these as horizontal lines.',
          'Watch how today\'s price interacts with them. Does it open above/below/within? Does it test yPOC?',
          'After today\'s close, look at today\'s profile. Where did the POC form? Was the day balance (bell-shaped) or imbalance (skewed)?',
          'Save these as part of your daily levels.'
        ]
      },
      quiz: [
        {
          q: 'POC stands for and represents:',
          options: [
            'Price of Close; the closing price',
            'Point of Control; the price with the highest volume traded in the period',
            'Power of Call; an options metric',
            'Path of Cancellation'
          ],
          answer: 1,
          explain: 'POC = Point of Control = the highest-volume price in a profile. Often the "fair price" of the session. Strong reference level.'
        },
        {
          q: 'A Low Volume Node (LVN) is a price area where:',
          options: [
            'Volume was very high',
            'Few contracts traded; price tends to accelerate through it because there\'s no liquidity to absorb',
            'Stops are clustered',
            'No information'
          ],
          answer: 1,
          explain: 'LVN = thin volume area. Price tends to pass through quickly because there\'s nothing to slow it down. HVNs are the opposite — price tends to attract and pause.'
        },
        {
          q: 'A bullish candle that closed strong but had volume concentrated at the LOW with sell-volume dominance is:',
          options: [
            'A clear continuation signal',
            'A suspicious move — buyers got the close but not the participation; continuation is uncertain',
            'A guaranteed reversal',
            'Not interpretable'
          ],
          answer: 1,
          explain: 'Strong close + thin participation in the up direction = suspicious. Real moves have volume on the candle\'s direction, not against it. Footprint reveals this where standard candles hide it.'
        }
      ]
    },

    {
      id: 'm17',
      title: 'Market profile basics',
      summary:
        "Steidlmayer's framework for visualizing the auction. Explains why ranges develop, why breakouts happen, and what \"day type\" you're in. Worth understanding even if you don't use it as a primary tool.",
      sections: [
        {
          heading: 'The TPO chart',
          body: [
            "Market Profile uses **TPOs** (Time Price Opportunities). Imagine the trading session divided into 30-minute periods (A, B, C, D...). For each period, you mark every price that was traded with the letter for that period.",
            "Result: a horizontal histogram of letters, where the width at each price tells you how many 30-minute periods touched that price.",
            "**Wide rows** mean many periods traded there → fair price → the market spent time agreeing.",
            "**Narrow rows** (just one or two letters) mean price passed through quickly without participants engaging → unfair price → market wanted to leave.",
            "Connect this back to the auction theory in module 14: the market is searching for fair value. Wide TPO areas are where it found agreement. Narrow areas are where it was rejected and moved on."
          ]
        },
        {
          heading: 'Day types',
          body: [
            "Steidlmayer classified trading days into types based on the resulting profile shape:",
            "**Normal day:** the initial range (first hour) holds for most of the day. Profile is bell-shaped centered on a clear midpoint. ~60% of days.",
            "**Trend day:** price breaks out of initial balance and trends one direction with little retracement. Profile is elongated, skewed, or absent of a clear bell. ~10-15% of days.",
            "**Double-distribution day:** price establishes a range, breaks out, and forms a second range at a new level. Profile shows two bell shapes stacked. ~10-15%.",
            "**Neutral day:** price probes both above and below the initial balance but returns to the middle. Profile is bell-shaped but extended on both sides. ~10%.",
            "**Why this matters:** different day types reward different playbooks. Normal day → fade extremes back to midpoint. Trend day → continuation only, no countertrend trades. Double-distribution day → trade the breakout and the new range. Neutral day → assume the close will be near the open.",
            "Reading day type early (by 11am ET, ideally) is one of the highest-value skills in intraday futures trading."
          ]
        },
        {
          heading: 'Initial Balance: the first hour\'s range',
          body: [
            "**Initial Balance (IB)** is the high-low range of the first hour of the cash session — 9:30am to 10:30am ET on ES.",
            "Many strategies and statistical edges revolve around the IB:",
            "**IB hold (price stays inside):** roughly 65% of days respect the IB as the day's range or close to it. Fading the IB extremes is statistically reasonable.",
            "**IB break (price exits the range):** signals potential trend day. About 35% of days.",
            "**IB extension:** if price breaks IB by 50% of IB range without retracing, the day is more likely trend than normal. The first IB break is a tradeable signal.",
            "**Failed IB break:** price exits IB, then reclaims back inside. Strong reversal signal, often back to the opposite IB extreme.",
            "**Practical rule:** mark the IB high and low at 10:30am ET each day. Watch what happens at those levels for the rest of the session."
          ]
        },
        {
          heading: 'Should you use Market Profile?',
          body: [
            "Honest take: Market Profile is one of the most respected frameworks in futures, used by professional desks for decades. It's also dense, somewhat outdated in pure form (designed for floor-traded markets), and requires study to apply well.",
            "**The concepts are universal:** auction theory, day types, initial balance, value areas. These will improve your trading even if you never use a TPO chart in your life. Most modern traders use volume profile (which is conceptually similar but volume-based instead of time-based) and reference initial balance without drawing TPOs explicitly.",
            "**The pure TPO chart is optional.** Whether to study Steidlmayer's original work or stick with concepts via volume profile is a matter of how deep you want to go. For most retail traders, understanding the principles via volume profile is sufficient.",
            "**Good resources if you want depth:** *Mind Over Markets* by James Dalton (the practitioner's reference), Steidlmayer's original *Markets and Market Logic* (denser, foundational). Both are widely available."
          ]
        }
      ],
      diagram: 'market_profile',
      takeaways: [
        { id: 'm17.t1', text: 'Market Profile (TPO) shows time spent at each price. Wide areas = fair value (consensus). Narrow areas = rejected prices.' },
        { id: 'm17.t2', text: 'Day types: Normal (~60%), Trend (~15%), Double-distribution (~15%), Neutral (~10%). Each rewards a different playbook.' },
        { id: 'm17.t3', text: 'Initial Balance = first-hour range. Holds 65% of days. Watch IB break/failed-break as primary day-type signals.' },
        { id: 'm17.t4', text: 'Volume Profile captures most MP value with simpler tooling. Pure TPO is optional; the underlying concepts are essential.' }
      ],
      task: {
        title: 'Identify day type for the last 5 days',
        steps: [
          'On the ES daily/30-min chart, look at the last 5 trading sessions.',
          'For each, classify: Normal, Trend, Double-distribution, or Neutral?',
          'Mark the Initial Balance (9:30-10:30am ET range) for each.',
          'Did the IB hold? If broken, did the break extend (trend) or fail (reversal)?',
          'Note: how would you have known by 11am ET each day what type it was?',
          'Pattern recognition: over 50+ days of doing this, you\'ll start reading the day correctly within the first hour. That alone is worth months of study.'
        ]
      },
      quiz: [
        {
          q: 'A "Trend day" in Market Profile is characterized by:',
          options: [
            'A bell-shaped profile centered on the open',
            'An elongated, skewed profile where price moves one direction with little retracement',
            'No volume',
            'Two distinct ranges'
          ],
          answer: 1,
          explain: 'Trend days have stretched, asymmetric profiles. Price keeps making new extremes in one direction. Counter-trend trades fail; continuation works.'
        },
        {
          q: 'Initial Balance (IB) is:',
          options: [
            'The opening price',
            'The first hour of the cash session\'s high-low range',
            'A type of order',
            'The previous day\'s close'
          ],
          answer: 1,
          explain: 'IB = first hour\'s range, roughly 9:30-10:30am ET on ES. Holds 65% of days. Break/failed-break of IB is one of the most-watched intraday signals.'
        },
        {
          q: 'Wide TPO rows in a Market Profile chart indicate:',
          options: [
            'Prices the market quickly rejected',
            'Prices where many time periods traded — the market\'s "fair value" zone',
            'Errors in the data',
            'Lunch hour'
          ],
          answer: 1,
          explain: 'Wide = many time periods touched the price = participant agreement = fair value. Narrow = rejected prices the auction wanted to leave.'
        }
      ]
    }
  ]
};
