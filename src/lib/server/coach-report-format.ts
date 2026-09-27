import "server-only";
import { PDFDocument, StandardFonts, rgb, PDFString } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { plainText, type CoachReport } from "@/lib/lms/coach/report";
const escape = (s: string) =>
  plainText(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function reportEmail(r: CoachReport, url: string) {
  const section = (heading: string, body: string) =>
    `<h2 style="color:#233c6f;font-size:20px;margin-top:28px">${escape(heading)}</h2><p style="line-height:1.7;color:#465872;white-space:pre-line">${escape(body)}</p>`;
  const sources = (ids: number[]) =>
    ids
      .map((id) => r.sources.find((s) => s.id === id))
      .filter((s) => !!s)
      .map(
        (s) =>
          `<a style="color:#ab3e1e" href="${escape(s!.url)}">[${s!.id}] ${escape(s!.title)}</a>`,
      )
      .join(" · ");
  const content =
    section("Session summary", r.summary) +
    r.discussion.map((x) => section(x.heading, x.details)).join("") +
    section(
      "Learning opportunities",
      r.learning_gaps.map((x) => x.topic + ": " + x.explanation).join("\n\n"),
    ) +
    `<h2 style="color:#233c6f">Additional research & learning</h2>` +
    r.research
      .map(
        (x) =>
          section(x.heading, x.details) + `<p>${sources(x.source_ids)}</p>`,
      )
      .join("") +
    section(
      "Your next steps",
      r.actions.map((x, i) => `${i + 1}. ${x}`).join("\n"),
    ) +
    section("What to confirm", r.limitations.join("\n"));
  const html = `<!doctype html><html><body style="background:#f3f5f9;margin:0;font-family:Arial,sans-serif"><div style="max-width:700px;margin:24px auto;background:white"><header style="background:#233c6f;padding:28px;color:white"><img src="https://pacificwavedigital.com/images/training/pwd-logo.png" width="52" height="52" alt="PWD"/><p>PACIFIC WAVE DIGITAL · TRAINING CENTRE</p><h1>${escape(r.title)}</h1><p>${escape(r.course_title)} · ${escape(r.coach_title)}</p></header><main style="padding:28px"><p>Hello ${escape(r.student_name)}, here is your private session report. Your branded PDF is attached.</p>${content}<h2 style="color:#233c6f">Sources checked</h2>${r.sources.map((s) => `<p>${sources([s.id])}<br/><small>Checked ${escape(s.checked_at.slice(0, 10))}</small></p>`).join("")}<p><a href="${escape(url)}" style="display:inline-block;background:#233c6f;color:white;padding:14px 20px;border-radius:8px">Open your session and PDF</a></p><p style="font-size:12px;color:#65748a">Prepared ${escape(r.created_at.slice(0, 10))}. AI-assisted learning material. Sources can change; confirm important decisions with the appropriate professional or authority.</p></main></div></body></html>`;
  const text = [
    r.title,
    r.course_title,
    r.summary,
    ...r.discussion.map((x) => x.heading + "\n" + x.details),
    ...r.learning_gaps.map((x) => x.topic + "\n" + x.explanation),
    "ADDITIONAL RESEARCH",
    ...r.research.map(
      (x) =>
        x.heading +
        "\n" +
        x.details +
        "\n" +
        x.source_ids
          .map((id) => r.sources.find((s) => s.id === id)?.url || "")
          .join("\n"),
    ),
    ...r.actions,
    ...r.limitations,
    ...r.sources.map((s) => s.title + " " + s.url),
    url,
  ].join("\n\n");
  return { html, text };
}
export async function reportPdf(r: CoachReport) {
  const doc = await PDFDocument.create();
  doc.setTitle(r.title);
  doc.setAuthor("Pacific Wave Digital");
  const regular = await doc.embedFont(StandardFonts.Helvetica),
    bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(
    await readFile(process.cwd() + "/public/images/training/pwd-logo.png"),
  );
  const navy = rgb(35 / 255, 60 / 255, 111 / 255),
    orange = rgb(191 / 255, 73 / 255, 35 / 255),
    ink = rgb(0.22, 0.29, 0.38);
  let page = doc.addPage([595, 842]),
    y = 730;
  const safe = (s: string) =>
    plainText(s).replace(
      /[^\x20-\x7e\xa0-\xff\n]/g,
      (c) =>
        ({
          "’": "'",
          "‘": "'",
          "“": '"',
          "”": '"',
          "–": "-",
          "—": "-",
          "…": "...",
        })[c] || " ",
    );
  function header() {
    page.drawRectangle({ x: 0, y: 760, width: 595, height: 82, color: navy });
    page.drawImage(logo, { x: 38, y: 778, width: 40, height: 40 });
    page.drawText("PACIFIC WAVE DIGITAL", {
      x: 92,
      y: 802,
      size: 14,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText("TRAINING CENTRE | PRIVATE SESSION REPORT", {
      x: 92,
      y: 783,
      size: 8,
      font: regular,
      color: rgb(0.86, 0.9, 0.97),
    });
    y = 733;
  }
  function space(height: number) {
    if (y - height < 54) {
      page = doc.addPage([595, 842]);
      header();
    }
  }
  function paragraph(text: string, size = 10.5, heading = false, url?: string) {
    const font = heading ? bold : regular;
    const rows: string[] = [];
    for (const block of safe(text).split("\n")) {
      let line = "";
      for (const word of block.split(/\s+/)) {
        const chunks = word.length > 75 ? word.match(/.{1,65}/g) || [] : [word];
        for (const chunk of chunks) {
          if (font.widthOfTextAtSize(line + " " + chunk, size) > 505 && line) {
            rows.push(line);
            line = chunk;
          } else line += (line ? " " : "") + chunk;
        }
      }
      rows.push(line);
    }
    space((heading ? 2 : 1) * (size + 5));
    for (const line of rows) {
      space(size + 5);
      page.drawText(line, {
        x: 42,
        y,
        size,
        font,
        color: heading ? navy : url ? orange : ink,
      });
      if (url && line) {
        const annotation = doc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [42, y - 2, 548, y + size],
          Border: [0, 0, 0],
          A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
        });
        const ref = doc.context.register(annotation);
        page.node.addAnnot(ref);
      }
      y -= size + 5;
    }
    y -= 8;
  }
  header();
  paragraph(r.title, 21, true);
  paragraph(r.course_title, 13, true);
  paragraph(
    `${r.student_name} | ${r.coach_title} | ${r.session_date.slice(0, 10)}`,
  );
  paragraph("Session summary", 14, true);
  paragraph(r.summary);
  for (const x of r.discussion) {
    paragraph(x.heading, 12, true);
    paragraph(x.details);
  }
  paragraph("Learning opportunities", 14, true);
  for (const x of r.learning_gaps) {
    paragraph(x.topic, 12, true);
    paragraph(x.explanation);
  }
  paragraph("Additional research & learning", 14, true);
  for (const x of r.research) {
    paragraph(x.heading, 12, true);
    paragraph(x.details);
    for (const id of x.source_ids) {
      const source = r.sources.find((s) => s.id === id);
      if (source) paragraph(`[${id}] ${source.title}`, 9, false, source.url);
    }
  }
  paragraph("Your next steps", 14, true);
  r.actions.forEach((x, i) => paragraph(`${i + 1}. ${x}`));
  if (r.limitations.length) {
    paragraph("What to confirm", 14, true);
    r.limitations.forEach((x) => paragraph(x));
  }
  paragraph("Sources checked", 14, true);
  r.sources.forEach((s) => {
    paragraph(`[${s.id}] ${s.title}`, 10, true);
    paragraph(s.url, 8, false, s.url);
    paragraph("Checked " + s.checked_at.slice(0, 10), 8);
  });
  doc.getPages().forEach((p, i) => {
    p.drawText(
      `Pacific Wave Digital | AI-assisted learning | Page ${i + 1} of ${doc.getPageCount()}`,
      { x: 42, y: 25, size: 8, font: regular, color: ink },
    );
  });
  return Buffer.from(await doc.save());
}
