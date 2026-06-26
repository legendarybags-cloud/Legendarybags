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
- Creates appointment reminder text/email drafts and downloadable calendar events.
- Shows a Today Queue, daily closeout numbers, productivity stats, hot leads, due follow-ups, and upcoming appointments.
- Uses collapsible mobile sections so customer info, quote, workflow, follow-up, and notes do not all compete on one screen.
- Keeps lead cards compact by showing the main contact buttons first and putting extra actions, notes, and activity behind expanders.
- Warns about possible duplicates by matching phone or email.
- Adds a Facebook Marketing tab for Zirrus-aligned campaign drafts, local group/manual posting plans, a posting queue, response tracking, lead counters, and Meta Business Suite shortcuts.
- Keeps data local unless you export it or host/sync it somewhere.

## How to use

Open `index.html` in a browser. For phone use, host the folder on a private approved HTTPS site, then add it to your home screen.

The app does not secretly scrape monday.com or your work system. Copy or photograph only lead details you are allowed to use, then save the lead.

## Photo OCR

Use Take photo for the camera, or Upload file for a saved screenshot/image or TXT/CSV/MD file. The app will try to fill name, phone, email, address, source, best time, appointment, priority, mobile plan, line count, and internet speed.

Best results come from a close, sharp, straight photo. If OCR misses anything, edit the OCR text or the fields before saving.

## Workflow tools

- Dashboard shows a prioritized Today Queue, due follow-ups, upcoming appointments, hot leads, daily closeout, and productivity stats.
- Each lead has quick actions for call, text, email, appointment reminder text/email, map, calendar event, quote copy, summary copy, and follow-up scheduling.
- Outcome buttons log common actions such as no answer, left voicemail, texted, interested, needs approval, bad number, sold, and not interested.
- Appointment buttons mark confirmed, completed, missed, or needs reschedule.
- Appointment reminders use drafts so you can review before sending.
- Calendar downloads create an `.ics` file you can add to your phone calendar.

## Facebook marketing

The Marketing tab generates three local post drafts from Zirrus-style campaign presets: address availability, fiber speed, Smart Wi-Fi 6, internet plus mobile bundle savings, mobile AutoPay savings, iPhone/trade-in offers, local service, and business internet/phone. The default contact is Nick Williams at `336-986-6691` and `nick.williams@zirrus.com`, so drafts steer people to contact him directly instead of sending them to the site.

Save the best draft to the posting queue, copy it into your Facebook Business Page or approved local groups, then mark it posted and track responses/leads.

This app does not auto-post into Facebook groups. For approved automation later, use Meta Business Suite for scheduling or a backend connected to the official Meta Pages API after your app has the required Page permissions and review.

## Backup and moving phones

Use Settings to download a JSON backup, share it through your phone's share sheet, copy it, or export CSV. Save backups somewhere you control such as iCloud Drive, Google Drive, OneDrive, or email. True live sync between multiple phones needs a real backend/database and sign-in.

## Compliance notes

For SMS, use this only where the customer gave permission to be texted and honor STOP or any opt-out request. For commercial email, include accurate sender information, a valid mailing address, and an unsubscribe path. Ask your company for its approved templates and policy before using this with real customers.

## Fully automatic sending

This browser version opens SMS and email drafts. Fully automatic sending needs an approved backend such as Twilio for SMS and SendGrid, Microsoft 365, or Gmail API for email. That backend should store consent, opt-outs, message logs, and rate limits.

## Phone app options

The current version is a progressive web app. It can be installed from Chrome or Edge when opened from a supported secure page, and iPhone users can use Safari's Add to Home Screen. A true downloadable app with no site needs a native wrapper, Android APK, TestFlight/App Store, or company mobile-device management.

## Easiest free hosting

Use Netlify Drop for the simplest no-code setup:

1. Go to `https://app.netlify.com/drop`.
2. Drag this app folder onto the upload box, or upload the prepared `lead-assistant-upload.zip`.
3. Open the HTTPS link Netlify gives you on your phone.
4. On iPhone, open in Safari, tap Share, then Add to Home Screen.
5. On Android, open in Chrome, tap the menu, then Add to Home screen or Install app.

GitHub Pages and Cloudflare Pages also work, but Netlify Drop is usually the fewest steps.
