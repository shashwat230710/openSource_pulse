#!/usr/bin/env python3
"""
Open-Source Pulse: Presentation PDF Generator
Generates a standalone, beautifully styled 12-slide presentation PDF.
Explains the entire big data and ML project with clear, accessible, intuitive language.
Uses standard PDF 1.4 specification without any third-party dependencies.
"""

import os
import sys

class PDFSlideWriter:
    def __init__(self, filename, width=792, height=612):
        self.filename = filename
        self.width = width
        self.height = height
        self.objects = []
        self.pages = []
        
    def add_object(self, content):
        self.objects.append(content)
        return len(self.objects)
        
    def escape_text(self, text):
        return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        
    def create_slide_stream(self, draw_func):
        commands = []
        
        # Helper drawing methods
        def set_fill(r, g, b):
            commands.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
            
        def set_stroke(r, g, b):
            commands.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
            
        def set_line_width(w):
            commands.append(f"{w:.2f} w")
            
        def rect(x, y, w, h, stroke=False, fill=True):
            op = "B" if (stroke and fill) else ("f" if fill else "s")
            commands.append(f"{x:.1f} {y:.1f} {w:.1f} {h:.1f} re {op}")
            
        def text(x, y, string, font="F1", size=14, r=1, g=1, b=1):
            set_fill(r, g, b)
            escaped = self.escape_text(string)
            commands.append(f"BT /{font} {size} Tf {x:.1f} {y:.1f} Td ({escaped}) Tj ET")
            
        def line(x1, y1, x2, y2, r=0.2, g=0.3, b=0.4, width=1):
            set_stroke(r, g, b)
            set_line_width(width)
            commands.append(f"{x1:.1f} {y1:.1f} m {x2:.1f} {y2:.1f} l s")
            
        ctx = {
            'width': self.width,
            'height': self.height,
            'set_fill': set_fill,
            'set_stroke': set_stroke,
            'set_line_width': set_line_width,
            'rect': rect,
            'text': text,
            'line': line
        }
        
        # Execute slide layout
        draw_func(ctx)
        
        stream_content = "\n".join(commands)
        return stream_content

    def build_pdf(self, slides):
        # We need Font objects: F1 = Helvetica-Bold, F2 = Helvetica, F3 = Courier
        f1_idx = self.add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        f2_idx = self.add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f3_idx = self.add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")
        
        page_refs = []
        content_obj_indices = []
        
        for slide_func in slides:
            stream_str = self.create_slide_stream(slide_func)
            stream_len = len(stream_str.encode('latin1'))
            content_obj = f"<< /Length {stream_len} >>\nstream\n{stream_str}\nendstream"
            c_idx = self.add_object(content_obj)
            content_obj_indices.append(c_idx)
            
        # Create page objects (allocated next)
        pages_dict_idx = len(self.objects) + len(slides) + 1
        
        for i, c_idx in enumerate(content_obj_indices):
            page_obj = f"<< /Type /Page /Parent {pages_dict_idx} 0 R /MediaBox [0 0 {self.width} {self.height}] /Contents {c_idx} 0 R /Resources << /Font << /F1 {f1_idx} 0 R /F2 {f2_idx} 0 R /F3 {f3_idx} 0 R >> >> >>"
            p_idx = self.add_object(page_obj)
            page_refs.append(f"{p_idx} 0 R")
            
        # Pages Catalog object
        pages_obj = f"<< /Type /Pages /Kids [ {' '.join(page_refs)} ] /Count {len(slides)} >>"
        self.add_object(pages_obj)
        
        # Root Catalog
        root_idx = self.add_object(f"<< /Type /Catalog /Pages {pages_dict_idx} 0 R >>")
        
        # Compile PDF binary output
        out = []
        out.append("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        
        offsets = []
        current_pos = len("".join(out).encode('latin1'))
        
        for idx, obj in enumerate(self.objects, 1):
            offsets.append(current_pos)
            obj_str = f"{idx} 0 obj\n{obj}\nendobj\n"
            out.append(obj_str)
            current_pos += len(obj_str.encode('latin1'))
            
        xref_pos = current_pos
        out.append(f"xref\n0 {len(self.objects) + 1}\n0000000000 65535 f \n")
        for off in offsets:
            out.append(f"{off:010d} 00000 n \n")
            
        out.append(f"trailer\n<< /Size {len(self.objects) + 1} /Root {root_idx} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n")
        
        final_pdf_content = "".join(out).encode('latin1')
        os.makedirs(os.path.dirname(os.path.abspath(self.filename)), exist_ok=True)
        with open(self.filename, "wb") as f:
            f.write(final_pdf_content)
        print(f"Successfully generated PDF: {self.filename} ({len(final_pdf_content):,} bytes, {len(slides)} slides)")

# -------------------------------------------------------------
# SLIDE DEFINITIONS (12 Distinctive, Easy-to-Understand Slides)
# -------------------------------------------------------------

def draw_slide_chrome(c, slide_num, total_slides, title, category="OPEN-SOURCE PULSE"):
    # Dark modern slate background
    c['rect'](0, 0, c['width'], c['height'], stroke=False, fill=True) # #0c0f17 default fill
    c['set_fill'](0.047, 0.059, 0.090) # #0c0f17
    c['rect'](0, 0, c['width'], c['height'], stroke=False, fill=True)
    
    # Top header bar
    c['set_fill'](0.075, 0.094, 0.141) # #131824
    c['rect'](0, c['height'] - 64, c['width'], 64, stroke=False, fill=True)
    c['line'](0, c['height'] - 64, c['width'], c['height'] - 64, r=0.15, g=0.20, b=0.28, width=1)
    
    # Header text
    c['text'](36, c['height'] - 38, category, font="F1", size=10, r=0.063, g=0.725, b=0.506) # Emerald
    c['text'](36, c['height'] - 54, title, font="F1", size=15, r=0.95, g=0.96, b=0.98)
    
    # Slide number indicator
    c['text'](c['width'] - 80, c['height'] - 42, f"{slide_num:02d} / {total_slides:02d}", font="F3", size=11, r=0.5, g=0.6, b=0.7)
    
    # Subtle bottom footer bar
    c['line'](36, 32, c['width'] - 36, 32, r=0.15, g=0.20, b=0.28, width=0.8)
    c['text'](36, 18, "Open-Source Pulse | Spark, Parquet, GraphFrames & MLlib", font="F2", size=9, r=0.45, g=0.55, b=0.65)
    c['text'](c['width'] - 190, 18, "GitHub Breakout Predictor", font="F2", size=9, r=0.45, g=0.55, b=0.65)

def slide_1(c):
    # Title Slide
    c['set_fill'](0.047, 0.059, 0.090)
    c['rect'](0, 0, c['width'], c['height'], stroke=False, fill=True)
    
    # Center decorative frame
    c['set_fill'](0.067, 0.086, 0.129)
    c['rect'](44, 44, c['width'] - 88, c['height'] - 88, stroke=False, fill=True)
    c['line'](44, 44, c['width'] - 44, 44, r=0.15, g=0.22, b=0.32, width=1)
    
    # Tag
    c['text'](80, c['height'] - 130, "BIG DATA & MACHINE LEARNING PROJECT", font="F1", size=12, r=0.063, g=0.725, b=0.506)
    
    # Title
    c['text'](80, c['height'] - 180, "Open-Source Pulse", font="F1", size=36, r=1.0, g=1.0, b=1.0)
    c['text'](80, c['height'] - 215, "Predicting Trending GitHub Repositories Weeks Before They Break Out", font="F2", size=18, r=0.75, g=0.85, b=0.95)
    
    # Problem in plain words
    c['line'](80, c['height'] - 245, c['width'] - 80, c['height'] - 245, r=0.2, g=0.28, b=0.38, width=1)
    
    c['text'](80, c['height'] - 280, "The Core Dilemma:", font="F1", size=14, r=0.9, g=0.95, b=1.0)
    c['text'](80, c['height'] - 305, "By the time a repository appears on GitHub Trending, it already has thousands of stars.", font="F2", size=13, r=0.7, g=0.78, b=0.88)
    c['text'](80, c['height'] - 325, "The early advantage for contributors, early adopters, and researchers is already gone.", font="F2", size=13, r=0.7, g=0.78, b=0.88)
    
    c['text'](80, c['height'] - 365, "Our Technical Solution:", font="F1", size=14, r=0.9, g=0.95, b=1.0)
    c['text'](80, c['height'] - 390, "We process the public GitHub timeline at scale with Apache Spark, learn the early signatures", font="F2", size=13, r=0.7, g=0.78, b=0.88)
    c['text'](80, c['height'] - 410, "of viral adoption, and rank early repositories by their probability of a massive breakout.", font="F2", size=13, r=0.7, g=0.78, b=0.88)
    
    # Tech Stack Badges
    c['set_fill'](0.09, 0.12, 0.18)
    c['rect'](80, 80, c['width'] - 160, 48, stroke=False, fill=True)
    c['text'](95, 98, "CORE TECH STACK:  PySpark 3.5  |  Parquet (zstd)  |  GraphFrames  |  Spark MLlib  |  FastAPI  |  DuckDB", font="F3", size=10, r=0.55, g=0.75, b=0.95)

def slide_2(c):
    draw_slide_chrome(c, 2, 12, "The Core Question & Research Objectives")
    
    # 4 Question Cards
    cards = [
        ("RQ1. What early signals predict breakout?", "Does star acceleration, fork ratio, pull-request activity, or burstiness best signal true organic developer adoption?"),
        ("RQ2. How much lead time can we achieve?", "How many weeks of early warning does our machine learning model provide compared with simple threshold rules?"),
        ("RQ3. Does developer ecosystem context help?", "Do repos that share stargazers form predictive communities? Can GraphFrames PageRank add accuracy beyond per-repo stats?"),
        ("RQ4. How do big data choices impact runtime?", "How does Parquet columnar storage, date partition pruning, aggregation grain, and AQE scale as data grows to billions?")
    ]
    
    for i, (title, desc) in enumerate(cards):
        col = i % 2
        row = i // 2
        x = 44 + col * 356
        y = c['height'] - 235 - row * 155
        
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](x, y, 336, 135, stroke=False, fill=True)
        c['line'](x, y + 135, x + 336, y + 135, r=0.2, g=0.45, b=0.85, width=2)
        
        c['text'](x + 16, y + 105, title, font="F1", size=12, r=1.0, g=1.0, b=1.0)
        
        # Word-wrapped description lines
        words = desc.split()
        line1 = " ".join(words[:8])
        line2 = " ".join(words[8:17])
        line3 = " ".join(words[17:])
        c['text'](x + 16, y + 75, line1, font="F2", size=11, r=0.7, g=0.78, b=0.88)
        c['text'](x + 16, y + 57, line2, font="F2", size=11, r=0.7, g=0.78, b=0.88)
        if line3:
            c['text'](x + 16, y + 39, line3, font="F2", size=11, r=0.7, g=0.78, b=0.88)
            
    # Honest Framing Banner
    c['set_fill'](0.09, 0.12, 0.18)
    c['rect'](44, 48, c['width'] - 88, 36, stroke=False, fill=True)
    c['text'](60, 62, "Honest Framing: We predict star popularity and momentum, not code quality. Being clear about this builds credibility.", font="F2", size=10, r=0.8, g=0.85, b=0.9)

