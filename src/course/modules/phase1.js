// Phase 1 — Foundations
// Modules m01..m04
// Content style: direct, treats reader as capable adult, no fluff,
// honest about what's known vs disputed.

export const phase1 = {
  id: 'p1',
  title: 'Foundations',
  description:
    "What futures actually are, what ES is, the math of leverage and ticks, " +
    "how orders work, and how the trading day flows. Skim none of this — " +
    "everything in later phases assumes you know it cold.",
  modules: [
    {
      id: 'm01',
      title: 'What futures actually are',
      summary:
        'A futures contract is a binding agreement to buy or sell a specific thing at a specific price on a specific future date. The price is set now, the exchange happens later. Everything else is consequence of that.',
      sections: [
        {
          heading: 'The simplest possible definition',
          body: [
            "A futures contract is a legal agreement between two parties to exchange a specific asset, in a specific quantity, at a specific price, on a specific future date.",
            "That's it. The exchange (CME, ICE, etc.) standardizes the terms — quantity, expiry date, what counts as delivery — and acts as the counterparty to both sides through its clearinghouse, which is why you don't actually need to know who's on the other side of your trade.",
            "Originally these contracts existed so a wheat farmer in May could lock in a price for grain delivered in September, and a bread company could lock in their input cost for the same period. Both sides are happy because both have removed price risk.",
            "Today, the vast majority of futures volume is speculation and hedging by financial firms, not commercial delivery. But the structure is identical to the original wheat contract: agreement now, settlement later."
          ]
        },
        {
          heading: 'How is this different from stocks?',
          body: [
            "When you buy a share of Apple, you own a tiny slice of Apple. It exists indefinitely; it pays dividends; you can hold it for 50 years.",
            "When you buy an ES futures contract, you don't own a slice of anything. You've entered a temporary agreement that expires on a specific date (typically quarterly: March, June, September, December). On that date, the contract either settles in cash or rolls into the next quarter.",
            "Two practical implications: (1) Futures positions are time-bound. If you don't close before expiry, you'll be auto-settled or rolled. (2) There's no buy-and-hold-forever play. Futures are inherently a trader's instrument."
          ]
        },
        {
          heading: 'Why traders use them anyway',
          body: [
            "Futures have four properties that make them attractive:",
            "**Leverage** — you control a $300,000+ position with maybe $13,000 in margin. We'll cover what this actually means in module 3. For now, know that a 1% move in the underlying produces ~20%+ swing on your margin.",
            "**Liquidity** — ES is one of the most liquid instruments on Earth. You can enter and exit any size a retail trader could realistically use, instantly, with tight spreads.",
            "**Clean tax treatment in the US** (60/40 rule, 1256 contracts). Doesn't apply to you in Norway directly — Norwegian capital gains tax is a flat ~22% with no special treatment for derivatives, so this matters less for your context.",
            "**Trading nearly 24 hours** — Sunday 6pm ET to Friday 5pm ET, with a 1-hour daily break. Stocks only trade during regular hours."
          ]
        },
        {
          heading: 'What "the S&P 500 mini" actually means',
          body: [
            "ES is the CME's E-mini S&P 500 futures contract. It tracks the S&P 500 index — the basket of the 500 largest US public companies, weighted by market cap.",
            "When the index moves, ES moves. Almost. There's small basis variation (driven by interest rates, dividends, time to expiry), but minute-to-minute, ES and the S&P 500 cash index are virtually identical.",
            "So when you trade ES, you're effectively trading the direction of the entire US large-cap stock market. Not Apple specifically, not a sector — the whole thing. This is both a strength (deep liquidity, very efficient market) and a weakness (you can't get an edge from knowing one company's earnings; everyone has the macro information you have)."
          ]
        }
      ],
      diagram: 'futures_basics',
      takeaways: [
        { id: 'm01.t1', text: 'A futures contract is an agreement to exchange a specific asset, at a specific price, on a specific future date.' },
        { id: 'm01.t2', text: 'Futures are time-bound. They expire. There is no buy-and-hold-forever play.' },
        { id: 'm01.t3', text: 'ES tracks the S&P 500. Trading ES = trading the direction of the US large-cap stock market.' },
        { id: 'm01.t4', text: "The exchange's clearinghouse is the counterparty to both sides — you never need to know who took the other side of your trade." }
      ],
      task: {
        title: 'Look up ES on the CME website',
        steps: [
          'Open cmegroup.com and search "E-mini S&P 500".',
          'Find the contract specifications page.',
          'Read the section on contract size, tick size, and trading hours. You don\'t need to memorize numbers yet — just see where the official source lives.',
          'Bookmark this page. You will reference it again.'
        ]
      },
      quiz: [
        {
          q: 'A futures contract is best described as:',
          options: [
            'Permanent ownership of an underlying asset',
            'A loan from your broker to buy more stock',
            'An agreement to exchange a specific asset at a specific price on a specific future date',
            'An option to buy something later if you choose'
          ],
          answer: 2,
          explain: 'Options give you a right but not obligation. Futures are binding agreements. Stocks are ownership. A futures contract is the third option.'
        },
        {
          q: 'When you buy an ES contract and hold past expiry without closing it:',
          options: [
            'It rolls forever, like a stock',
            'It is auto-settled or rolled to the next quarter — the position cannot exist indefinitely',
            'You take physical delivery of 500 stocks',
            'Nothing happens, the contract just keeps trading'
          ],
          answer: 1,
          explain: 'Futures expire on a fixed schedule (ES is quarterly). At expiry the contract settles in cash and is gone. If you do nothing, your broker will close or roll the position automatically.'
        },
        {
          q: 'Trading ES is most similar to trading:',
          options: [
            'A single stock like Apple',
            'A single sector like banks',
            'The direction of the US large-cap stock market as a whole',
            'A specific commodity like gold'
          ],
          answer: 2,
          explain: 'ES tracks the S&P 500 index, which is 500 large US companies weighted by market cap. So ES = the broad US large-cap market.'
        },
        {
          q: 'The role of the exchange clearinghouse is to:',
          options: [
            "Help you find good trades",
            "Act as the counterparty to both sides of every trade so you don't need to know who's on the other side",
            "Set the price of contracts",
            "Lend you margin money"
          ],
          answer: 1,
          explain: 'The clearinghouse interposes itself between buyers and sellers, guaranteeing the trade. This is why counterparty risk is so low.'
        }
      ]
    },

    {
      id: 'm02',
      title: 'ES contract specs: every number you need',
      summary:
        'The specifications of the ES contract — point value, tick size, margin, hours, expiry. These are the fundamental constants of your trading universe. Memorize them.',
      sections: [
        {
          heading: 'The five numbers that define ES',
          body: [
            "Every futures contract is defined by a small set of constants. Get these wrong and your risk math is wrong. There is no \"feel\" for a contract — there's only the spec.",
            "**Symbol:** ES (the front month is denoted with a month/year code, like ESM5 = ES, June 2025).",
            "**Point value: $50 per index point.** If ES moves from 5800.00 to 5801.00, that's 1 point = $50 per contract.",
            "**Tick size: 0.25 index points = $12.50.** ES doesn't move in increments smaller than 0.25. The minimum price change is one tick. So 5800.00 → 5800.25 is one tick = $12.50.",
            "**Contract size: $50 × index level.** At 5800, one ES contract represents $50 × 5800 = $290,000 of notional exposure.",
            "**Trading hours (CT/ET):** Sunday 5pm CT to Friday 4pm CT, with a 60-min maintenance break daily from 4-5pm CT. Regular Trading Hours (RTH) for cash equities are 8:30am–3pm CT (9:30am–4pm ET). The big volume happens during RTH."
          ]
        },
        {
          heading: 'MES, the micro version (you are choosing not to use this)',
          body: [
            "There's a smaller cousin of ES called MES — the Micro E-mini S&P 500. Same chart, same index, but every dollar value is divided by 10.",
            "MES point value: $5. MES tick: 0.25 = $1.25. MES margin: roughly $1,300 overnight, often $40-100 intraday at brokers offering day-trade margin.",
            "You said you want ES from day one. The course will teach toward ES. Be aware: every example in the course will use ES dollar values, and you should treat them as the real consequences of being wrong, not abstractions.",
            "If you ever want to stress-test a setup or strategy with smaller real money before scaling, MES exists for that exact reason. Switching takes one symbol change in your platform."
          ]
        },
        {
          heading: 'Margin: initial vs maintenance vs day-trade',
          body: [
            "**Initial margin** is what the exchange (CME) requires to hold a position overnight. For ES this is roughly $13,000–$15,000 per contract (changes based on volatility — CME re-evaluates and can hike margin during turbulent periods).",
            "**Maintenance margin** is the minimum equity you must keep in the position. Drop below it and you get a margin call.",
            "**Day-trade margin** is set by your broker, not the exchange, and applies only if you close the position before the close of the day session. It's much lower — often $400-1,000 for ES at retail brokers. This is what allows a small account to scalp ES at all.",
            "**On a prop firm eval account** (Topstep, MFFU), you don't post margin yourself — the firm does. But the *position size limits* and *daily loss limits* serve the same function: they cap how much you can lose. We cover this in detail in Phase 6."
          ]
        },
        {
          heading: 'Expiry and the front month',
          body: [
            "ES expires quarterly: third Friday of March, June, September, December. On that day, the contract settles in cash to the special opening quotation of the S&P 500 index.",
            "You will trade the **front month** — the nearest unexpired contract. About 8 days before expiry, volume migrates to the next quarter (the \"back month\" becomes the new front month). This is called the **roll**.",
            "Practical implication: roughly 4 times a year, in early March/June/September/December, you'll need to switch which contract you're trading. Most platforms make this trivial. But if you have an open position during a roll period, manage it carefully — liquidity in the expiring contract drops fast."
          ]
        }
      ],
      diagram: 'es_specs',
      takeaways: [
        { id: 'm02.t1', text: 'ES point value = $50. ES tick = 0.25 points = $12.50. Memorize these.' },
        { id: 'm02.t2', text: 'One ES contract at 5800 controls ~$290,000 notional. This is what leverage means in practice.' },
        { id: 'm02.t3', text: 'Initial margin (~$13K) is for overnight. Day-trade margin (~$400-1K) lets you scalp during the session only.' },
        { id: 'm02.t4', text: 'ES expires quarterly. Volume rolls to the next quarter ~8 days before expiry. Track which contract is currently the front month.' }
      ],
      task: {
        title: 'Build your ES quick-reference card',
        steps: [
          'On a sticky note or note app, write: "ES: $50/pt, $12.50/tick, 0.25 tick, ~$290K notional at 5800, ~$13K overnight margin, expires Mar/Jun/Sep/Dec".',
          'Stick it next to your trading screen.',
          'Open your broker platform. Find where it shows the current ES front-month contract symbol. Note today\'s contract (e.g. ESH6 = March 2026).',
          'Find the contract specifications page in your platform. Confirm the numbers match what you wrote.'
        ]
      },
      quiz: [
        {
          q: 'ES moves from 5750.00 to 5752.50. How much did one ES contract gain or lose?',
          options: [
            '$25.00',
            '$50.00',
            '$125.00',
            '$250.00'
          ],
          answer: 2,
          explain: '2.5 points × $50 = $125 per contract. That\'s also 10 ticks × $12.50 = $125. Both methods give the same answer.'
        },
        {
          q: 'You buy 2 ES contracts at 5800 and the price drops 4 points. Your unrealized P/L is:',
          options: [
            '-$200',
            '-$400',
            '-$800',
            '-$2,000'
          ],
          answer: 1,
          explain: '4 points × $50 × 2 contracts = $400 loss. Each point on each contract costs $50.'
        },
        {
          q: 'The minimum tick for ES is:',
          options: [
            '0.01 points = $0.50',
            '0.10 points = $5.00',
            '0.25 points = $12.50',
            '1.00 points = $50.00'
          ],
          answer: 2,
          explain: 'ES ticks in 0.25-point increments. One tick = 0.25 × $50 = $12.50.'
        },
        {
          q: 'You hold an ES position past the front-month expiry without action. What happens?',
          options: [
            'It auto-rolls to the next quarter at no cost',
            'It settles in cash at the special opening quotation, and the position is closed',
            'It converts to a stock position',
            'It expires worthless'
          ],
          answer: 1,
          explain: 'On expiry, the contract settles in cash. Your broker may close it earlier — but the position cannot survive past expiry as the same contract.'
        }
      ]
    },

    {
      id: 'm03',
      title: 'Leverage and margin: the math that decides if you live or die',
      summary:
        "Leverage isn't a feature — it's a consequence of margin. Understanding the math here is the difference between a controlled risk and an account-ending mistake. Read this slowly.",
      sections: [
        {
          heading: 'What leverage actually means',
          body: [
            "Leverage is not a button you click. It's a ratio that emerges from the gap between the position you control and the cash you put up.",
            "If you put up $13,000 of margin to control $290,000 of notional ES exposure, your leverage is roughly 22:1. Said differently: a 1% move in ES produces a 22% swing on your $13,000.",
            "This is brutal in both directions. ES moving 0.5% (29 points, a normal hour) produces an 11% swing on your $13K margin. ES moving 2% (a normal-but-volatile day) produces a 44% swing. ES moving 5% (a real shock — happens a few times a decade) wipes you out.",
            "If you use day-trade margin of $500 instead of $13K to control the same $290K? Your leverage just became 580:1. A 0.17% move in ES (less than a single point, less than 5 minutes of price action) is a 100% loss of your $500."
          ]
        },
        {
          heading: 'Why this is the most dangerous thing about futures',
          body: [
            "Stock investors who use no leverage have a simple property: they can't lose more than they invest. Worst case, the company goes to zero, you lose 100%. Bad, but bounded.",
            "With futures, your loss is bounded by your account, not by your position. If you have a $50,000 account and hold a position through an overnight gap that moves against you by 80 points, that's $4,000 lost on one contract. Hold 5 contracts? $20,000 lost. Hold 10? $40,000 lost. The position size is what determines loss, and leverage is what makes large position sizes accessible.",
            "Most retail futures accounts blow up not because the trader picked the wrong direction, but because they sized too large. Direction is roughly 50/50 even for bad traders. Sizing is a choice you make every trade, and bad sizing turns a 50/50 game into a guaranteed loser through path dependency (the next paragraph)."
          ]
        },
        {
          heading: 'The asymmetry: a 50% loss requires a 100% gain to recover',
          body: [
            "If you have $10,000 and lose 50%, you have $5,000. To get back to $10,000 you need to gain 100% — twice as much, in percentage terms, as you lost.",
            "Lose 75%? You need a 300% gain to recover.",
            "Lose 90%? 900%.",
            "This is the math that destroys overleveraged traders. Each large drawdown makes the next gain proportionally harder. A single bad week with bad sizing can mathematically end a trading career, even if the trader's edge is real, because they'll never have enough capital to express that edge again.",
            "The whole point of position sizing — which we'll cover in detail in Phase 3 — is to keep individual losses small enough that the recovery is always trivial. If you risk 1% and lose, you need 1.01% to recover. If you risk 5% and lose, you need 5.26%. Still fine. Risk 25% and lose, you need 33%. Now the math starts working against you."
          ]
        },
        {
          heading: 'Margin call vs liquidation vs prop eval rules',
          body: [
            "On a personal account, if your equity drops below maintenance margin during the day, your broker issues a **margin call**. You either deposit more, close part of your position, or your broker will start auto-liquidating to bring you back into compliance.",
            "Auto-liquidation is unpleasant: it happens at market, often at the worst possible price, and you have no choice in what gets closed. The lesson is to never rely on margin calls — you should be managing risk before getting anywhere near maintenance levels.",
            "On a prop eval account, the firm imposes its own limits: a daily loss limit (drop below it intraday and the account is failed), a max drawdown (lifetime), and position size caps. These are stricter than CME margin and usually trigger first. Phase 6 covers the specific Topstep and MFFU rules in detail.",
            "**Practical rule for the first year:** never trade size that would require a margin call to make you stop. Stop yourself. Pre-define your max loss for the day and the trade. Hit it, you're done."
          ]
        }
      ],
      diagram: 'leverage_drawdown',
      takeaways: [
        { id: 'm03.t1', text: 'Leverage is the ratio of position size to capital posted. ES at $13K margin controlling $290K notional = ~22:1 leverage.' },
        { id: 'm03.t2', text: 'With futures, your loss is bounded by your account, not your position. Position size is what determines loss; leverage just makes large size accessible.' },
        { id: 'm03.t3', text: 'A 50% loss requires a 100% gain to recover. Drawdowns compound asymmetrically against you.' },
        { id: 'm03.t4', text: 'Pre-define your max loss per trade and per day. Stop yourself before the broker stops you.' }
      ],
      task: {
        title: 'Run the drawdown math on yourself',
        steps: [
          'Decide on a hypothetical starting capital you are comfortable losing entirely (this is a thought exercise; you don\'t need to put up money yet).',
          'Calculate: what does a 5% loss look like in dollars? 10%? 25%? 50%?',
          'For each, calculate: what gain (in %) do you need to recover?',
          'Write the table down. Look at it. This is the math you are signing up for.',
          'Now calculate: at $50/point on ES, how many points against you (on 1 contract) equals each loss percentage of your hypothetical capital?'
        ]
      },
      quiz: [
        {
          q: 'You have $10,000 and lose 40%. What % gain do you need to get back to $10,000?',
          options: [
            '40%',
            '50%',
            '67%',
            '80%'
          ],
          answer: 2,
          explain: 'After a 40% loss, you have $6,000. To recover $4,000 from $6,000, you need 4000/6000 = 67% gain. Drawdowns compound asymmetrically.'
        },
        {
          q: 'You hold 1 ES contract overnight with $13,000 of margin. ES gaps down 30 points at the open. What\'s your loss?',
          options: [
            '$300',
            '$1,500',
            '$1,500 — about 11% of your margin',
            'Both 2 and 3 are correct'
          ],
          answer: 3,
          explain: '30 points × $50 = $1,500 loss. As a % of your $13K margin, that\'s ~11.5%. Overnight gaps in ES of 30+ points are not rare — they happen on news, earnings, and macro events.'
        },
        {
          q: 'A trader with strong edge but poor sizing will most likely:',
          options: [
            'Compound their edge into wealth over time',
            'Break even because edge cancels out sizing',
            'Eventually blow up the account due to drawdown asymmetry',
            'Beat a trader with weak edge but good sizing'
          ],
          answer: 2,
          explain: 'Edge means nothing if you can\'t survive long enough to express it. Drawdown math destroys overleveraged traders before their edge can compound.'
        },
        {
          q: 'The most reliable defense against catastrophic loss is:',
          options: [
            'Picking the right direction',
            'Pre-defining your max loss per trade and per day, and stopping yourself before the broker does',
            'Trusting your gut to exit at the right time',
            'Using tight stops only'
          ],
          answer: 1,
          explain: 'Pre-commitment beats real-time judgment. Decide before the trade what you\'ll lose. The broker margin call is the worst possible safety net — it triggers at the worst price.'
        }
      ]
    },

    {
      id: 'm04',
      title: 'Order types and the trading day',
      summary:
        "How orders actually work, what each type does, and how the trading day flows hour by hour. The basic mechanics every ES trader executes hundreds of times.",
      sections: [
        {
          heading: 'The four orders you will use',
          body: [
            "**Market order**: buy or sell immediately at the current best available price. Fast, guaranteed fill, but you accept whatever the market gives you. In a fast market, slippage can be brutal — you click buy at 5800.00 and fill at 5800.50.",
            "**Limit order**: buy or sell only at a specific price or better. You define the price; the order fills only if the market reaches it. No slippage, but no guaranteed fill either. If price moves away, your order sits there unfilled.",
            "**Stop order (stop-market)**: a sleeping market order. Sits inactive until price reaches your stop level, then fires off as a market order. Used for protective stops (you're long at 5800, you put a stop at 5790 — if price drops to 5790, you exit at market). Fast in volatile conditions, but subject to slippage.",
            "**Stop-limit order**: a stop that becomes a limit order instead of a market. You define both a trigger price and a worst-acceptable fill price. Safer in calm markets, but in fast markets the price can blow through your limit and leave you with no fill — and a position still moving against you."
          ]
        },
        {
          heading: 'Bracket orders: the trader\'s safety harness',
          body: [
            "A bracket order is an entry plus two attached exits: a profit target (limit) and a stop loss (stop), where filling either one cancels the other. Most platforms let you set this up in one click as an OCO (one-cancels-other).",
            "**Why this matters:** if you enter without a pre-defined stop, you are trading on hope. Brackets force you to define risk and reward before the trade. They also remove the moment-of-truth decision — when the market is moving fast and your position is in pain, you don't want to be deciding whether to exit. The decision should already be made.",
            "**Practical rule for your first year:** every trade should be a bracket. Entry, target, stop — all defined before the trade is alive. If you can't articulate where you'd be wrong (the stop) before clicking buy, you don't take the trade."
          ]
        },
        {
          heading: 'The trading day, hour by hour',
          body: [
            "All times Eastern. ES trades nearly 24 hours, but only a few windows have meaningful liquidity and clean structure for retail traders.",
            "**6pm ET (previous day) – 3am ET: Asia session.** Quiet. Low volume. ES often drifts in a range. Beginners should not trade this — too easy to get chopped up by thin liquidity.",
            "**3am – 8am ET: London session.** Volume picks up as European markets open and react. Some real moves happen here, especially around 4am (London proper opens) and 8:30am (US economic data releases).",
            "**8:30am ET: Pre-market data.** CPI, PPI, NFP, GDP, FOMC announcements. ES can move 20+ points in seconds. Most experienced traders don't trade through these — they wait for the dust to settle.",
            "**9:30am ET: Cash open.** US stock market opens. Massive volume hits ES. The first 30 minutes (9:30-10am) is statistically the most volatile period of the day. Many setups concentrate here.",
            "**10:00am ET: Often a reversal point.** Initial move from open frequently exhausts and reverses around this time.",
            "**11:30am – 1:30pm ET: Lunchtime drift.** Volume dies. Don't expect clean directional moves. Some traders avoid this window entirely.",
            "**2pm – 4pm ET: Afternoon session.** Volume returns. Many setups also concentrate in the last hour. 2pm Wednesdays are FOMC days — entire market structure changes.",
            "**4pm ET: Cash close.** Stock market closes. ES keeps trading on lower volume.",
            "**5pm – 6pm ET: Daily maintenance window.** ES is closed for one hour."
          ]
        },
        {
          heading: 'Where new traders should focus',
          body: [
            "If you are starting out, your best window is **9:30am–11:30am ET**. Highest volume, cleanest structure, most predictable behavior. This is when the chart looks most like a textbook.",
            "Avoid for now: overnight session (low volume, structure is unreliable), economic releases (random spikes that aren't tradable until you're experienced), lunchtime (chop).",
            "When you feel solid, you can add the **2pm–4pm window**. The first hour after lunch and the last hour of cash often have clean trends or reversals.",
            "Counterintuitive but important: trading less is almost always better when you're new. The market gives you 5+ days of opportunity per week. Pick two clean hours per day; that's 10 hours of focused screen time. That's enough."
          ]
        }
      ],
      diagram: 'trading_day',
      takeaways: [
        { id: 'm04.t1', text: 'Market = fast but slippage. Limit = price-controlled but no fill guarantee. Stop = sleeping market order, fires when triggered.' },
        { id: 'm04.t2', text: 'Every trade should be a bracket: entry, target, stop, all defined before going live. If you can\'t define where you\'re wrong, don\'t take the trade.' },
        { id: 'm04.t3', text: 'Cleanest window for beginners: 9:30am–11:30am ET. Highest volume, most predictable behavior.' },
        { id: 'm04.t4', text: 'Avoid economic releases, lunchtime chop, and the overnight session until you are demonstrably profitable in the morning session.' }
      ],
      task: {
        title: 'Place practice orders in your platform sim',
        steps: [
          'Open your broker\'s simulator (Tradovate, NinjaTrader, ThinkorSwim — all have demo modes).',
          'Submit one of each: a market order to buy 1 MES (use micro for the demo, doesn\'t matter — just to feel the mechanics), a limit order 5 points below current price, a stop order 5 points above current price, and a bracket order with entry, +5pt target, and -3pt stop.',
          'Watch what happens to each order. Cancel anything that doesn\'t fill.',
          'You should be able to submit a bracket order in under 5 seconds without thinking. If you can\'t, drill it until you can. Order entry mechanics should be unconscious.'
        ]
      },
      quiz: [
        {
          q: 'You want to enter ES long if it breaks above 5810, but you don\'t want to chase it more than a few points. The right order type is:',
          options: [
            'A market order',
            'A buy limit at 5810',
            'A stop-market at 5811 with no upper limit',
            'A stop-limit at 5811 trigger, 5813 limit'
          ],
          answer: 3,
          explain: 'A stop-limit triggers above 5810 (5811) but caps your fill price (5813). A buy limit at 5810 would only fill if price drops back to it — opposite of what you want. A stop-market would fill but with uncontrolled slippage.'
        },
        {
          q: 'A bracket order is best described as:',
          options: [
            'A single order that wraps trades in commissions',
            'An entry order plus two attached exits (target and stop), where filling one cancels the other',
            'A limit order that converts to market on expiry',
            'A type of stop order with two triggers'
          ],
          answer: 1,
          explain: 'Brackets are entry + target + stop, OCO (one-cancels-other) on the exits. They force you to pre-define risk and reward.'
        },
        {
          q: 'For a trader starting out, the highest-quality window of the day for ES is typically:',
          options: [
            '6pm–10pm ET (Asia session)',
            '8:30am ET (economic data release)',
            '9:30am–11:30am ET (US cash open + first two hours)',
            '12pm–1pm ET (lunchtime)'
          ],
          answer: 2,
          explain: 'The cash open window has the highest volume and cleanest structure. Asia is too thin, releases are too random, lunchtime is too choppy.'
        },
        {
          q: 'You\'re long ES at 5800 with a stop-market at 5795. Bad news hits and ES gaps to 5780 instantly. You will most likely:',
          options: [
            'Be filled at 5795 because that\'s your stop',
            'Be filled near 5780, not 5795, because the stop became a market order in a fast market',
            'Not be filled at all',
            'Be filled at 5800 because that\'s your entry'
          ],
          answer: 1,
          explain: 'A stop-market triggers at 5795 but executes at the next available price — which in a fast gap is wherever the market is, not where your stop was. This is slippage. A stop-limit might have prevented the fill but left you holding the bag at a much worse price.'
        }
      ]
    }
  ]
};
