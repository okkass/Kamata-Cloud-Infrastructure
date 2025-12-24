import html
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

"""Convert JUnit XML (schemathesis output) into a readable HTML dashboard."""


in_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("junit-20251223T012323Z.xml")
out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("junit-20251223T012323Z.html")


def to_float(value: str) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


def load_cases(root: ET.Element):
    suites = root.findall("testsuite")
    if not suites and root.tag == "testsuite":
        suites = [root]

    cases = []
    for suite in suites:
        for tc in suite.findall("testcase"):
            name = tc.attrib.get("name", "")
            time = to_float(tc.attrib.get("time", "0"))
            failures = tc.findall("failure")
            skipped = tc.findall("skipped")
            status = "passed"
            messages = []
            if failures:
                status = "failed"
                for f in failures:
                    msg = f.attrib.get("message", "")
                    text = f.text or ""
                    combined = msg
                    if text.strip():
                        combined = f"{combined}\n\n{text.strip()}" if combined else text.strip()
                    messages.append(html.unescape(combined.strip()))
            elif skipped:
                status = "skipped"
                for s in skipped:
                    if (s.text or "").strip():
                        messages.append((s.text or "").strip())
            cases.append({
                "name": name,
                "time": time,
                "status": status,
                "messages": messages,
            })
    return cases


def build_summary(cases):
    return {
        "total": len(cases),
        "failed": sum(1 for c in cases if c["status"] == "failed"),
        "skipped": sum(1 for c in cases if c["status"] == "skipped"),
        "passed": sum(1 for c in cases if c["status"] == "passed"),
        "time": sum(c["time"] for c in cases),
    }


status_colors = {
    "passed": "#16a34a",
    "failed": "#dc2626",
    "skipped": "#f97316",
}


def render_rows(cases):
    rows = []
    for c in cases:
        color = status_colors.get(c["status"], "#374151")
        msg_html = ""
        if c["messages"]:
            msg_html = "\n".join(f"<pre>{html.escape(m)}</pre>" for m in c["messages"])
        rows.append(
            f"""
      <tr>
        <td class=\"status\" style=\"color:{color}\">{c['status'].title()}</td>
        <td class=\"name\">{html.escape(c['name'])}</td>
        <td class=\"time\">{c['time']:.3f}s</td>
        <td class=\"msg\">{msg_html or '&mdash;'}</td>
      </tr>
    """
        )
    return "".join(rows)


def render_html(cases, summary):
    rows = render_rows(cases)
    return f"""<!doctype html>
<html lang=\"ja\">
<head>
  <meta charset=\"UTF-8\" />
  <title>JUnit Report</title>
  <style>
    :root {{ font-family: 'Segoe UI', 'Noto Sans JP', sans-serif; background:#0f172a; color:#e5e7eb; }}
    body {{ margin:2rem; }}
    h1 {{ margin-bottom:0.2rem; }}
    .grid {{ display:grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap:0.75rem; margin:1rem 0 2rem; }}
    .card {{ background:#1f2937; border:1px solid #334155; border-radius:12px; padding:0.9rem 1rem; box-shadow:0 10px 40px rgba(0,0,0,0.35); }}
    .card strong {{ display:block; font-size:0.9rem; color:#9ca3af; }}
    .card span {{ font-size:1.5rem; font-weight:700; }}
    table {{ width:100%; border-collapse:collapse; background:#111827; border:1px solid #1f2937; border-radius:12px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.35); }}
    th, td {{ padding:0.75rem 0.9rem; text-align:left; vertical-align:top; }}
    th {{ background:#1f2937; color:#9ca3af; font-weight:600; position:sticky; top:0; }}
    tr:nth-child(even) td {{ background:#0b1220; }}
    tr:nth-child(odd) td {{ background:#111827; }}
    .status {{ font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }}
    .time {{ color:#a5b4fc; width:80px; }}
    .name {{ width:320px; color:#e5e7eb; }}
    .msg pre {{ white-space:pre-wrap; background:#0b1220; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; margin:0.25rem 0; color:#e5e7eb; max-height:300px; overflow:auto; }}
    .msg {{ color:#e5e7eb; font-size:0.9rem; }}
    .pill {{ display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.65rem; border-radius:999px; font-weight:700; font-size:0.85rem; }}
    .pill.failed {{ background:rgba(220,38,38,0.14); color:#fecdd3; border:1px solid rgba(220,38,38,0.4); }}
    .pill.passed {{ background:rgba(22,163,74,0.14); color:#bbf7d0; border:1px solid rgba(22,163,74,0.4); }}
    .pill.skipped {{ background:rgba(249,115,22,0.12); color:#fed7aa; border:1px solid rgba(249,115,22,0.35); }}
  </style>
</head>
<body>
  <h1>JUnit テスト結果</h1>
  <p>ファイル: {html.escape(str(in_path))}</p>
  <div class=\"grid\">
    <div class=\"card\"><strong>合計</strong><span>{summary['total']}</span></div>
    <div class=\"card\"><strong>失敗</strong><span style=\"color:{status_colors['failed']}\">{summary['failed']}</span></div>
    <div class=\"card\"><strong>成功</strong><span style=\"color:{status_colors['passed']}\">{summary['passed']}</span></div>
    <div class=\"card\"><strong>スキップ</strong><span style=\"color:{status_colors['skipped']}\">{summary['skipped']}</span></div>
    <div class=\"card\"><strong>合計時間</strong><span>{summary['time']:.2f}s</span></div>
  </div>
  <table>
    <thead>
      <tr><th style=\"width:90px;\">ステータス</th><th>テストケース</th><th style=\"width:90px;\">時間</th><th>詳細</th></tr>
    </thead>
    <tbody>
      {rows}
    </tbody>
  </table>
</body>
</html>
"""


def main():
    root = ET.parse(in_path).getroot()
    cases = load_cases(root)
    summary = build_summary(cases)
    html_content = render_html(cases, summary)
    out_path.write_text(html_content, encoding="utf-8")
    print(
        f"Wrote {out_path} ("
        f"{summary['total']} cases, {summary['failed']} failed, {summary['skipped']} skipped)"
    )


if __name__ == "__main__":
    main()
