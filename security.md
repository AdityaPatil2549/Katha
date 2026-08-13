# Katha Security & Compliance Information

At Katha, we take the privacy and security of your personal media tracking and journaling seriously. Below is an overview of how we protect your data.

## 🔒 Certifications and Compliance
Katha is built entirely on **Google Cloud Firebase**, which means our underlying infrastructure inherits world-class security certifications.
* **SOC 1, SOC 2, and SOC 3**: The underlying Firebase infrastructure is audited regularly for security, availability, and confidentiality.
* **ISO/IEC 27001, 27017, 27018**: Certified for information security management and cloud security.
*(Note: While Google Cloud holds these certifications, Katha as an independent application has not undergone formal individual audits yet).*

## 🛡️ Data Encryption
* **In Transit**: All data sent between the Katha web application and our servers is encrypted using industry-standard **HTTPS/TLS 1.2+**. We enforce HTTP Strict Transport Security (HSTS) on our domain.
* **At Rest**: Your stories, moments, and profile data are stored in Firestore, which automatically encrypts all data at rest using the Advanced Encryption Standard (AES-256).

## 🌍 Data Residency
Our primary database (Firestore) is hosted in the **US-Central1** region. All customer data, user accounts, and backups are processed and stored within this Google Cloud region. 

## 🔐 Access Controls
We follow the principle of least privilege:
* **User Isolation**: Firestore Security Rules ensure that you (and only you) can read, write, or modify your personal data. User data is partitioned by your unique Authentication ID (`uid`).
* **Developer Access**: Internal access to the production Firebase console is restricted. We do not access user data unless explicitly requested by the user for support/debugging purposes.

## 🐛 Vulnerability Disclosure
We believe in responsible disclosure. If you are a security researcher and have found a vulnerability in Katha, please report it to us immediately. 
* Do not publicly disclose the vulnerability until we have had time to patch it.
* We currently do not have a paid bug bounty program, but we deeply appreciate reports that keep our users safe.

## 📜 Incident History
Transparency is key. We maintain a public log of any security incidents that result in the unauthorized access or loss of user data.
* **August 2026**: Initial launch of Katha's hardened Firebase rules.
* *No security incidents or breaches have occurred to date.*

## 🕵️‍♂️ Penetration Testing
As an indie open-source project, Katha relies on automated Static Application Security Testing (SAST) via **Semgrep**, secret scanning via **Gitleaks**, and dependency auditing. We have not yet commissioned a formal third-party penetration test. 
