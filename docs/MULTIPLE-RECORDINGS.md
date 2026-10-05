# Recording publishing

Admin → Training centre → Lessons → choose course → choose lesson. Existing lessons have a separate **Class recordings** panel above the live/lesson settings.

- Paste each full YouTube link and use **Add another video** for more parts (up to 20). Eleven-character IDs also work; duplicates and empty rows are removed.
- Or upload MP4/WebM up to 500 MB. Uploading alone does not attach/publish the recording.
- **Publish recordings** saves and releases the current links/upload together. Local success text confirms availability for approved students.
- **Save recording draft** saves the current links/upload and hides them from students. **Unpublish recordings** hides the saved replay without changing its content or live Zoom availability.
- The panel shows publication status, unsaved changes, and local validation/server/upload errors. A lesson must itself be published before its recording can be published. New lessons must first be saved and selected from the lesson list.
- **Save lesson** handles title, schedule, Zoom, artwork, notes, quizzes and lesson publication. It omits recording fields so later metadata edits cannot overwrite a published replay.

Approved students see numbered YouTube thumbnail preview cards with play icons and Recording ready labels and one privacy-enhanced YouTube player at a time. New lesson selection resets playback. YouTube embedding must be enabled by the video owner; unlisted links can be reshared. Private mentorship still requires private storage. Students with an already-open page should refresh to see newly published recordings.

`youtube_ids` stores ordered IDs; additive migration `20261005_multiple_recordings.sql` preserves the legacy first ID. `20261005_recording_publication.sql` adds independent replay visibility, preserving previously attached replays. Student lesson API strips all replay IDs and upload availability when draft, pending/revoked or lesson-unpublished. Signed-download and live/recording-draft completion guards enforce publication server-side. Existing signed URLs remain valid until their original expiry; hiding a replay prevents new links from being issued.

Recording save/unpublish actions are scoped to the actual lesson/course and assigned instructor/admin. Mentorship and upload-path ownership checks apply. Separate forms prevent unrelated required/invalid live settings from blocking replay publication.

Verification: parser/database tests plus `scripts/verify-multiple-recordings.mjs` exercise real temporary admin/student draft/publish/unpublish, full links, independent form validation, uploaded WebM playback, metadata preservation, student part switching, draft download/progress denial and pending/lesson-draft filtering on desktop/mobile. YouTube external player contents are stubbed; uploaded-video decoding is real. Fixture orders have emails suppressed transactionally; all users/course/storage are cleaned.

Player requests explicitly use strict-origin-when-cross-origin to supply the site origin required by YouTube while preserving the global no-referrer policy elsewhere. The privacy-enhanced iframe requires no API key. YouTube verification is provider-controlled; Open Part on YouTube is a fallback, not a bypass. `tests/browser/recording-previews.spec.ts` checks thumbnails, one-player switching, outgoing Referer, fallback URL and responsive minimum player size.
