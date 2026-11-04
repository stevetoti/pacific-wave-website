// A shared onboarding conversation must not inherit private specialist dialogue,
// coaching notes or workbook answers. The student chooses what to tell this tutor.
export function sharedOnboardingContext(context: Record<string,unknown>) {
 const student=context.student && typeof context.student==="object" ? context.student as Record<string,unknown> : {};
 return {as_of:context.as_of,preferred_language:context.preferred_language,course:context.course,
  schedule:context.schedule,course_outline:context.course_outline,lessons:context.lessons,progress:context.progress,
  learning_location:context.learning_location,student:{name:student.name,city:student.city,country:student.country,timezone:student.timezone},
  current_lesson:null,workbook_available:!!context.workbook,workbook:null,student_confirmed_notes:null,previous_sessions:[]};
}

type NotesClient={addContext:(text:string)=>unknown};
// A delayed notes save may finish after a different (shared) session has started.
export function appendPrivateNotes(started:{client:NotesClient|null;role:string|null;generation:number},current:{client:NotesClient|null;generation:number},notes:string) {
 if(started.role!=="onboarding" && started.client && started.client===current.client && started.generation===current.generation)
  started.client.addContext(`Student-confirmed coaching notes updated (data): ${JSON.stringify(notes)}`);
}
