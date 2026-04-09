# SEO Optimizer AI — AI Website Audit System

<div align="center">

![SEO Optimizer AI](https://img.shields.io/badge/SEO%20Optimizer%20AI-v2.0-6366f1?style=for-the-badge\&logo=search\&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge\&logo=flask\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

**A multi-agent AI website audit platform built with Flask.**
Analyze any website for SEO, Security, Performance, Content, and more — instantly.

</div>

---

## ✨ Features

* 🔒 Security checks (XSS, CSRF, unsafe links, data exposure)
* 📈 SEO analysis (meta tags, headings, keywords, structure)
* ⚡ Performance insights (speed, caching, scripts)
* 📝 Content quality (readability, spelling, CTAs)
* 🎨 Frontend analysis (HTML structure, accessibility)
* 🖼 Image optimization (alt text, size, broken images)
* 🔍 Plagiarism detection (TF-IDF, repetition patterns)
* 📄 JSON report generation

---

## 🏗 Architecture

```
fin_project/
├── agents/                  # AI Agents
│   ├── content_agent.py
│   ├── frontend_agent.py
│   ├── backend_agent.py
│   ├── security_agent.py
│   ├── seo_agent.py
│   ├── plagiarism_agent.py
│   └── image_agent.py
│
├── data/                    # Temporary data storage
├── history/                 # Scan history
├── reports/                 # Generated reports
├── static/                  # CSS, JS, assets
├── templates/               # HTML templates
│
├── app.py                   # Flask server
├── main.py                  # Pipeline controller
├── issue_schema.py          # Issue format
├── requirements.txt         # Dependencies
└── README.md



## 🧠 How It Works

1. User submits a URL
2. Flask API receives request
3. `main.py` runs all agents
4. Each agent analyzes specific aspects
5. Issues are collected
6. Report is saved and returned

---

## 🧰 Tech Stack

* Backend: Flask (Python)
* Frontend: HTML, CSS, JavaScript
* Libraries: BeautifulSoup, requests, NLTK, scikit-learn
* Reports: JSON

---

## 🔮 Future Scope

* Batch URL scanning
* PDF reports
* Authentication system
* Scheduled scans
* JS-rendered site support



Built with ❤ using Flask & Python

