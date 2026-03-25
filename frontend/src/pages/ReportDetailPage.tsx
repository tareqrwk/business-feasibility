import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { reportsApi } from '../services/api';
import { Report, FeasibilityReport } from '../types';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const { toPDF, targetRef: pdfRef } = usePDF({ filename: `feasibility-report-${id}.pdf` });

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await reportsApi.getReport(id);
      setReport(data);
    } catch (err) {
      setError('Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-100';
    if (score >= 70) return 'text-green-700 bg-green-100';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The report you are looking for does not exist.'}</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const data = report.processed_report as FeasibilityReport;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard">
          <Button variant="secondary">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Button onClick={() => toPDF()} className="flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </Button>
      </div>

      <div ref={pdfRef}>
        {/* Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.business_idea}</h1>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {report.location && (
                  <span className="bg-gray-100 px-2 py-1 rounded">{report.location}</span>
                )}
                {report.business_type && (
                  <span className="bg-gray-100 px-2 py-1 rounded">{report.business_type}</span>
                )}
                {report.budget_range && (
                  <span className="bg-gray-100 px-2 py-1 rounded">{report.budget_range}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Generated on {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${getScoreColor(report.feasibility_score)}`}>
              <div className="text-center">
                <div className="text-3xl font-bold">{report.feasibility_score || 'N/A'}</div>
                <div className="text-sm font-medium">
                  {data?.feasibility_rating || 'Feasibility Score'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        {data?.summary && (
          <Card className="mb-6" title="Executive Summary">
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </Card>
        )}

        {/* Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <Card className="mb-6" title="Key Recommendations">
            <ul className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Startup Costs */}
          {data?.startup_costs && (
            <Card title="Startup Costs">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estimated Range</h4>
                  <div className="flex justify-between items-center bg-primary-50 p-3 rounded-lg">
                    <span className="text-primary-700 font-medium">Low</span>
                    <span className="text-xl font-bold text-primary-900">
                      {formatCurrency(data.startup_costs.total_range.low)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-primary-50 p-3 rounded-lg mt-2">
                    <span className="text-primary-700 font-medium">High</span>
                    <span className="text-xl font-bold text-primary-900">
                      {formatCurrency(data.startup_costs.total_range.high)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(data.startup_costs.equipment || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{formatCurrency(value)}</span>
                      </div>
                    ))}
                    {Object.entries(data.startup_costs.setup_costs || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Operating Costs */}
          {data?.operating_costs && (
            <Card title="Monthly Operating Costs">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rent</span>
                  <span className="font-medium">{formatCurrency(data.operating_costs.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor</span>
                  <span className="font-medium">{formatCurrency(data.operating_costs.labor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Software/Tools</span>
                  <span className="font-medium">{formatCurrency(data.operating_costs.software_tools)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilities</span>
                  <span className="font-medium">{formatCurrency(data.operating_costs.utilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miscellaneous</span>
                  <span className="font-medium">{formatCurrency(data.operating_costs.misc_overhead)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Monthly</span>
                  <span className="text-primary-600">{formatCurrency(data.operating_costs.total_monthly)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Competitor Analysis */}
          {data?.competitor_analysis && (
            <Card title="Competitor Analysis">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Market Saturation</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.competitor_analysis.market_saturation === 'low'
                      ? 'bg-green-100 text-green-700'
                      : data.competitor_analysis.market_saturation === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.competitor_analysis.market_saturation.charAt(0).toUpperCase() +
                     data.competitor_analysis.market_saturation.slice(1)}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Competitor Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.competitor_analysis.competitor_types.map((type, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Differentiation Suggestions</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {data.competitor_analysis.differentiation_suggestions.map((sug, index) => (
                      <li key={index}>• {sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Profitability */}
          {data?.profitability && (
            <Card title="Profitability Analysis">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estimated Monthly Revenue</h4>
                  <div className="flex justify-between text-sm">
                    <span>Low: {formatCurrency(data.profitability.estimated_monthly_revenue.low)}</span>
                    <span>High: {formatCurrency(data.profitability.estimated_monthly_revenue.high)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Break-even Time</span>
                  <span className="font-medium">{data.profitability.break_even_months} months</span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Profit Margin Potential</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.profitability.profit_margin_potential === 'high'
                      ? 'bg-green-100 text-green-700'
                      : data.profitability.profit_margin_potential === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.profitability.profit_margin_potential.charAt(0).toUpperCase() +
                     data.profitability.profit_margin_potential.slice(1)}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Location Analysis */}
        {data?.location_analysis && (
          <Card className="mt-6" title="Location Analysis">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ideal Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {data.location_analysis.ideal_locations.map((loc, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Competition Density</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.location_analysis.competition_density === 'low'
                    ? 'bg-green-100 text-green-700'
                    : data.location_analysis.competition_density === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {data.location_analysis.competition_density}
                </span>
              </div>
            </div>
            {data.location_analysis.foot_traffic_considerations && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Foot Traffic Considerations</h4>
                <p className="text-gray-600">{data.location_analysis.foot_traffic_considerations}</p>
              </div>
            )}
          </Card>
        )}

        {/* Skill Analysis */}
        {data?.skill_analysis && (
          <Card className="mt-6" title="Skills & Staffing">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <ul className="space-y-1 text-sm">
                  {data.skill_analysis.required_skills.map((skill, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Staffing Needs</h4>
                <ul className="space-y-1 text-sm">
                  {data.skill_analysis.staffing_needs.map((role, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Training Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {data.skill_analysis.training_recommendations.map((training, index) => (
                    <li key={index}>• {training}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Legal Analysis */}
        {data?.legal_analysis && (
          <Card className="mt-6" title="Legal & Regulatory">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Licenses</h4>
                <ul className="space-y-1 text-sm">
                  {data.legal_analysis.required_licenses.map((license, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {license}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Regulatory Considerations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {data.legal_analysis.regulatory_considerations.map((consideration, index) => (
                    <li key={index}>• {consideration}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <span className="text-gray-700">Estimated Annual Compliance Costs: </span>
              <span className="font-bold text-amber-700">{formatCurrency(data.legal_analysis.compliance_costs)}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}