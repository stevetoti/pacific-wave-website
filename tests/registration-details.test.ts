import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationDetails, hasRegistrationDetails } from '../src/lib/lms/registration-details';
test('returning student uses saved profile contact and latest valid attendance',()=>{
 const details=registrationDetails({full_name:' Aron ',phone:'+678 5551234'},[{name:'Old Name',phone:'+678 5559999',attendance:'mixed'}],'Auth Name');
 assert.deepEqual(details,{name:'Aron',phone:'+678 5551234',attendance:'mixed'});assert.equal(hasRegistrationDetails(details),true);
});
test('incomplete profiles fall back to prior student orders rather than asking for everything again',()=>{
 const details=registrationDetails({full_name:'',phone:'+678'},[{name:'Aron Toa',phone:'+678 5551234',attendance:'in_person'}]);
 assert.deepEqual(details,{name:'Aron Toa',phone:'+678 5551234',attendance:'in_person'});
});
test('new accounts retain a safe prefilled name and must supply missing contact details',()=>{
 const details=registrationDetails(null,[],'New Student');assert.deepEqual(details,{name:'New Student',phone:'',attendance:'online'});assert.equal(hasRegistrationDetails(details),false);
 assert.equal(hasRegistrationDetails(registrationDetails({full_name:'Student',phone:'+678'},[])),false);
});
