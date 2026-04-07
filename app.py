from flask import Flask, request, jsonify, send_file, render_template
from main import run_pipeline
import traceback
import json
import os
from datetime import datetime

app = Flask(__name__, template_folder="templates", static_folder="static")

REPORT_PATH = "reports/final_audit_report.json"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data or "url" not in data:
            return jsonify({"status": "error", "message": "URL is required"}), 400

        url = data["url"].strip()

        if not url.startswith(("http://", "https://")):
            return jsonify({"status": "error", "message": "Invalid URL"}), 400

        print(f"\n🌐 Analyzing: {url}")

        start_time = datetime.now()

        # RUN PIPELINE
        result = run_pipeline(url, show_output=False)
        print("PIPELINE RESULT:", result)

        end_time = datetime.now()

        # -------------------------------
        # SAFE ISSUE EXTRACTION
        # -------------------------------
        issues = result.get("issues", [])
        if not isinstance(issues, list):
            issues = []

        categories = {
            "content": [],
            "seo": [],
            "security": [],
            "frontend": []
        }

        for issue in issues:
            cat = str(issue.get("category", "")).lower()

            if "content" in cat:
                categories["content"].append(issue)
            elif "seo" in cat:
                categories["seo"].append(issue)
            elif "security" in cat:
                categories["security"].append(issue)
            elif "frontend" in cat:
                categories["frontend"].append(issue)

        # -------------------------------
        # SCORE CALCULATION
        # -------------------------------
        def calc_score(issue_list):
            score = 100
            for i in issue_list:
                sev = str(i.get("severity", "")).upper()
                if sev == "HIGH":
                    score -= 15
                elif sev == "MEDIUM":
                    score -= 8
                else:
                    score -= 3
            return max(score, 0)

        response_data = {
            "content_report": {
                "score_after": calc_score(categories["content"]),
                "issues": categories["content"]
            },
            "seo_report": {
                "score_after": calc_score(categories["seo"]),
                "issues": categories["seo"]
            },
            "security_report": {
                "score_after": calc_score(categories["security"]),
                "issues": categories["security"]
            },
            "frontend_report": {
                "score_after": calc_score(categories["frontend"]),
                "issues": categories["frontend"]
            }
        }

        # SAVE REPORT
        os.makedirs("reports", exist_ok=True)

        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump({
                "url": url,
                "analysis_time": str(end_time - start_time),
                "data": response_data
            }, f, indent=4)

        return jsonify({
            "status": "success",
            "data": response_data
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        traceback.print_exc()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/download")
def download():
    if not os.path.exists(REPORT_PATH):
        return jsonify({"status": "error", "message": "No report found"}), 404

    return send_file(REPORT_PATH, as_attachment=True)


if __name__ == "__main__":
    os.makedirs("reports", exist_ok=True)
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=True)