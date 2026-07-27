from fpdf import FPDF
from bs4 import BeautifulSoup
import markdown
import os
import unicodedata

INPUT = os.path.join(os.path.dirname(__file__), '..', 'DEPLOYMENT_GUIDE.md')
OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'DEPLOYMENT_GUIDE.pdf')

with open(INPUT, 'r', encoding='utf-8') as f:
    md = f.read()

html = markdown.markdown(md)
soup = BeautifulSoup(html, 'html.parser')

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Fonts and sizes
pdf.set_font('Arial', size=11)

def sanitize(s: str) -> str:
    # Replace certain unicode punctuation and normalize to latin-1 compatible text
    s = s.replace('\u2014', ' - ').replace('\u2013', ' - ').replace('\u2019', "'")
    s = s.replace('\u201c', '"').replace('\u201d', '"')
    # Normalize and drop characters that can't be represented in latin-1
    s = unicodedata.normalize('NFKD', s)
    return s.encode('latin-1', 'ignore').decode('latin-1')

def write_heading(text, level=1):
    sizes = {1:16, 2:14, 3:12, 4:11}
    size = sizes.get(level, 11)
    pdf.set_font('Arial', 'B', size)
    safe = sanitize(text)
    pdf.multi_cell(0, size*0.6, txt=safe)
    pdf.ln(2)
    pdf.set_font('Arial', size=11)

for el in soup.find_all(['h1','h2','h3','h4','p','ul','ol','pre','code','blockquote']):
    if el.name == 'h1':
        write_heading(el.get_text(), 1)
    elif el.name == 'h2':
        write_heading(el.get_text(), 2)
    elif el.name == 'h3':
        write_heading(el.get_text(), 3)
    elif el.name == 'h4':
        write_heading(el.get_text(), 4)
    elif el.name == 'p':
        text = sanitize(el.get_text())
        pdf.multi_cell(0, 6, txt=text)
        pdf.ln(1)
    elif el.name in ('ul', 'ol'):
        for i, li in enumerate(el.find_all('li')):
            prefix = '*' if el.name == 'ul' else f"{i+1}."
            line = sanitize(f"{prefix} {li.get_text()}")
            pdf.multi_cell(0, 6, txt=line)
        pdf.ln(1)
    elif el.name in ('pre', 'code'):
        pdf.set_font('Courier', size=9)
        text = sanitize(el.get_text())
        for line in text.splitlines():
            pdf.multi_cell(0, 5, txt=line)
        pdf.set_font('Arial', size=11)
        pdf.ln(1)
    elif el.name == 'blockquote':
        text = sanitize(el.get_text())
        pdf.set_font('Arial', 'I', 11)
        pdf.multi_cell(0, 6, txt=text)
        pdf.set_font('Arial', size=11)
        pdf.ln(1)


pdf.output(OUTPUT)
print('PDF generated at', OUTPUT)
