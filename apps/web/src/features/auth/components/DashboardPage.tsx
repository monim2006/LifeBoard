import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Welcome back">
          <p className="text-sm text-slate-600">
            {user
              ? `Hi ${user.username}, your LifeBoard workspace is ready. Use the links below to manage your planning, finances, and analytics.`
              : 'Sign in to start managing your weekly plan and expenses.'}
          </p>
        </Card>
        <Card title="Quick links">
          <div className="space-y-3">
            <Link to="/planner">
              <Button variant="secondary" className="w-full justify-start">
                Open planner
              </Button>
            </Link>
            <Link to="/expenses">
              <Button variant="secondary" className="w-full justify-start">
                Track expenses
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="secondary" className="w-full justify-start">
                View analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
