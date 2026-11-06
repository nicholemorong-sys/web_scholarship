# ISKOLAR LINK

A responsive scholarship management demo built with semantic HTML, CSS, and vanilla JavaScript. Open `index.html` directly in a modern browser; no package installation or build step is required.

## Features

- Student and faculty sign-in interface with account-role selection. This is a front-end demonstration, not production authentication: any non-empty username and password opens the selected role.
- Marinduque State University seal displayed in the sign-in and dashboard branding.
- Student-only account page for viewing and editing name, student number, school email, contact, course, year level, and campus. Student details are saved locally and prefill future applications.
- Scholarship directory for TDP, TES, Smart, CHED, DOST, and local opportunities, including eligibility, grant amounts, requirements, and deadlines.
- Search, category filters, and sorting for scholarship opportunities.
- Application form with required student details and multi-file upload selection for PDFs, images, and documents. Each file is limited to 5 MB.
- Student application tracking with Pending, Under review, Approved, or Rejected statuses and faculty review notes.
- Faculty review workspace for checking submitted document filenames and updating application status.
- Payout schedules, announcements, notification popover, dashboard metrics, and mobile navigation.
- Application and account demo data persist in browser `localStorage`.

## Accessibility

- Landmark elements, hierarchical headings, visible-on-focus skip link, explicit form labels, and native controls.
- Keyboard-operable navigation and actions, visible focus indicators, dialog semantics, Escape-to-close, and modal focus trapping/restoration.
- Status is communicated with text as well as color; dynamic scholarship search results use a polite live region.
- Reduced-motion preferences are respected, and the mobile menu exposes its expanded state to assistive technology.

## Responsive design

- Desktop uses a persistent sidebar and multi-column dashboard.
- Tablet layouts reduce navigation width and rearrange cards and panels.
- Mobile switches to a collapsible, scrim-backed navigation drawer, stacked content, and a bottom-sheet-style dialog.
- Fluid page padding and type scales adapt to small, medium, and large viewports.

## Manual testing

1. Open `index.html` in a current desktop and mobile browser. Confirm the login form rejects empty credentials and the password visibility control updates its accessible state.
2. Sign in with any non-empty username and password as Student. Browse opportunities; test search, category filters, and sort order.
3. Open a scholarship, inspect eligibility and requirements, submit the application with course, year, and at least one file. Test an oversized file and confirm it is rejected.
4. Open **My student account**, edit and save student details, then verify the profile persists after signing out and back in with the same username. Open **My applications** and verify application records are associated with that student account.
5. Sign in as Faculty, open **Review applications**, search/filter, inspect the submission, and save a new status and note. Confirm the student view reflects the change after signing back in as the same username.
6. Visit payouts and announcements, open notifications, and test mobile navigation at narrow viewport widths.
7. Use only the keyboard to navigate, open/close a dialog, and confirm focus is visible and returns to the triggering control.
8. Refresh the browser and verify demo data remains available through `localStorage`.

## Demo limitations

Authentication is simulated and must not be used to protect real accounts. Uploaded files are only read as browser file selections; only their names are retained, and file contents are not uploaded or persisted. Data is stored locally in the current browser and is not shared with a coordinator or other users. A production deployment needs a secure backend, real identity verification, authorization, server-side file storage and validation, and authoritative scholarship/payout data.
