# Publish your portfolio — click-by-click guide

**No coding knowledge needed.** Follow the steps in order. Total time: about 25 minutes. Everything is free.
Menu names on websites change now and then; if a button is named slightly differently, pick the closest one.

**You will use 3 free websites:**
| Website | What it does for you |
|---|---|
| **GitHub** | Stores your website's files and shows them to the world |
| **Supabase** | Stores your projects, photos, login and the requests customers send |
| **Formspree** | Already set up from your old site: also emails you each request |

> **Your website address will be:** `https://wickyanalytics.github.io/Wickyanalytics.portfolio.io/`
> (If your GitHub username is not `WickyAnalytics`, use yours instead.)

---
## PART 1 — Put the website on GitHub (≈8 min)

1. **Unzip** the file `Wickyanalytics.portfolio.io.zip` on your computer (right-click → *Extract all*).
   Open the new folder `portfolio`. You should see `index.html`, a folder named `assets`, and a folder named `supabase`.
2. Go to **https://github.com** and sign in.
3. Click the **+** (top-right) → **New repository**.
4. **Repository name:** type exactly `Wickyanalytics.portfolio.io`
5. Choose **Public**. Leave every checkbox (README, .gitignore, license) **unticked**. Click **Create repository**.
6. On the next page click the link **“uploading an existing file”**.
7. Open the `portfolio` folder on your computer, press **Ctrl + A** (select everything inside it), and **drag it all** into the GitHub page.
   Wait until every file shows as uploaded (the folders `assets` and `supabase` must be there too).
   > Important: you drag the things *inside* `portfolio`, not the `portfolio` folder itself. `index.html` must be at the top level.
8. Scroll down and click the green **Commit changes** button.
9. Turn the website on: click **Settings** (top of the repo) → **Pages** (left menu) →
   under *Branch* choose **main** and **/ (root)** → click **Save**.
10. Wait 1–2 minutes and refresh the Pages screen. A box appears: *“Your site is live at …”*. Click it.
    **You should see your full portfolio.** Part 1 is done — the site is already public!
    (The login and editing come alive after Parts 2–3.)

---
## PART 2 — Create the database and your login (≈10 min)

11. Go to **https://supabase.com** → **Start your project** → sign up (you can use your GitHub account).
12. Click **New project**. Fill in:
    - **Name:** `portfolio`
    - **Database password:** click *Generate a password*, then **copy it somewhere safe** (you rarely need it, but keep it).
    - **Region:** choose the closest to Egypt (e.g. *Europe – Frankfurt*).
    - Plan: **Free** → **Create new project**. Wait ~2 minutes until it finishes.
13. **Create the tables.** In the left menu click **SQL Editor** → **New query**.
    On your computer open `supabase/setup.sql` with Notepad, press **Ctrl + A**, **Ctrl + C**,
    then paste (**Ctrl + V**) into the Supabase box and click **Run**.
    You should see *“Success. No rows returned”*. (Your email `Georgeayad3021@gmail.com` is already inside — don't change anything.)
14. **Create your login.** Left menu **Authentication** → **Users** → **Add user** → **Create new user**.
    - Email: `Georgeayad3021@gmail.com`
    - Password: choose a strong one you'll remember
    - **Tick “Auto Confirm User”** → **Create user**.
15. **Stop strangers from signing up.** Authentication → **Sign In / Providers** (or *Providers*) → **Email** →
    switch **OFF “Allow new users to sign up”** → **Save**.

---
## PART 3 — Connect the website to the database (≈5 min)

16. In Supabase open **Project Settings** (gear icon, bottom-left) → **API** (or **API Keys**).
    Copy two things (use the copy button):
    - **Project URL** — looks like `https://abcdxyzabcd.supabase.co`
    - **anon public** key — a long text starting with `eyJ…` (if you only see a **publishable** key starting with `sb_publishable_`, use that one).
    > Both are safe to put on a public website. **Never** use the one named `service_role` / `secret`.
17. Go back to your GitHub repo → open the folder **assets** → **js** → click **config.js** → click the **pencil icon** (Edit).
18. Paste the two values between the quotation marks:
    ```js
    supabaseUrl: "https://abcdxyzabcd.supabase.co",
    supabaseAnonKey: "eyJ.........",
    ```
    Keep the quotes and commas. Click **Commit changes…** → **Commit changes**. Wait 1–2 minutes.

---
## PART 4 — First login and loading your content (≈3 min)

19. Open your website. Scroll to the very bottom and click the faint word **Admin** (or add `?admin` at the end of the address).
20. Sign in with `Georgeayad3021@gmail.com` and your password from step 14.
21. A bar appears at the bottom: *“Your database is empty.”* → click **Import starter content**. (Do this only once.)
    Your CV, all projects, skills and services are now loaded and editable.

**You're finished.** Open the site in a *private/incognito window* to see what visitors see.

---
## HOW TO USE IT DAY-TO-DAY
Sign in (step 19–20). You'll see a dark bar at the bottom: **✎ Editing mode**. Everything is edited right on the page:

| I want to… | Do this |
|---|---|
| **Add a project** | Go to *Projects* → **+ Add project** → fill the form → **Save**. Upload screenshots with *Upload images*. |
| **Give it tags** | In the form: **Categories** (e.g. `Finance, HR`) and **Technologies** (e.g. `Power BI, Excel`). Visitors get filter buttons for them automatically. |
| **Edit / remove a project** | Hover the project card → **Edit** or **Delete**. |
| **Hide something without deleting** | **Hide** (it turns into a draft only you can see; **Show** brings it back). |
| **Change order** | Use the **↑ ↓** buttons. |
| **Change my name, photo, phone, about text, CV file** | Under your name at the top: **✎ Edit profile**. |
| **Add experience, skills, certificates, services** | Use the **+ Add** button in each section. |
| **See customer requests** | Bottom bar → **Requests** (a red number shows new ones). Change the status (new / in progress / done) or click **Reply by email**. |
| **Sign out** | Bottom bar → **Sign out**. |

Customers fill the **Request a service** form. You get it inside **Requests** *and* by email (Formspree).

---
## IF SOMETHING GOES WRONG
| What you see | What to do |
|---|---|
| Blank page or no styling on GitHub | `index.html` isn't at the top level. Re-do step 7 (drag the files *inside* `portfolio`). |
| “Admin isn't configured yet” | Parts 3 not done, or wait 2 more minutes and refresh (Ctrl + F5). |
| “Invalid login credentials” | Wrong password, or step 14 was skipped / “Auto Confirm User” wasn't ticked. |
| Saving shows a permission / “row-level security” error | You're signed in with a different email than the one in step 14. Use `Georgeayad3021@gmail.com`. |
| Site shows the starter content only | The Supabase project is paused (free projects pause after ~1 week with no visits). Open supabase.com → your project → **Restore**. |
| Customers' emails don't arrive | Open formspree.io, sign in, and check the form `xannkjav` is still active. Requests still appear in **Requests** either way. |
| I changed something and don't see it | Hard-refresh with **Ctrl + F5**. Check the item isn't marked **Hidden**. |

## Good to know
- Your phone number and email are public on the site (as you chose) — expect the occasional spam call/email. You can remove the phone any time from **✎ Edit profile**.
- Want the shorter address `wickyanalytics.github.io`? Later, rename this repo to exactly that (after renaming/deleting the old repo with that name). Nothing else changes.
- Update the portfolio link on your **CV, LinkedIn and GitHub profile** to the new address.