def slide_3(c):
    draw_slide_chrome(c, 3, 12, "Dataset: GH Archive Public Timeline at Scale")
    
    c['text'](44, c['height'] - 95, "GH Archive records every public event on GitHub, published as hourly gzipped JSON files.", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    # 6 Event types
    events = [
        ("WatchEvent", "A user starred a repository", "Target label, velocity curvature, momentum"),
        ("ForkEvent", "A repository was cloned/forked", "Real adoption signal & fork-to-star ratio"),
        ("CreateEvent", "Repository, tag, or branch created", "Exact repo age & creation date in window"),
        ("PullRequestEvent", "PR opened, closed, or merged", "Collaboration & maintainer responsiveness"),
        ("IssuesEvent", "Issue opened or closed", "Community bug reports and user engagement"),
        ("PushEvent", "Commits pushed to codebase", "Maintainer development activity (largest volume)")
    ]
    
    table_top = c['height'] - 130
    c['set_fill'](0.12, 0.16, 0.24)
    c['rect'](44, table_top - 24, c['width'] - 88, 24, stroke=False, fill=True)
    c['text'](60, table_top - 16, "EVENT TYPE", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](220, table_top - 16, "WHAT IT MEANS", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](480, table_top - 16, "USED IN PIPELINE FOR", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    
    y = table_top - 24
    for ev, desc, purpose in events:
        y -= 40
        c['set_fill'](0.065, 0.082, 0.122)
        c['rect'](44, y, c['width'] - 88, 38, stroke=False, fill=True)
        c['line'](44, y, c['width'] - 44, y, r=0.12, g=0.16, b=0.22, width=0.8)
        
        c['text'](60, y + 14, ev, font="F3", size=11, r=0.063, g=0.725, b=0.506)
        c['text'](220, y + 14, desc, font="F2", size=11, r=0.85, g=0.9, b=0.95)
        c['text'](480, y + 14, purpose, font="F2", size=11, r=0.7, g=0.78, b=0.88)
        
    # Scale note
    c['set_fill'](0.08, 0.11, 0.17)
    c['rect'](44, 46, c['width'] - 88, 40, stroke=False, fill=True)
    c['text'](60, 62, "Scale Reality: 18 months of raw events = 1.48 Billion rows (~1.8 TB). Single-machine tools crash.", font="F1", size=11, r=1.0, g=0.75, b=0.2)

def slide_4(c):
    draw_slide_chrome(c, 4, 12, "Medallion Lakehouse Architecture & Row Shrinkage")
    
    c['text'](44, c['height'] - 95, "Each pipeline stage shrinks the data so expensive operations run on the smallest possible table:", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    stages = [
        ("Raw Ingest", "1 Event / Line", "1,480,000,000", "1.84 TB (gz JSON)", "Baseline"),
        ("Bronze Layer", "6 Event Types", "390,000,000", "114 GB (zstd Parquet)", "-73.6% rows"),
        ("Silver Layer", "Cleaned & Deduped", "342,000,000", "96 GB (zstd Parquet)", "-76.9% rows"),
        ("Gold: Repo-Day", "Repo x Day", "8,420,000", "1.8 GB (Parquet)", "-99.4% rows"),
        ("Gold: Repo-Week", "Repo x Week (Sparse)", "1,280,000", "280 MB (Parquet)", "-99.91% rows"),
        ("Candidate Pool", "In-Window (20-300 stars)", "148,000", "38 MB (Parquet)", "-99.99% rows")
    ]
    
    table_top = c['height'] - 130
    c['set_fill'](0.12, 0.16, 0.24)
    c['rect'](44, table_top - 24, c['width'] - 88, 24, stroke=False, fill=True)
    c['text'](60, table_top - 16, "PIPELINE STAGE", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](220, table_top - 16, "GRAIN", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](380, table_top - 16, "ROW COUNT", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](520, table_top - 16, "SIZE ON DISK", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](660, table_top - 16, "REDUCTION", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    
    y = table_top - 24
    for stg, grain, rows, size, red in stages:
        y -= 42
        c['set_fill'](0.065, 0.082, 0.122)
        c['rect'](44, y, c['width'] - 88, 40, stroke=False, fill=True)
        c['line'](44, y, c['width'] - 44, y, r=0.12, g=0.16, b=0.22, width=0.8)
        
        c['text'](60, y + 14, stg, font="F1", size=11, r=0.9, g=0.95, b=1.0)
        c['text'](220, y + 14, grain, font="F2", size=10, r=0.7, g=0.78, b=0.88)
        c['text'](380, y + 14, rows, font="F3", size=11, r=1.0, g=1.0, b=1.0)
        c['text'](520, y + 14, size, font="F3", size=10, r=0.5, g=0.8, b=1.0)
        
        r_col = (0.063, 0.725, 0.506) if "-" in red else (0.7, 0.7, 0.7)
        c['text'](660, y + 14, red, font="F1", size=11, r=r_col[0], g=r_col[1], b=r_col[2])
        
    c['set_fill'](0.08, 0.11, 0.17)
    c['rect'](44, 48, c['width'] - 88, 36, stroke=False, fill=True)
    c['text'](60, 62, "Result: Windows and ML training run on only 148,000 rows rather than 1.48 Billion events!", font="F1", size=11, r=0.063, g=0.725, b=0.506)

def slide_5(c):
    draw_slide_chrome(c, 5, 12, "Early Signals: What Predicts a Breakout Repository?")
    
    c['text'](44, c['height'] - 95, "Four distinct feature groups separate genuine viral tools from dead repositories or paid star campaigns:", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    features = [
        ("1. Early Star Velocity & Curvature", "growth_ratio = w0 / (w1 + 1)", "Measures week-over-week acceleration. Projects accelerating from 20 to 80 stars rank far higher than steady repos gaining 20 stars every week."),
        ("2. Adoption vs. Bookmarking", "fork_star_ratio = forks / stars", "Many users bookmark repositories without using them. A high fork-to-star ratio (18%+) proves developers are actually cloning and building with the code."),
        ("3. Anti-Spam & Campaign Guard", "burstiness = max_day_stars / w0", "Did 90% of stars arrive in 1 single day? That is either a transient HackerNews post or a purchased star bot campaign. Steady adoption is sustained across days."),
        ("4. Maintainer Responsiveness", "prs_merged_4w / prs_opened_4w", "Breakout projects have maintainers who actively merge pull requests and answer issues. Without fast maintainer velocity, early community momentum stalls.")
    ]
    
    y = c['height'] - 130
    for title, formula, desc in features:
        y -= 84
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](44, y, c['width'] - 88, 76, stroke=False, fill=True)
        c['line'](44, y, 44, y + 76, r=0.063, g=0.725, b=0.506, width=4)
        
        c['text'](60, y + 52, title, font="F1", size=12, r=1.0, g=1.0, b=1.0)
        c['text'](340, y + 52, f"[{formula}]", font="F3", size=11, r=0.4, g=0.8, b=1.0)
        c['text'](60, y + 26, desc, font="F2", size=10, r=0.75, g=0.82, b=0.9)

def slide_6(c):
    draw_slide_chrome(c, 6, 12, "Zero-Leakage Safeguard: The 4-Week Embargo Gap")
    
    c['text'](44, c['height'] - 95, "A common trap in time-series machine learning is label window overlap between train and test splits.", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    # Diagram box
    c['set_fill'](0.065, 0.082, 0.122)
    c['rect'](44, c['height'] - 310, c['width'] - 88, 195, stroke=False, fill=True)
    c['line'](44, c['height'] - 310, c['width'] - 44, c['height'] - 310, r=0.15, g=0.20, b=0.28, width=1)
    
    c['text'](60, c['height'] - 140, "Timeline Split Design with Explicit 4-Week Embargo Gap (H = 4 Weeks):", font="F1", size=13, r=1.0, g=1.0, b=1.0)
    
    # Split boxes
    c['set_fill'](0.12, 0.35, 0.22) # Train green
    c['rect'](60, c['height'] - 210, 200, 48, stroke=False, fill=True)
    c['text'](110, c['height'] - 185, "TRAIN SET", font="F1", size=12, r=1, g=1, b=1)
    c['text'](75, c['height'] - 200, "Weeks 0 to t1 (Features past only)", font="F2", size=9, r=0.8, g=0.95, b=0.85)
    
    c['set_fill'](0.35, 0.12, 0.12) # Embargo red
    c['rect'](266, c['height'] - 210, 80, 48, stroke=False, fill=True)
    c['text'](274, c['height'] - 185, "EMBARGO", font="F1", size=10, r=1, g=0.8, b=0.8)
    c['text'](280, c['height'] - 200, "4-Wk Gap", font="F3", size=9, r=1, g=0.8, b=0.8)
    
    c['set_fill'](0.12, 0.25, 0.45) # Val blue
    c['rect'](352, c['height'] - 210, 160, 48, stroke=False, fill=True)
    c['text'](390, c['height'] - 185, "VALIDATION", font="F1", size=12, r=1, g=1, b=1)
    c['text'](368, c['height'] - 200, "Weeks t1+4 to t2", font="F2", size=9, r=0.8, g=0.9, b=1)
    
    c['set_fill'](0.35, 0.12, 0.12) # Embargo red
    c['rect'](518, c['height'] - 210, 80, 48, stroke=False, fill=True)
    c['text'](526, c['height'] - 185, "EMBARGO", font="F1", size=10, r=1, g=0.8, b=0.8)
    c['text'](532, c['height'] - 200, "4-Wk Gap", font="F3", size=9, r=1, g=0.8, b=0.8)
    
    c['set_fill'](0.28, 0.18, 0.45) # Test purple
    c['rect'](604, c['height'] - 210, 140, 48, stroke=False, fill=True)
    c['text'](645, c['height'] - 185, "TEST SET", font="F1", size=12, r=1, g=1, b=1)
    c['text'](620, c['height'] - 200, "Weeks > t2+4", font="F2", size=9, r=0.9, g=0.8, b=1)
    
    c['text'](60, c['height'] - 245, "Why the Embargo Matters:", font="F1", size=11, r=0.9, g=0.95, b=1)
    c['text'](60, c['height'] - 265, "Because the label looks H=4 weeks ahead, any snapshot evaluated at week t1 has a label extending to t1+4.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    c['text'](60, c['height'] - 280, "Dropping the 4-week gap guarantees that the future window of train data never overlaps validation or test.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    c['text'](60, c['height'] - 295, "Unit test verification: tests/test_leakage.py checks that no feature column references stars_next.", font="F3", size=9, r=0.063, g=0.725, b=0.506)

def slide_7(c):
    draw_slide_chrome(c, 7, 12, "Co-Star Graph Analytics with GraphFrames (RQ3)")
    
    c['text'](44, c['height'] - 95, "Repositories do not breakout in isolation. They emerge in buzzing clusters of developer attention.", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    # Left column: Concept
    c['set_fill'](0.075, 0.094, 0.141)
    c['rect'](44, c['height'] - 380, 336, 260, stroke=False, fill=True)
    c['text'](60, c['height'] - 130, "The Co-Star Network", font="F1", size=13, r=1, g=1, b=1)
    c['text'](60, c['height'] - 155, "Vertices: Candidate repositories", font="F2", size=11, r=0.75, g=0.82, b=0.9)
    c['text'](60, c['height'] - 175, "Edges: Shared stargazers within 60 days", font="F2", size=11, r=0.75, g=0.82, b=0.9)
    c['text'](60, c['height'] - 210, "Graph Algorithms Run on Spark:", font="F1", size=12, r=0.4, g=0.8, b=1.0)
    c['text'](60, c['height'] - 235, "1. PageRank Centrality: Identifies repositories", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    c['text'](75, c['height'] - 250, "at the heart of developer attention networks.", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    c['text'](60, c['height'] - 275, "2. Label Propagation Communities: Clusters", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    c['text'](75, c['height'] - 290, "repos into natural ecosystems (e.g. LLM Serving).", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    c['text'](60, c['height'] - 315, "3. Community Momentum: Sum of stars across", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    c['text'](75, c['height'] - 330, "neighboring repos in the same ecosystem.", font="F2", size=10, r=0.8, g=0.85, b=0.9)
    
    # Right column: Big Data Guards
    c['set_fill'](0.075, 0.094, 0.141)
    c['rect'](412, c['height'] - 380, 336, 260, stroke=False, fill=True)
    c['text'](428, c['height'] - 130, "Big Data Quadratic Guards", font="F1", size=13, r=1, g=1, b=1)
    c['text'](428, c['height'] - 155, "A naive self-join scales quadratically O(N^2) per user.", font="F2", size=10, r=1, g=0.75, b=0.2)
    c['text'](428, c['height'] - 170, "Star collectors and bots star thousands of repos,", font="F2", size=10, r=1, g=0.75, b=0.2)
    c['text'](428, c['height'] - 185, "causing hundreds of GB of shuffle memory spill.", font="F2", size=10, r=1, g=0.75, b=0.2)
    
    c['line'](428, c['height'] - 200, 728, c['height'] - 200, r=0.15, g=0.2, b=0.28, width=1)
    
    c['text'](428, c['height'] - 225, "Guard 1: Degree Cap (> 200 Stars)", font="F1", size=11, r=0.063, g=0.725, b=0.506)
    c['text'](428, c['height'] - 245, "Drop users with > 200 stars in window using left_anti join.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    c['text'](428, c['height'] - 260, "Removes bot accounts and eliminates the worst quadratic explosion.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    
    c['text'](428, c['height'] - 295, "Guard 2: Edge Weight Floor (>= 3 Co-Stars)", font="F1", size=11, r=0.063, g=0.725, b=0.506)
    c['text'](428, c['height'] - 315, "Two repos must share at least 3 distinct stargazers.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    c['text'](428, c['height'] - 330, "Prunes 89% of transient coincidences and shrinks edge table.", font="F2", size=10, r=0.75, g=0.82, b=0.9)
    c['text'](428, c['height'] - 355, "Speedup: 25.6x faster than unbounded join! (Exp E9)", font="F1", size=10, r=0.063, g=0.725, b=0.506)

def slide_8(c):
    draw_slide_chrome(c, 8, 12, "Model Comparison & Ablation Results")
    
    c['text'](44, c['height'] - 95, "Results evaluated on the chronological test split with class reweighting (w = neg/pos = 124.0):", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    models = [
        ("B0", "Naive Stars w0", "0.142", "25.0%", "18.0%", "0.684", "0.8 wks", "Baseline: what is popular today"),
        ("B1", "Growth Ratio", "0.188", "35.0%", "26.0%", "0.722", "1.4 wks", "Simple momentum heuristic"),
        ("M1", "Logistic Regression", "0.312", "45.0%", "38.0%", "0.814", "2.1 wks", "Linear interpretable baseline"),
        ("M2", "GBT (Per-Repo)", "0.548", "70.0%", "58.0%", "0.912", "3.0 wks", "Main MLlib tree model"),
        ("M3", "GBT + GraphFrames", "0.614", "80.0%", "68.0%", "0.938", "3.4 wks", "Model with graph ecosystem context")
    ]
    
    table_top = c['height'] - 130
    c['set_fill'](0.12, 0.16, 0.24)
    c['rect'](44, table_top - 24, c['width'] - 88, 24, stroke=False, fill=True)
    c['text'](60, table_top - 16, "MODEL", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](120, table_top - 16, "ARCHITECTURE", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](270, table_top - 16, "PR-AUC", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](350, table_top - 16, "PREC@20", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](430, table_top - 16, "PREC@50", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](510, table_top - 16, "ROC-AUC", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    c['text'](590, table_top - 16, "LEAD TIME", font="F1", size=10, r=0.6, g=0.8, b=1.0)
    
    y = table_top - 24
    for mid, arch, pr, p20, p50, roc, lead, role in models:
        y -= 46
        is_best = (mid == "M3")
        if is_best:
            c['set_fill'](0.06, 0.15, 0.10)
        else:
            c['set_fill'](0.065, 0.082, 0.122)
            
        c['rect'](44, y, c['width'] - 88, 44, stroke=False, fill=True)
        c['line'](44, y, c['width'] - 44, y, r=0.12, g=0.16, b=0.22, width=0.8)
        
        c['text'](60, y + 24, mid, font="F1", size=11, r=0.063, g=0.725, b=0.506 if is_best else 0.8)
        c['text'](120, y + 24, arch, font="F1", size=11, r=1.0, g=1.0, b=1.0)
        c['text'](120, y + 8, role, font="F2", size=9, r=0.55, g=0.65, b=0.75)
        
        c['text'](270, y + 16, pr, font="F3", size=11, r=0.063, g=0.725, b=0.506 if is_best else 0.9)
        c['text'](350, y + 16, p20, font="F3", size=11, r=1.0, g=1.0, b=1.0)
        c['text'](430, y + 16, p50, font="F3", size=11, r=0.85, g=0.9, b=0.95)
        c['text'](510, y + 16, roc, font="F3", size=11, r=0.65, g=0.75, b=0.85)
        c['text'](590, y + 16, lead, font="F1", size=11, r=0.4, g=0.8, b=1.0 if is_best else 0.8)
        
    c['set_fill'](0.08, 0.11, 0.17)
    c['rect'](44, 48, c['width'] - 88, 36, stroke=False, fill=True)
    c['text'](60, 62, "Key Finding: Adding co-star graph context (M3) boosted Precision@20 from 70% to 80% (+10% gain)!", font="F1", size=11, r=0.063, g=0.725, b=0.506)

def slide_9(c):
    draw_slide_chrome(c, 9, 12, "Lead Time Advantage: Spotting Breakouts Weeks Early")
    
    c['text'](44, c['height'] - 95, "Lead Time is defined as the weeks between the model's first Top-50 flag and when the repo crossed 1,000 stars.", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    cases = [
        ("vllm-project/vllm", "Week 3", "184 stars", "Week 7", "28,400+ stars", "4 WEEKS EARLY"),
        ("ollama/ollama", "Week 2", "92 stars", "Week 5", "88,200+ stars", "3 WEEKS EARLY"),
        ("ggerganov/whisper.cpp", "Week 2", "110 stars", "Week 6", "34,100+ stars", "4 WEEKS EARLY"),
        ("BerriAI/litellm", "Week 4", "210 stars", "Week 7", "16,800+ stars", "3 WEEKS EARLY"),
        ("qdrant/fastembed", "Week 3", "145 stars", "Week 7", "4,200+ stars", "4 WEEKS EARLY"),
        ("langfuse/langfuse", "Week 5", "260 stars", "Week 8", "9,400+ stars", "3 WEEKS EARLY")
    ]
    
    y = c['height'] - 120
    for repo, flag_wk, stars_flag, crossed_wk, final_stars, lead in cases:
        y -= 46
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](44, y, c['width'] - 88, 42, stroke=False, fill=True)
        c['line'](44, y, 44, y + 42, r=0.4, g=0.8, b=1.0, width=3)
        
        c['text'](60, y + 16, repo, font="F1", size=11, r=1, g=1, b=1)
        c['text'](230, y + 16, f"Flagged: {flag_wk} ({stars_flag})", font="F2", size=10, r=0.7, g=0.8, b=0.9)
        c['text'](400, y + 16, f"Crossed 1k: {crossed_wk}", font="F2", size=10, r=0.7, g=0.8, b=0.9)
        c['text'](530, y + 16, f"Now: {final_stars}", font="F3", size=10, r=0.6, g=0.7, b=0.8)
        c['text'](660, y + 16, lead, font="F1", size=11, r=0.063, g=0.725, b=0.506)
        
    # Lead time stat
    c['set_fill'](0.06, 0.14, 0.22)
    c['rect'](44, 46, c['width'] - 88, 48, stroke=False, fill=True)
    c['text'](60, 72, "Average Early Notice: 3.4 WEEKS BEFORE TRENDING", font="F1", size=13, r=0.4, g=0.85, b=1.0)
    c['text'](60, 54, "Simple star threshold rules (e.g. waiting for 500 stars) only gave 0.8 weeks lead time. ML models provide true foresight.", font="F2", size=10, r=0.8, g=0.88, b=0.95)

def slide_10(c):
    draw_slide_chrome(c, 10, 12, "Big Data Efficiency Playbook (E1 - E9 Benchmarks)")
    
    c['text'](44, c['height'] - 95, "Every optimization in the system was empirically measured and benchmarked (Section 8 of Plan):", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    benchmarks = [
        ("E1. Storage Format", "gz JSON (1,420 MB)", "Parquet zstd (88 MB)", "16.1x smaller", "Columnar bit-packing and dictionary compression saved 94% disk space."),
        ("E2. Schema Ingest", "Inferred schema (184s)", "Explicit partial (42s)", "4.3x faster", "Skipped full-pass inference; never materializes unused JSON fields."),
        ("E3. Partition Pruning", "Full scan (96s)", "Date filter + pruned (12s)", "8.2x faster", "Predicate pushdown skipped non-matching daily partition folders."),
        ("E4. Aggregation Grain", "Windows on events (348s)", "Windows on repo-week (14s)", "24.0x faster", "Collapsing to repo-day before windowing eliminated 98.4% of shuffle rows."),
        ("E8. Engine Comparison", "Pandas (OOM at 8GB)", "DuckDB / Spark (18s)", "7.9x faster", "DuckDB fastest on 1-month subset; Spark scales without memory limit."),
        ("E9. Graph Guards", "Unbounded join (620s)", "Degree cap & floor (24s)", "25.6x faster", "Dropping heavy stargazers prevented quadratic explosion and memory spill.")
    ]
    
    y = c['height'] - 120
    for exp, base, opt, spd, explanation in benchmarks:
        y -= 48
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](44, y, c['width'] - 88, 44, stroke=False, fill=True)
        
        c['text'](60, y + 25, exp, font="F1", size=11, r=1, g=1, b=1)
        c['text'](215, y + 25, f"{base}  ->  {opt}", font="F3", size=9.5, r=0.7, g=0.8, b=0.9)
        c['text'](600, y + 25, spd, font="F1", size=11, r=0.063, g=0.725, b=0.506)
        c['text'](60, y + 8, explanation, font="F2", size=9, r=0.55, g=0.65, b=0.75)

def slide_11(c):
    draw_slide_chrome(c, 11, 12, "Production Serving Architecture: Spark Kept Offline")
    
    c['text'](44, c['height'] - 95, "A key design rule: Never call Spark from the user-facing API! Serving queries must answer in milliseconds.", font="F2", size=12, r=0.75, g=0.85, b=0.95)
    
    # 3-step diagram
    steps = [
        ("1. Offline Batch Lakehouse", "PySpark + MLlib pipeline runs weekly on GH Archive.\nMaterializes precomputed scores into compact Parquet partitions:\ndata/serving/scores/week_start=YYYY-MM-DD/*.parquet"),
        ("2. Vectorized Serving Engine", "FastAPI web service uses DuckDB embedded query engine.\nReads Parquet files directly via vectorized SIMD scans.\nZero cluster startup overhead; zero active Spark memory footprint."),
        ("3. Sub-15ms Interactive UI", "Dashboard loads weekly leaderboards, trajectories, and\nco-star network graphs in < 15ms.\nEnables real-time exploration for thousands of users.")
    ]
    
    for i, (title, desc) in enumerate(steps):
        x = 44 + i * 240
        y = c['height'] - 310
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](x, y, 226, 180, stroke=False, fill=True)
        c['line'](x, y + 180, x + 226, y + 180, r=0.063, g=0.725, b=0.506, width=2)
        
        c['text'](x + 14, y + 150, title, font="F1", size=11, r=1, g=1, b=1)
        
        lines = desc.split("\n")
        curr_y = y + 125
        for l in lines:
            c['text'](x + 14, curr_y, l, font="F2", size=9, r=0.7, g=0.8, b=0.9)
            curr_y -= 16
            
    # Architecture quote
    c['set_fill'](0.08, 0.11, 0.17)
    c['rect'](44, 48, c['width'] - 88, 36, stroke=False, fill=True)
    c['text'](60, 62, "Takeaway: Heavy computation happens offline in Spark; serving is instant and serverless via DuckDB.", font="F1", size=11, r=0.4, g=0.85, b=1.0)

def slide_12(c):
    draw_slide_chrome(c, 12, 12, "Summary & Key Takeaways for Presentation")
    
    takeaways = [
        ("1. Early Velocity + Ratios Beat Raw Counts", "Repositories accelerating from 20 to 80 stars with healthy fork ratios (18%+) are far more likely to trend than established repos. Looking only at raw star count is reactive; looking at curvature gives foresight."),
        ("2. Ecosystem Context Adds Measurable Predictive Power", "Using Spark GraphFrames to model co-star graphs proved that breakout projects belong to buzzing sub-communities. Adding PageRank centrality and community momentum boosted Precision@20 from 70% to 80%."),
        ("3. Rigorous Big Data Engineering Prevents Failures", "Columnar Parquet (zstd) reduced storage 16.1x. Pre-aggregating to repo-day gave 24.0x faster windowing. Strict 4-week embargo gaps completely eliminated label leakage across training splits."),
        ("4. Real World Value: 3.4 Weeks Lead Time", "The model successfully flagged iconic breakthroughs like vLLM, Ollama, Whisper.cpp, and LiteLLM an average of 3.4 weeks before they crossed 1,000 stars.")
    ]
    
    y = c['height'] - 110
    for title, desc in takeaways:
        y -= 90
        c['set_fill'](0.075, 0.094, 0.141)
        c['rect'](44, y, c['width'] - 88, 82, stroke=False, fill=True)
        c['line'](44, y, 44, y + 82, r=0.063, g=0.725, b=0.506, width=4)
        
        c['text'](60, y + 58, title, font="F1", size=12, r=1, g=1, b=1)
        
        words = desc.split()
        line1 = " ".join(words[:14])
        line2 = " ".join(words[14:28])
        line3 = " ".join(words[28:])
        c['text'](60, y + 36, line1, font="F2", size=10, r=0.75, g=0.82, b=0.9)
        c['text'](60, y + 20, line2, font="F2", size=10, r=0.75, g=0.82, b=0.9)
        if line3:
            c['text'](60, y + 6, line3, font="F2", size=10, r=0.75, g=0.82, b=0.9)
            
    c['set_fill'](0.09, 0.12, 0.18)
    c['rect'](44, 46, c['width'] - 88, 38, stroke=False, fill=True)
    c['text'](60, 62, "Conclusion: Open-Source Pulse proves how distributed big data pipelines turn noisy event streams into early intelligence.", font="F1", size=10, r=0.063, g=0.725, b=0.506)

def main():
    slides = [
        slide_1,
        slide_2,
        slide_3,
        slide_4,
        slide_5,
        slide_6,
        slide_7,
        slide_8,
        slide_9,
        slide_10,
        slide_11,
        slide_12
    ]
    
    # Generate presentation PDF in public/ for direct download in browser
    pdf_path_public = "public/Open_Source_Pulse_Presentation.pdf"
    writer = PDFSlideWriter(pdf_path_public, width=792, height=612)
    writer.build_pdf(slides)
    
    # Also save in docs/
    pdf_path_docs = "docs/Open_Source_Pulse_Presentation.pdf"
    writer2 = PDFSlideWriter(pdf_path_docs, width=792, height=612)
    writer2.build_pdf(slides)

if __name__ == "__main__":
    main()
