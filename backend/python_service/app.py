# backend/python_service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import pdfplumber
import spacy
import io

app = Flask(__name__)
CORS(app)

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None
    print("⚠ spaCy model not loaded — install with: python -m spacy download en_core_web_sm")

# SKILLS DATABASE — expand freely
JOB_ROLES = {
    "data analyst":        ["python", "sql", "excel", "power bi", "tableau", "statistics",
                            "machine learning", "data visualization", "pandas", "numpy"],
    "web developer":       ["html", "css", "javascript", "react", "node.js", "mongodb",
                            "typescript", "rest api", "git", "responsive design"],
    "software engineer":   ["java", "python", "data structures", "algorithms", "git",
                            "oop", "system design", "unit testing", "sql", "problem solving"],
    "machine learning engineer": ["python", "tensorflow", "pytorch", "scikit-learn",
                            "deep learning", "nlp", "computer vision", "statistics",
                            "pandas", "model deployment"],
    "ui/ux designer":      ["figma", "adobe xd", "wireframing", "prototyping",
                            "user research", "design systems", "css", "accessibility",
                            "sketch", "usability testing"],
    "devops engineer":     ["docker", "kubernetes", "aws", "ci/cd", "linux",
                            "terraform", "jenkins", "git", "bash scripting", "monitoring"],
    "android developer":   ["java", "kotlin", "android sdk", "xml", "firebase",
                            "rest api", "git", "mvvm", "room database", "material design"],
    "ios developer":       ["swift", "objective-c", "xcode", "uikit", "swiftui",
                            "core data", "rest api", "git", "mvvm", "app store deployment"],
    "cybersecurity analyst": ["network security", "ethical hacking", "penetration testing",
                            "siem", "firewalls", "python", "linux", "vulnerability assessment",
                            "cryptography", "incident response"],
    "cloud engineer":      ["aws", "azure", "gcp", "terraform", "docker", "kubernetes",
                            "networking", "linux", "python", "cost optimization"],
    "full stack developer": ["html", "css", "javascript", "react", "node.js", "sql",
                            "mongodb", "rest api", "git", "docker"],
    "data scientist":      ["python", "r", "machine learning", "statistics", "sql",
                            "data visualization", "deep learning", "pandas",
                            "feature engineering", "model evaluation"],
    "backend developer":   ["node.js", "python", "java", "sql", "mongodb",
                            "rest api", "microservices", "git", "docker", "system design"],
    "frontend developer":  ["html", "css", "javascript", "react", "typescript",
                            "git", "responsive design", "rest api", "figma",
                            "performance optimization"],
    "product manager":     ["product roadmap", "agile", "user research", "jira",
                            "data analysis", "stakeholder management", "wireframing",
                            "a/b testing", "communication", "market research"],
}


# extract_text_from_pdf — adapted for uploaded bytes
def extract_text_from_pdf(file_bytes):
    text = ""
    # Try pdfplumber first (much better for modern PDFs)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        if len(text.strip().split()) > 30:
            return text
    except Exception:
        pass

    # Fallback to PyPDF2
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted
    except Exception:
        pass

    return text

# extract_skills logic
def extract_skills(text, skills_list):
    found = []
    text_lower = text.lower()
    for skill in skills_list:
        if skill.lower() in text_lower:
            found.append(skill)
    return found

# analyze_resume logic
def analyze_resume(resume_text, role):
    role = role.lower().strip()
    text_lower = resume_text.lower() if resume_text else ""

    # Exact match
    matched_role = role if role in JOB_ROLES else None

    # Partial match fallback
    if not matched_role:
        for r in JOB_ROLES:
            if r in role or role in r:
                matched_role = r
                break

    if not matched_role:
        # Return all skills as context even if role not found
        return {
            "matched_role": role,
            "required_skills": [],
            "matched_skills": [],
            "missing_skills": [],
            "match_pct": 0,
            "role_found": False
        }

    required = JOB_ROLES[matched_role]
    found = extract_skills(resume_text, required)
    missing = list(set(required) - set(found))
    match_pct = round((len(found) / len(required)) * 100) if required else 0

    return {
        "matched_role": matched_role,
        "required_skills": required,
        "matched_skills": found,
        "missing_skills": missing,
        "match_pct": match_pct,
        "role_found": True
    }

# API ROUTES

# Route 1: Extract text + skill analysis from PDF
@app.route('/extract', methods=['POST'])
def extract():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    role = request.form.get('role', '')

    try:
        file_bytes = file.read()
        text = extract_text_from_pdf(file_bytes)

        word_count = len(text.split())
        if word_count < 30:
            return jsonify({"error": "Could not extract enough text from PDF"}), 400

        skill_analysis = analyze_resume(text, role)

        return jsonify({
            "text": text,
            "word_count": word_count,
            "skill_analysis": skill_analysis
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 2: Just get skills for a role (for frontend dropdowns etc.)
@app.route('/skills/<role>', methods=['GET'])
def get_skills(role):
    role = role.lower()
    skills = JOB_ROLES.get(role, [])
    return jsonify({"role": role, "skills": skills})


# Route 3: Get all roles
@app.route('/roles', methods=['GET'])
def get_roles():
    return jsonify({"roles": list(JOB_ROLES.keys())})


if __name__ == '__main__':
    app.run(port=5000, debug=True)
    print("✅ Python microservice running on http://localhost:5000")