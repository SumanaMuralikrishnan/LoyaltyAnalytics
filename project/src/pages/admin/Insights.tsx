import { useState, useEffect } from 'react';
import { Users, Filter, Download, Search, Eye } from 'lucide-react';

// Define interfaces for segment and customer data
interface Segment {
  id: string;
  name: string;
  count: number;
  description: string;
  avgSpend: number;
  avgPoints: number;
  retentionRate: number;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  tier: string;
  points: number;
  spend: number;
  lastActivity: string;
  segment: string;
  churnRisk: number;
}

const Insights = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded AI insights
  const aiInsights = [
    {
      title: 'Segment Growth',
      description: 'High-value segment grew 23% this quarter. Tier upgrade campaigns are driving results.',
      status: '↗ +23% growth',
      statusColor: 'text-green-600'
    },
    {
      title: 'Churn Prevention',
      description: '247 customers at high churn risk. Recommend targeted retention offers.',
      status: '⚠ Action needed',
      statusColor: 'text-red-600'
    },
    {
      title: 'Tier Optimization',
      description: '567 customers close to tier upgrade. Personalized challenges could accelerate progression.',
      status: '💡 Opportunity',
      statusColor: 'text-blue-600'
    }
  ];

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch segments
        const segmentsResponse = await fetch('https://loyaltyanalytics.onrender.com/dashboard/segments');
        if (!segmentsResponse.ok) throw new Error('Failed to fetch segments');
        const segmentsData: Segment[] = await segmentsResponse.json();
        setSegments(segmentsData);

        // Fetch customers
        const customersResponse = await fetch('https://loyaltyanalytics.onrender.com/dashboard/customers');
        if (!customersResponse.ok) throw new Error('Failed to fetch customers');
        const customersData: Customer[] = await customersResponse.json();
        setCustomers(customersData);

        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSegmentColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return 'text-amber-600 bg-amber-100';
      case 'Silver':
        return 'text-gray-600 bg-gray-100';
      case 'Gold':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-600 bg-green-100';
    if (risk < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSegment && matchesSearch;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Insights</h1>
          <p className="text-gray-600">AI-powered customer segmentation and analytics</p>
        </div>
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Segments Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all ${
              selectedSegment === segment.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => setSelectedSegment(segment.id)}
          >
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getSegmentColor(
                segment.color
              )}`}
            >
              {segment.name}
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-1">{segment.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mb-4">{segment.description}</div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Spend:</span>
                <span className="font-medium">${segment.avgSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Points:</span>
                <span className="font-medium">{segment.avgPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retention:</span>
                <span
                  className={`font-medium ${
                    segment.retentionRate > 80
                      ? 'text-green-600'
                      : segment.retentionRate > 50
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {segment.retentionRate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedSegment('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSegment === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Customers
              </button>
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSegment === segment.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {segment.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedSegment === 'all'
              ? 'All Customers'
              : segments.find((s) => s.id === selectedSegment)?.name}
            <span className="text-gray-500 font-normal ml-2">({filteredCustomers.length} customers)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Churn Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.spend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(customer.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(
                        customer.churnRisk
                      )}`}
                    >
                      {customer.churnRisk}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                        Send Offer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              <div className={`text-xs font-medium ${insight.statusColor}`}>
                {insight.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
