import test from 'node:test';
import assert from 'node:assert/strict';
import {claimSchema,challengeSchema,challengePhase} from '../src/lib/lms/challenges';
test('challenge windows and proof links reject unsafe or invalid input',()=>{
 const c={course_id:'22222222-2222-4222-8222-222222222222',title:'Week 1',description:'Earn your first genuine commission.',proof_instructions:'Submit redacted transaction proof.',prize:'1 month Pro',max_winners:1,opens_at:'2026-10-04T13:00:00Z',closes_at:'2026-10-11T13:00:00Z',published:false};
 assert.equal(challengeSchema.safeParse(c).success,true);
 assert.equal(challengeSchema.safeParse({...c,selection_mode:'participation',max_winners:2}).success,false);
 assert.equal(challengeSchema.safeParse({...c,selection_mode:'participation'}).success,true);
 assert.equal(challengeSchema.safeParse({...c,closes_at:c.opens_at}).success,false);
 assert.equal(challengePhase(c,Date.parse(c.opens_at)),'Open');
 assert.equal(challengePhase(c,Date.parse(c.closes_at)),'Closed');
 const proof={challenge_id:c.course_id,evidence:'A genuine first sale with transaction proof',evidence_url:'https://example.com/proof',achieved_at:c.opens_at};
 assert.equal(claimSchema.safeParse(proof).success,true);
 for(const evidence_url of ['javascript:alert(1)','http://example.com','file:///tmp/a'])assert.equal(claimSchema.safeParse({...proof,evidence_url}).success,false);
});
