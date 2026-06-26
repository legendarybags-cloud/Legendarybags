# Zirrus Lead Assistant

A local-first lead tracker for phone and internet sales follow-up.

## What it does

- Saves and edits leads in your browser with name, phone, email, source, package, notes, consent, and next follow-up.
- Parses copied lead text so you can paste once and fill obvious fields.
- Takes a lead photo or uploads an image/TXT/CSV/MD file, then fills obvious fields.
- Builds Zirrus quotes for mobile, internet, and bundles.
- Applies the $20 bundle discount when the quote has 1 Gig or higher internet plus Basic, Preferred, or Freedom mobile.
- Opens your phone's native call, SMS, and email apps with templates already filled.
- Tracks status, priority, next step, appointments, appointment status, contact log, due follow-ups, pricing, CSV export, and JSON backup.
- Adds a Texts tab for Android share-to-app, pasted conversations, text screenshots, and SMS backup XML imports.
- Groups imported text conversations by phone number, keeps a collapsible conversation snippet, finds unsaved contacts, and lets you create/update leads from them.
- Sets quick text follow-ups on imported contacts, then carries those follow-ups into the saved customer record when linked.
- Creates appointment reminder text/email drafts and downloadable calendar events.
- Shows a Today Queue, daily closeout numbers, productivity stats, hot leads, due follow-ups, and upcoming appointments.
- Opens to a cleaner Today command center with the lead capture form folded until you need it.
- Uses collapsible mobile sections so customer info, quote, workflow, follow-up, and notes do not all compete on one screen.
- Keeps lead cards compact by showing the main contact buttons first and putting extra actions, notes, and activity behind expanders.
- Warns about possible duplicates by matching phone or email.
- Adds a Facebook Marketing tab for Zirrus-aligned campaign drafts, official Zirrus promo refresh, monthly promo rewrites, simple copy-and-open posting, local group/manual posting plans, a posting queue, response tracking, lead counters, and Meta Business Suite shortcuts.
- Saves data automatically in the browser, mirrors it to a second on-phone storage area, and shows last-saved/backup status on the Today screen.
- Keeps data local unless you export it or add a secure sync backend later.

## How to use

Open `index.html` in a browser. For phone use, host the folder on a private approved HTTPS site, then add it to your home screen.

The app does not secretly scrape monday.com or your work system. Copy or photograph only lead details you are allowed to use, then save the lead.

## Photo OCR

Use Take photo for the camera, or Upload file for a saved screenshot/image or TXT/CSV/MD file. The app will try to fill name, phone, email, address, source, best time, appointment, priority, mobile plan, line count, and internet speed.

Best results come from a close, sharp, straight photo. If OCR misses anything, edit the OCR text or the fields before saving.

## Text organizer

The Texts tab is the Android-friendly way to feed the app customer conversations without giving it unsafe SMS access. You can share selected text into the installed app, paste copied messages, upload a screenshot for OCR, or import an SMS backup XML export. The app parses names, numbers, snippets, and likely follow-up timing, then keeps unsaved numbers in Text contacts until you create or link a lead.

Android and browser PWAs cannot silently read the whole Messages database. A true automatic inbox scraper would require a separate native Android app with sensitive SMS/default-handler or notification-listener permissions. This version keeps the workflow local and reviewed: import what you choose, then use the queue to open one SMS draft at a time.

## Workflow tools

- Dashboard shows a prioritized Today Queue, due follow-ups, upcoming appointments, hot leads, daily closeout, and productivity stats.
- Each lead has quick actions for call, text, email, appointment reminder text/email, map, calendar event, quote copy, summary copy, and follow-up scheduling.
- Outcome buttons log common actions such as no answer, left voicemail, texted, interested, needs approval, bad number, sold, and not interested.
- Appointment buttons mark confirmed, completed, missed, or needs reschedule.
- Appointment reminders use drafts so you can review before sending.
- Calendar downloads create an `.ics` file you can add to your phone calendar.

