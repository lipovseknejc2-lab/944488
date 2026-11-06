---
name: knots-points
description: Atelier's knots: every action is metered like AI tokens and shown only on the You page. Use when adding an action, changing the usage page, or when Nejc asks about knots.
---

# Knots in Atelier

Knots measure usage, like tokens in AI. They are tracked only and are **visible only on the You page**. Never show them anywhere else, and never draw coins, bills or banknotes. There is one kind, called **knots**.

- **Metering:** every user action calls `use('action', times)` from `core.js`. A new action needs an entry in `ACT` (`key: ['Label', 'Area', cost]`). Areas: Notes, Chat, Groups, Projects, Focus, Today, Account, You. Usual costs: 1 for small edits, 2–3 for creating something, 4–6 for big things (file upload, new project).
- **Storage:** `S.usage.days[YYYY-MM-DD][action] = count`, `_n` = knots that day, `S.usage.total` = all time. The daily totals must always add up to the all-time total.
- **You page:**
  - the knot in a soft circle with "Used today";
  - all time, daily average and active days;
  - a 14-day bar chart;
  - a "By area" stacked bar with legend;
  - "Today" and "All time by action" tables (action, area, count, knots, share bar).
- **Icon** (always this exact stroke):
```js
const KNOT='M11 51C17 41 24 31 21 22C18 13 7 17 10.5 27C14 37 35 38 45 27C53 18 47.5 9 40.5 13C33 17 40 34 53 51';
```
- **Later**, if Nejc wants spending: `balance = earned - spent`, a shop with a confirmation sheet showing the price pill and the balance left, permanent purchases (themes first), and no money imagery.
- **Checks:** a new action is counted on the You page, today's number matches the table, and the daily totals add up to all time.
