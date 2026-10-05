# Multiple YouTube recordings per lesson

Admin → Training centre → Lessons → choose course → choose lesson. In **YouTube recordings**, paste the full first video link, click **Add another video**, and paste each additional part in order. Click **Save lesson**. Up to 20 parts; empty rows are ignored and duplicate IDs removed. Existing 11-character IDs remain supported. Remove deletes a row; saving attaches that change.

Approved students see numbered Watch Part buttons and one privacy-enhanced YouTube player at a time. Changing parts stops the previous iframe. New lesson selection resets playback. YouTube embedding must be enabled by the video owner; unlisted links can be reshared. Uploaded MP4/WebM playback remains available separately. Private mentorship still requires private storage, not YouTube.

`youtube_ids` stores ordered IDs. Additive migration `20261005_multiple_recordings.sql` preserves existing first IDs; a trigger synchronizes `youtube_id` for older clients and enforces format/count/private-mentorship constraints. Student API strips both fields for pending/revoked enrolments and unpublished lessons. Replay readiness checks accept any valid stored part.

`tests/youtube-recordings.test.ts` covers URL parsing, lookalike-host rejection, legacy data, SQL synchronization/removal and private mentorship. `scripts/verify-multiple-recordings.mjs` creates isolated temporary users/course, checks actual admin save/reload/validation and student part switching on desktop/mobile, verifies pending/draft filtering, then removes fixtures. External player contents are stubbed for deterministic UI testing; it verifies embeds rather than streaming actual class footage. No existing learner data is changed and fixture enrollment emails are removed in the same transaction.