## Facebook marketing

The Marketing tab generates three local post drafts from Zirrus-style campaign presets: address availability, fiber speed, Smart Wi-Fi 6, internet plus mobile bundle savings, mobile AutoPay savings, iPhone/trade-in offers, local service, and business internet/phone. Use Refresh from Zirrus to pull official promo suggestions from public Zirrus pages, or paste the current monthly Zirrus Facebook or Instagram promo into the Monthly Zirrus promo box, then generate drafts that quote that offer in a more natural local voice. Saved promos are marked by calendar month; when the month changes, the next successful refresh replaces the old promo and refreshes stored drafts. The default contact is Nick Williams at `336-986-6691` and `nick.williams@zirrus.com`, so drafts steer people to contact him directly instead of sending them to the site.

Cloudflare Pages serves `/api/promos`, which reads public Zirrus pages and returns normalized promo suggestions. Facebook and Instagram can block automated reads; social-only promo automation needs Meta's official Pages/Instagram APIs and approved account access, so manual paste remains the fallback until that connection exists.

Simple Facebook posting does not need a Meta developer app. Generate a draft, tap Copy + open Facebook, paste it into the Business Suite or Page composer, then mark the queued post as posted and track responses/leads.

Advanced direct Page posting uses Cloudflare Functions under `/api/meta/*`. Add these Cloudflare Pages environment variables before connecting a Page: `META_APP_ID`, `META_APP_SECRET`, and `META_COOKIE_SECRET`. Optional: `META_GRAPH_VERSION` and `META_REDIRECT_URI`. In the Meta app, add this OAuth redirect URI: `https://legendarybags.pages.dev/api/meta/callback`. The frontend never stores the Page access token; it is encrypted in an HttpOnly cookie by Cloudflare.

Save the best draft to the posting queue, copy it into your Facebook Business Page or approved local groups, then mark it posted and track responses/leads.

This app does not auto-post into Facebook groups. For approved automation later, use Meta Business Suite for scheduling or a backend connected to the official Meta Pages API after your app has the required Page permissions and review.

## Backup and moving phones

The app saves automatically on the phone and keeps a second local browser backup mirror. Use Settings to download a JSON backup, share it through your phone's share sheet, copy it, or export CSV. Save backups somewhere you control such as iCloud Drive, Google Drive, OneDrive, or email. True live sync between multiple phones needs a real backend/database and sign-in.

## Compliance notes

For SMS, use this only where the customer gave permission to be texted or where you are replying to an active customer conversation, and honor STOP or any opt-out request. For commercial email, include accurate sender information, a valid mailing address, and an unsubscribe path. Ask your company for its approved templates and policy before using this with real customers.

## Fully automatic sending

This browser version opens SMS and email drafts. Fully automatic sending needs an approved backend such as Twilio for SMS and SendGrid, Microsoft 365, or Gmail API for email. That backend should store consent, opt-outs, message logs, and rate limits.

## Phone app options

The current version is a progressive web app. On Android, open the Cloudflare Pages URL in Chrome and install it from the browser menu; after install, Android can show Lead Assistant as a share target for selected text. iPhone users can use Safari's Add to Home Screen. A true downloadable app with no site needs a native wrapper, Android APK, TestFlight/App Store, or company mobile-device management.

## Easiest free hosting

Use Netlify Drop for the simplest no-code setup:

1. Go to `https://app.netlify.com/drop`.
2. Drag this app folder onto the upload box, or upload the prepared `lead-assistant-upload.zip`.
3. Open the HTTPS link Netlify gives you on your phone.
4. On iPhone, open in Safari, tap Share, then Add to Home Screen.
5. On Android, open in Chrome, tap the menu, then Add to Home screen or Install app.

GitHub Pages and Cloudflare Pages also work, but Netlify Drop is usually the fewest steps.
