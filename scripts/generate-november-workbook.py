"""Build the dated November cohort resource from its editable workbook content."""
from pathlib import Path
import json
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1]
w=json.loads((ROOT/'src/lib/lms/november-workbook.json').read_text())
pdfmetrics.registerFont(TTFont('WB',str(ROOT/'resources/workbook-font.ttf')))
pdfmetrics.registerFontFamily('WB',normal='WB',bold='WB',italic='WB',boldItalic='WB')
navy=HexColor('#233C6F'); orange=HexColor('#EF5E33')
styles={
 'title':ParagraphStyle('title',fontName='WB',fontSize=28,leading=35,textColor=navy,spaceAfter=20),
 'h1':ParagraphStyle('h1',fontName='WB',fontSize=20,leading=27,textColor=navy,spaceAfter=15),
 'h2':ParagraphStyle('h2',fontName='WB',fontSize=13,leading=18,textColor=navy,spaceBefore=14,spaceAfter=8),
 'body':ParagraphStyle('body',fontName='WB',fontSize=10.5,leading=16,textColor=navy,spaceAfter=9),
 'small':ParagraphStyle('small',fontName='WB',fontSize=9,leading=14,textColor=navy,spaceAfter=7),
}
def p(value,style='body'):return Paragraph(escape(str(value)).replace('\n','<br/>'),styles[style])
def decorate(c,doc):
 c.drawImage(str(ROOT/'public/images/training/pwd-logo.png'),42,785,32,32,mask='auto')
 c.setFont('WB',10);c.setFillColor(navy);c.drawString(87,805,'PACIFIC WAVE DIGITAL')
 c.setFont('WB',8);c.drawString(87,791,'NOVEMBER–DECEMBER 2026 · PARTICIPANT WORKBOOK')
 c.setStrokeColor(orange);c.setLineWidth(1.5);c.line(42,775,553,775)
 c.setFillColor(navy);c.setFont('WB',8);c.drawString(42,27,'16 November–19 December 2026 | 3–5 pm Vanuatu time');c.drawRightString(553,27,str(doc.page))
story=[Spacer(1,34),p(w['title'],'title'),p(w['subtitle'],'h1'),p('16 November–19 December 2026','h2'),p('Mondays, Thursdays and Saturdays · 3–5 pm Vanuatu time'),p('15 live sessions · 30 teaching hours · Same 12 core lessons plus three final revision and project-review sessions.'),Spacer(1,20),p('Your working document','h2'),p('Read each lesson, complete the activities and use your own business project throughout. Write answers in English, Bislama or French. Save editable answers in your student dashboard; this PDF is a printable reference.'),p('Never record passwords, bank details or private customer data. Check official requirements and ongoing costs before making business decisions. Results depend on your effort, offer and market.'),PageBreak(),p('Your class timetable','h1')]
for l in w['lessons']:story.append(p(f"{l['number']:02} | {l['date']} | {l['title']}",'small'))
for l in w['lessons']:
 story += [PageBreak(),p(f"CLASS {l['number']} · {l['date']} · {w['time']}",'small'),p(l['title'],'h1'),p(l['outcome'])]
 img=ROOT/'public/images/training/october-workbook'/l['image']
 if img.is_file():story += [Image(str(img),width=495,height=280,kind='proportional'),Spacer(1,10)]
 for title,body in l['learn']:story += [p(title,'h2'),p(body)]
 story += [p('A business example','h2'),p(l['example']),p('Build it step by step','h2')]
 for i,step in enumerate(l['steps'],1):story.append(p(f'{i}. {step}'))
 if l['prompt']:story += [p('AI prompt to adapt','h2'),p(l['prompt'])]
 story += [p('Your business activities','h2')]
 for f in l['fields']:story.append(KeepTogether([p(f['label'],'h2'),p('__________________________________________________________________\n\n__________________________________________________________________\n\n__________________________________________________________________','small'),Spacer(1,10)]))
 story += [p('Check your work','h2')]
 for check in l['checks']:story.append(p('[  ] '+check))
 story += [p('Before the next class','h2'),p(l['homework'])]
SimpleDocTemplate(str(ROOT/'resources/november-workbook.pdf'),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=85,bottomMargin=48,title='Build Your Online Business | November–December 2026 Workbook',author='Pacific Wave Digital').build(story,onFirstPage=decorate,onLaterPages=decorate)
print('Created resources/november-workbook.pdf')
