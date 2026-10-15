## Task 1 — Stop sales from overselling stock ⭐ (most important)

**The problem:** When you record a sale, the system happily lets you sell more
units than you actually have. For example, a product with 5 in stock can be
"sold" 50 times — the stock count just drops below zero, which should never
happen in a real inventory system.

**What we need:**

- A sale should be **refused** if it asks for more than the available stock, and
  the user should see a clear message explaining why.
- A valid sale should still go through and reduce the stock correctly.
- A user should be able to **open a past sale and see what was in it** (which
  products, how many, at what price) — right now you can only see the list of
  sales, not the details of one.

> 💡 The **Purchases** feature already does a very similar job correctly (it
> adds stock instead of removing it). It's a good example to learn from.

---

## Task 2 — Make product management safe and complete

**The problem:** The product catalogue has a few rough edges:

- You can save a product with **no name**, or with a **negative price**, and the
  system just accepts it.
- If you try to add a product using a **product code (SKU) that already exists**,
  you get a confusing, generic error instead of a helpful one.
- The **Delete** button on a product **doesn't actually remove it** — nothing
  happens.

**What we need:**

- Products should be checked before saving: a name is required, and the price
  must be a sensible, non-negative number. Bad input should be rejected with a
  helpful message.
- Trying to reuse an existing product code should give a clear "this code is
  already in use" style message.
- The Delete button should actually delete the product.

---

## Task 3 — Let users edit a supplier

**The problem:** On the Suppliers page you can add a new supplier and delete
one, but the **Edit** button doesn't do anything yet.

**What we need:**

- Clicking Edit should let the user change that supplier's details (name,
  contact email, phone, address) and save the change, with the updated details
  shown afterwards.

> 💡 The system can already save supplier changes behind the scenes — this is
> mainly about wiring up the screen. The Products page does something similar
> and is worth a look.
