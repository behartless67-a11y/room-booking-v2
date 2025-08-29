Batten ICS Dashboard — Netlify Quick Deploy
=============================================

Files:
- batten-dashboard.html  (single-page app)
- rooms.json             (list of rooms with paths/URLs to .ics files)
- /ics/*.ics             (put your .ics files here, or point rooms.json to remote URLs)

How to use:
1) Put your .ics files into an `ics/` folder next to `batten-dashboard.html` (or use remote HTTP(S) URLs).
2) Edit `rooms.json` to list each reservable space:
   [
     {"id":"unique-id","name":"Display Name","ics":"ics/filename.ics"}
   ]
3) Deploy all of it to Netlify (drag-and-drop folder, or connect a repo). No build needed.
4) If your ICS URLs are remote and block cross-origin requests, open Settings in the page and add a CORS proxy prefix like:
   https://your-proxy.example.com/?url=
   (Then the app will fetch `${proxy}${encodeURIComponent(icsUrl)}`.)

Notes:
- Time zone is fixed to America/New_York.
- Recurrence expansion supports basic RRULE and EXDATE.
- For auth-protected feeds (SSO), you'll need to host a tiny server-side relay.
