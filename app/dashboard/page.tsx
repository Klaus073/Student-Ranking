import UserSummary from "./UserSummary";
import ProfileForm from "./ProfileForm";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Left side (2/3) */}
          <div className="lg:col-span-2">
            <UserSummary />
          </div>
          
          {/* Sidebar - Right side (1/3) */}
          <div className="lg:col-span-1">
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
} 