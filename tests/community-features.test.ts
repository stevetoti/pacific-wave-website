import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { normalizeMentions, communitySchema } from "../src/lib/lms/community";
test("mentions use real conversation members, canonical names and bounded message/file inputs", () => {
  const id = crypto.randomUUID(),
    other = crypto.randomUUID();
  assert.deepEqual(
    normalizeMentions(`Hi @[Fake instructor](${id})`, [
      { user_id: id, name: "Student One", instructor: false },
    ]),
    { body: `Hi @[Student One](${id})`, ids: [id] },
  );
  assert.throws(
    () =>
      normalizeMentions(`Hi @[Private student](${other})`, [
        { user_id: id, name: "Student One", instructor: false },
      ]),
    /current members/,
  );
  assert.equal(
    communitySchema.safeParse({
      action: "react",
      course: id,
      channel: id,
      id: 1,
      emoji: "script",
      active: true,
    }).success,
    false,
  );
  assert.equal(
    communitySchema.safeParse({
      action: "send",
      course: id,
      channel: id,
      body: "Hello",
      client_id: id,
      files: [id, id, id, id],
    }).success,
    false,
  );
});
test("chat SQL keeps private rosters, atomic files/mentions, idempotent sends and monotonic read markers", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);CREATE TABLE admin_users(email text,name text,role text,site_id text,is_active boolean);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');",
    );
    for (const file of [
      "20260915_training_center.sql",
      "20260915_mentorship.sql",
      "20260915_course_community.sql",
      "20260923_community_features.sql",
      "20260923_community_features.sql",
      "20260923_mentorship_communication.sql",
      "20260923_mentorship_communication.sql",
    ])
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    const one = crypto.randomUUID(),
      two = crypto.randomUUID(),
      teacher = crypto.randomUUID();
    for (const id of [one, two, teacher])
      await db.query("INSERT INTO auth.users VALUES($1,$2)", [
        id,
        id + "@example.com",
      ]);
    await db.query(
      "INSERT INTO admin_users VALUES($1,'Instructor','admin','pacific-wave-digital',true)",
      [teacher + "@example.com"],
    );
    const course = (
      await db.query<{ id: string }>(
        "SELECT id FROM pwd_lms_courses WHERE NOT private_sessions LIMIT 1",
      )
    ).rows[0].id;
    const channels = (
      await db.query<{ id: string }>(
        "SELECT id FROM pwd_lms_channels WHERE course_id=$1 ORDER BY announcements",
        [course],
      )
    ).rows;
    const channel = channels[0].id,
      other = channels[1].id;
    for (const [id, name] of [
      [one, "One"],
      [two, "Two"],
    ])
      await db.query(
        "INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'fixture@example.com',$3,'1234567',100,'VUV','paid')",
        [id, course, name],
      );
    await db.query("UPDATE pwd_lms_channels SET private=true WHERE id=$1", [
      channel,
    ]);
    await db.query("SELECT pwd_lms_set_group_members($1,$2)", [channel, [one]]);
    const roster = (
      await db.query<{ user_id: string }>(
        "SELECT * FROM pwd_lms_chat_people($1,$2)",
        [course, channel],
      )
    ).rows.map((p) => p.user_id);
    assert.ok(
      roster.includes(one) && roster.includes(teacher) && !roster.includes(two),
    );
    const mentor = (await db.query<{id:string}>("SELECT id FROM pwd_lms_courses WHERE private_sessions LIMIT 1")).rows[0].id;
    for (const id of [one,two]) await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'fixture@example.com','Mentee','1234567',100,'VUV','paid')",[id,mentor]);
    await db.query("UPDATE pwd_lms_orders SET status='paid' WHERE course_id=$1",[mentor]);
    const rooms=(await db.query<{id:string,private:boolean,order_id:string}>("SELECT * FROM pwd_lms_channels WHERE course_id=$1",[mentor])).rows;
    assert.equal(rooms.length,2);assert.ok(rooms.every(r=>r.private&&r.order_id));
    for (const room of rooms) {const members=(await db.query<{user_id:string}>("SELECT * FROM pwd_lms_chat_people($1,$2)",[mentor,room.id])).rows.map(p=>p.user_id);assert.equal(members.length,2);assert.ok(members.includes(teacher));assert.ok(!(members.includes(one)&&members.includes(two)));}
    const client = crypto.randomUUID();
    const send = (
      clientId: string,
      reply: number | null = null,
      files: string[] = [],
    ) =>
      db.query<{ id: number }>(
        "SELECT pwd_lms_chat_send($1,$2,$3,false,$4,$5,$6,$7,$8) AS id",
        [
          channel,
          one,
          "One",
          "Hello community searchable",
          clientId,
          reply,
          [teacher],
          files,
        ],
      );
    const id = (await send(client)).rows[0].id;
    assert.equal((await send(client)).rows[0].id, id);
    assert.equal(
      (await db.query("SELECT * FROM pwd_lms_chat_mentions")).rows.length,
      1,
    );
    let counts = (
      await db.query<{ unread: number; mentions: number }>(
        "SELECT * FROM pwd_lms_chat_counts($1,$2)",
        [teacher, [channel]],
      )
    ).rows[0];
    assert.equal(Number(counts.unread), 1);
    assert.equal(Number(counts.mentions), 1);
    const second = (await send(crypto.randomUUID(), id)).rows[0].id;
    await db.query("SELECT pwd_lms_chat_read($1,$2,$3)", [
      teacher,
      channel,
      second,
    ]);
    await db.query("SELECT pwd_lms_chat_read($1,$2,$3)", [
      teacher,
      channel,
      id,
    ]);
    counts = (
      await db.query<{ unread: number; mentions: number }>(
        "SELECT * FROM pwd_lms_chat_counts($1,$2)",
        [teacher, [channel]],
      )
    ).rows[0];
    assert.equal(Number(counts.unread), 0);
    await assert.rejects(() =>
      db.query("SELECT pwd_lms_chat_read($1,$2,$3)", [teacher, other, id]),
    );
    await assert.rejects(() =>
      db.query("SELECT pwd_lms_chat_edit($1,$2,$3,$4,$5)", [
        id,
        channel,
        two,
        "Unauthorized edit",
        [],
      ]),
    );
    await db.query("SELECT pwd_lms_chat_edit($1,$2,$3,$4,$5)", [
      id,
      channel,
      one,
      "Updated searchable",
      [],
    ]);
    assert.equal(
      (
        await db.query(
          "SELECT * FROM pwd_lms_chat_mentions WHERE message_id=$1",
          [id],
        )
      ).rows.length,
      0,
    );
    const file = crypto.randomUUID();
    await db.query(
      "INSERT INTO pwd_lms_chat_files(id,channel_id,user_id,path,name,mime,size) VALUES($1,$2,$3,'private/test.txt','test.txt','text/plain',20)",
      [file, other, two],
    );
    await assert.rejects(() => send(crypto.randomUUID(), null, [file]));
    assert.equal(
      (
        await db.query("SELECT * FROM pwd_lms_messages WHERE channel_id=$1", [
          channel,
        ])
      ).rows.length,
      2,
    );
    await db.query(
      "UPDATE pwd_lms_chat_files SET channel_id=$1,user_id=$2 WHERE id=$3",
      [channel, one, file],
    );
    const attachmentMessage = (await send(crypto.randomUUID(), null, [file]))
      .rows[0].id;
    assert.equal(
      Number(
        (
          await db.query<{ message_id: number }>(
            "SELECT message_id FROM pwd_lms_chat_files WHERE id=$1",
            [file],
          )
        ).rows[0].message_id,
      ),
      Number(attachmentMessage),
    );
    await assert.rejects(() => send(crypto.randomUUID(), null, [file]));
    assert.ok(
      (
        await db.query(
          "SELECT id FROM pwd_lms_messages WHERE search_document @@ websearch_to_tsquery('simple','searchable')",
        )
      ).rows.length > 0,
    );
    await db.exec("SET ROLE authenticated");
    for (const table of [
      "pwd_lms_chat_mentions",
      "pwd_lms_chat_reactions",
      "pwd_lms_chat_reads",
      "pwd_lms_chat_files",
      "pwd_lms_chat_reports",
    ])
      await assert.rejects(() => db.query("SELECT * FROM " + table));
    await assert.rejects(() =>
      db.query("SELECT * FROM pwd_lms_chat_people($1,$2)", [course, channel]),
    );
  } finally {
    await db.close();
  }
});
