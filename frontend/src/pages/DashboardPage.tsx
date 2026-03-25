import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { reportsApi } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import { Report } from '../types';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportsApi.getReports();
      setReports(response.reports);
    } catch (err: any) {
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportsApi.deleteReport(id);
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete report');
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getRatingLabel = (score?: number) => {
    if (!score) return 'Pending';
    if (score >= 70) return 'Strong';
    if (score >= 40) return 'Moderate';
    return 'High Risk';
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>
        <Link to="/reports/new">
          <Button>New Analysis</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No reports yet</h3>
          <p className="mt-1 text-gray-500">
            Get started by analyzing your first business idea.
          </p>
          <Link to="/reports/new" className="mt-4 inline-block">
            <Button>Create Your First Report</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(report.feasibility_score)}`}>
                  {getRatingLabel(report.feasibility_score)} ({report.feasibility_score || 'N/A'})
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {report.business_idea}
              </h3>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                {report.location && (
                  <p><span className="font-medium">Location:</span> {report.location}</p>
                )}
                {report.business_type && (
                  <p><span className="font-medium">Type:</span> {report.business_type}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Link to={`/reports/${report.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(report.id)}
                  className="px-3"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}