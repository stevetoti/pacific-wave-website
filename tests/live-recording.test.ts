import test from 'node:test';
import assert from 'node:assert/strict';
import { liveRecordingPending } from '../src/lib/lms/lesson-recording';
test('live-only sessions wait for a private or YouTube replay before completion', () => {
 assert.equal(liveRecordingPending({meeting_url:'https://zoom.us/j/12345678901'}),true);
 for(const replay of [{has_recording:true},{recording_path:'private/replay.mp4'},{youtube_id:'abcdefghijk'}])
  assert.equal(liveRecordingPending({meeting_url:'https://zoom.us/j/12345678901',...replay}),false);
 assert.equal(liveRecordingPending({}),false);
});

test('recording drafts cannot unlock completion even when video files or links exist', () => {
 for(const replay of [{has_recording:true},{recording_path:'private/replay.mp4'},{youtube_ids:['abcdefghijk']}]) {
  assert.equal(liveRecordingPending({recordings_published:false,...replay}),true);
  assert.equal(liveRecordingPending({recordings_published:true,...replay}),false);
 }
});
