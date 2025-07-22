# 🎓 StudentRank - Academic Performance Ranking System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/shadcn/ui-Components-000000?style=for-the-badge" alt="shadcn/ui">
</p>

<p align="center">
  A comprehensive student ranking platform that tracks academic performance, internships, society participation, and provides real-time leaderboards and analytics.
</p>

## ✨ Features

### 🏆 Dashboard
- **Real-time Ranking**: Live position tracking with rank progression indicators
- **Score Breakdown**: Academic vs Experience score visualization with circular progress indicators
- **Composite Scoring**: Weighted scoring system (60% Academic, 40% Experience)
- **Star Rating System**: 5-star performance rating based on composite scores
- **Recent Activity Feed**: Timeline of achievements and point changes
- **Quick Actions**: Fast access to update academic records, internships, and society activities

### 📊 Analytics & Rankings
- **Global Leaderboard**: Sortable table with comprehensive user rankings
- **Advanced Filtering**: Filter by year level (Y0-Y3), university, and search by username
- **Comparative Insights**: University performance comparisons and score distributions
- **Interactive Charts**: Score breakdown visualizations and trend analysis

### 📈 Trends & Insights
- **Performance Trends**: Historical performance tracking by university
- **Correlation Analysis**: Scatter plots showing experience vs ranking relationships
- **Year-wise Analytics**: Performance breakdown by academic year
- **University Rankings**: Top performing institutions by average composite score

### 🔐 Authentication & Security
- **Supabase Authentication**: Secure email/password authentication
- **Session Management**: Persistent login sessions with automatic redirects
- **Protected Routes**: Secure access to dashboard and analytics
- **Real-time User Data**: Dynamic user information display

### 🎨 Design & UX
- **Modern Dark Theme**: Sleek black and white design with smooth gradients
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smooth Animations**: 300ms transitions and hover effects throughout
- **Professional UI**: Clean, minimalist interface with excellent contrast ratios

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts (planned)
- **Deployment**: Vercel-ready

## 📋 Data Structure

### User Profile Management
- **Personal Information**: Name, email, university, current year
- **Academic Records**: A-Levels, GCSEs, grades, awards, certifications
- **Experience Tracking**: Internships (tier, duration, years), society roles
- **Bank Internship Tiers**: Bulge Bracket, Elite Boutique, Middle Market, Regional
- **Industry Exposure**: From shadowing to full placements

### Scoring Algorithm
- **Academic Score (60%)**: Based on grades, awards, and certifications
- **Experience Score (40%)**: Calculated from internships, societies, and exposure
- **Composite Score**: Weighted combination with real-time updates
- **Star Rating**: 1-5 stars based on composite performance thresholds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Klaus073/Student-Ranking.git
   cd Student-Ranking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key

4. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Database Setup**
   Run the SQL migrations in your Supabase dashboard:
   ```sql
   -- Create tables for profiles, internships, society_roles, universities
   -- (Full schema available in docs)
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                 # Authentication pages
│   ├── dashboard/              # Main dashboard components
│   ├── analytics/              # Rankings and analytics
│   ├── trends/                 # Trends and insights
│   ├── api/                    # API routes
│   └── _components/            # Shared components
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── auth/                   # Authentication components
├── lib/
│   ├── supabase/               # Supabase configuration
│   ├── cfg.ts                  # Configuration constants
│   ├── types.ts                # TypeScript definitions
│   └── scoreUtils.ts           # Score calculation logic
```

## 🎯 Roadmap

- [ ] Complete Analytics page implementation
- [ ] Add Trends page with interactive charts
- [ ] Implement real database integration
- [ ] Add profile editing functionality
- [ ] Create admin dashboard
- [ ] Add export functionality for rankings
- [ ] Implement notification system
- [ ] Add mobile app support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Klaus073**
- GitHub: [@Klaus073](https://github.com/Klaus073)
- Email: nomirao1254@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Supabase](https://supabase.com) for backend and authentication
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

---

<p align="center">Made with ❤️ for student success</p>
