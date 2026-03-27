# 📈 Boma-Insight AI: NSE Portfolio Copilot

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Generative AI](https://img.shields.io/badge/Generative_AI-Gemini_1.5-8E75B2?style=for-the-badge)

## 🚀 Overview
**Boma-Insight AI** is an intelligent, Agentic AI-driven financial copilot engineered specifically for the **Nairobi Securities Exchange (NSE)**.

Built to solve "analysis paralysis" for retail investors, this dashboard translates complex market data, stock movements, and financial news into plain, actionable insights. Rather than just staring at ticker symbols for Safaricom or Equity Bank, users can converse with a Generative AI agent that actively monitors their portfolio risk and evaluates market sentiment.

## ✨ Key Features
* **Agentic AI Copilot:** A sticky chat interface powered by LLMs that synthesizes NSE data, analyzes technical indicators, and explains market trends in plain English.
* **Frictionless Onboarding:** Automatically seeds new user accounts with a default NSE watchlist (SCOM, EQTY, KCB) upon Supabase Auth registration to eliminate empty states.
* **Smart Risk Alerts:** Dynamic UI cards that trigger when a stock drops, featuring an AI-generated summary of current market sentiment and sell-off volume.
* **Institutional-Grade UI:** A high-trust, dark-mode dashboard featuring glassmorphism effects, scrolling market tickers, and interactive Recharts data visualization.

## 🛠️ Technical Architecture
This project was rapidly developed and deployed using **Lovable** for UI generation, backed by a robust, strongly-typed foundation.

* **Frontend:** React, strict TypeScript, Tailwind CSS, Shadcn/UI, Lucide React Icons.
* **Backend & Auth:** Supabase (PostgreSQL), Node.js Edge Functions.
* **AI Engine:** Gemini API (Integrated for multi-step reasoning and sentiment analysis).
* **Data Visualization:** Recharts for dynamic 30-day P&L area charts.

## 🗄️ Database Schema
The application utilizes Supabase with Row Level Security (RLS) to ensure user data privacy.

**Core Table: `user_stocks`**
* `id` (uuid, primary key)
* `user_id` (uuid, references auth.users)
* `ticker_symbol` (text - e.g., 'SCOM')
* `number_of_shares` (integer)
* `average_buy_price` (numeric)
* `created_at` (timestamp)

## 💻 Getting Started (Local Development)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd boma-insight-ai