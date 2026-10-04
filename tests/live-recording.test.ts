import test from 'node:test';
import assert from 'node:assert/strict';
import { liveRecordingPending } from '../src/lib/lms/lesson-recording';
test('live-only sessions wait for a private or YouTube replay before completion', () => {
 assert.equal(liveRecordingPending({meeting_url:'https://zoom.us/j/12345678901'}),true);
 for(const replay of [{has_recording:true},{recording_path:'private/replay.mp4'},{youtube_id:'example'}])
  assert.equal(liveRecordingPending({meeting_url:'https://zoom.us/j/12345678901',...replay}),false);
 assert.equal(liveRecordingPending({}),false);
});
