import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, Button, Input, LoadingSpinner } from '../components/ui';
import { reportsApi } from '../services/api';
import { ReportFormData, FollowUpQuestion } from '../types';

export function NewReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'idea' | 'questions' | 'generating'>('idea');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [formData, setFormData] = useState<ReportFormData>({ business_idea: '' });

  const { register, handleSubmit, formState: { errors } } = useForm<ReportFormData>();

  const onIdeaSubmit = async (data: ReportFormData) => {
    setIsLoading(true);
    setError(null);
    setFormData(data);

    try {
      const response = await reportsApi.getQuestions(data);
      setQuestions(response.questions);
      setStep('questions');
    } catch (err: any) {
      setError('Failed to get questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onQuestionsSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setStep('generating');

    try {
      const report = await reportsApi.generateReport(formData);
      navigate(`/reports/${report.id}`);
    } catch (err: any) {
      setError('Failed to generate report. Please try again.');
      setStep('questions');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold text-gray-900 mt-6">Analyzing Your Business Idea</h2>
        <p className="text-gray-600 mt-2">
          Our AI is evaluating your business concept for feasibility, costs, and market potential...
        </p>
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <p>✓ Estimating startup costs</p>
          <p>✓ Analyzing competitors</p>
          <p>✓ Calculating profitability</p>
          <p>✓ Generating recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {step === 'idea' && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Describe Your Business Idea</h1>
            <p className="text-gray-600 mt-2">
              Tell us about your business concept and we'll analyze its feasibility.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Card>
            <form onSubmit={handleSubmit(onIdeaSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Idea *
                </label>
                <textarea
                  {...register('business_idea', {
                    required: 'Please describe your business idea',
                    minLength: { value: 20, message: 'Please provide more details (at least 20 characters)' }
                  })}
                  rows={4}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.business_idea ? 'border-red-500' : ''}`}
                  placeholder="e.g., A small coffee shop near a university campus offering specialty drinks and study spaces"
                />
                {errors.business_idea && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_idea.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location (optional)"
                  placeholder="e.g., San Francisco, CA"
                  {...register('location')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range (optional)
                  </label>
                  <select
                    {...register('budget_range')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $5,000">Under $5,000</option>
                    <option value="$5,000 - $25,000">$5,000 - $25,000</option>
                    <option value="$25,000 - $100,000">$25,000 - $100,000</option>
                    <option value="Over $100,000">Over $100,000</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type (optional)
                  </label>
                  <select
                    {...register('business_type')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="Retail">Retail</option>
                    <option value="Service-based">Service-based</option>
                    <option value="Online/E-commerce">Online/E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Franchise">Franchise</option>
                  </select>
                </div>
                <Input
                  label="Target Customer (optional)"
                  placeholder="e.g., College students"
                  {...register('target_customer')}
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Continue to Analysis
              </Button>
            </form>
          </Card>
        </>
      )}

      {step === 'questions' && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Additional Questions</h1>
            <p className="text-gray-600 mt-2">
              Help us provide a more accurate analysis by answering these questions.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Card>
            <form onSubmit={(e) => { e.preventDefault(); onQuestionsSubmit(); }} className="space-y-6">
              {questions.map((q, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {q.question} {q.required && '*'}
                  </label>
                  {q.options ? (
                    <select
                      value={(formData as any)[q.field_name] || ''}
                      onChange={(e) => updateFormData(q.field_name, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required={q.required}
                    >
                      <option value="">Select an option</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={(formData as any)[q.field_name] || ''}
                      onChange={(e) => updateFormData(q.field_name, e.target.value)}
                      required={q.required}
                    />
                  )}
                </div>
              ))}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('idea')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                  Generate Report
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}