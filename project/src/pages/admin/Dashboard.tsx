import { useState, useEffect } from 'react';
import { TrendingUp, Users, Gift, Award, DollarSign, Megaphone, Percent, List, BarChart3, Target, Calendar, ShoppingBag } from 'lucide-react';
import { Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
} from 'chart.js';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

// Define interfaces
interface IconMap {
  Users: LucideIcon;
  TrendingUp: LucideIcon;
  Award: LucideIcon;
  Gift: LucideIcon;
  DollarSign: LucideIcon;
  Megaphone: LucideIcon;
  Percent: LucideIcon;
  List: LucideIcon;
  BarChart3: LucideIcon;
  Target: LucideIcon;
  Calendar: LucideIcon;
  ShoppingBag: LucideIcon;
}

interface Kpi {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: keyof IconMap;
  color: string;
}

interface ChartData {
  transactionsByType: { labels: string[]; data: number[] };
  customerSegments: { labels: string[]; data: number[]; colors: string[] };
  tierDistribution: { labels: string[]; data: number[] };
  pointsActivity: { labels: string[]; earned: number[]; redeemed: number[] };
  rewardPopularity: { name: string; score: number }[];
  campaignEngagement: { labels: string[]; data: number[] };
  campaignParticipationOverTime: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number }[] };
  customerEngagementByTier: { labels: string[]; data: number[] };
}

interface TopReward {
  name: string;
  redemptions: number;
  points: number;
}

interface CustomerRecommendation {
  customer: string;
  name: string;
  tier: string;
  clv: string;
  predictedClv: string;
  recommendedReward: string;
  reason: string;
}

interface AiInsight {
  title: string;
  description: string;
  icon: keyof IconMap;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: string;
  points: number;
  amount: number;
  description: string;
  date: string;
  status: string;
}

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

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  rules: object;
  participants: number;
  pointsIssued: number;
  revenue: number;
}

// Icon mapping and AI insights
const icons: IconMap = {
  Users,
  TrendingUp,
  Award,
  Gift,
  DollarSign,
  Megaphone,
  Percent,
  List,
  BarChart3,
  Target,
  Calendar,
  ShoppingBag
};

const aiInsights: AiInsight[] = [
  {
    title: 'Segment Growth',
    description: 'High-Value segment grew by 15% this quarter. Consider targeted campaigns to maintain engagement.',
    icon: 'TrendingUp',
    color: 'blue-600',
    bgColor: 'blue-50',
    borderColor: 'blue-200'
  },
  {
    title: 'Tier Optimization',
    description: 'Recommend increasing Silver tier benefits to accelerate progression from Bronze (current bottleneck affecting 23% of members).',
    icon: 'Award',
    color: 'green-600',
    bgColor: 'green-50',
    borderColor: 'green-200'
  },
  {
    title: 'Reward Insights',
    description: 'Gift cards are 3x more popular than discounts among Gold tier members. Consider expanding premium gift card catalog.',
    icon: 'Gift',
    color: 'purple-600',
    bgColor: 'purple-50',
    borderColor: 'purple-200'
  },
  {
    title: 'Churn Risk Alert',
    description: '247 customers at high churn risk. Recommend targeted retention campaigns with personalized offers.',
    icon: 'Users',
    color: 'orange-600',
    bgColor: 'orange-50',
    borderColor: 'orange-200'
  }
];

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [chartsData, setChartsData] = useState<ChartData>({
    transactionsByType: { labels: ['Birthday', 'Earn', 'Referral', 'Redeem', 'Welcome'], data: [] },
    customerSegments: { labels: [], data: [], colors: [] },
    tierDistribution: { labels: [], data: [] },
    pointsActivity: { labels: [], earned: [], redeemed: [] },
    rewardPopularity: [],
    campaignEngagement: { labels: [], data: [] },
    campaignParticipationOverTime: { labels: [], datasets: [] },
    customerEngagementByTier: { labels: [], data: [] }
  });
  const [topRewards, setTopRewards] = useState<TopReward[]>([]);
  const [customerRecommendations, setCustomerRecommendations] = useState<CustomerRecommendation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      if (!user || isLoading) {
        console.warn('Dashboard: No user or still loading, skipping fetch');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = { 'X-User-ID': user.id }; // Use user.id (e.g., 'admin-1')

        console.log('Dashboard: Fetching data with user ID:', user.id);

        // Fetch KPIs
        const kpisResponse = await fetch(`${API_BASE_URL}/dashboard/kpis`, { headers });
        if (!kpisResponse.ok) {
          throw new Error(`Failed to fetch KPIs: HTTP ${kpisResponse.status}${kpisResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const kpisData = await kpisResponse.json();
        console.log('KPIs Data:', kpisData);
        setKpis(kpisData);

        // Fetch Campaigns
        const campaignsResponse = await fetch(`${API_BASE_URL}/campaigns`, { headers });
        if (!campaignsResponse.ok) {
          throw new Error(`Failed to fetch campaigns: HTTP ${campaignsResponse.status}${campaignsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData);

        // Fetch Promotions
        const promotionsResponse = await fetch(`${API_BASE_URL}/promotions`, { headers });
        if (!promotionsResponse.ok) {
          throw new Error(`Failed to fetch promotions: HTTP ${promotionsResponse.status}${promotionsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        await promotionsResponse.json();

        // Fetch Top Rewards
        const topRewardsResponse = await fetch(`${API_BASE_URL}/dashboard/top-rewards`, { headers });
        if (!topRewardsResponse.ok) {
          throw new Error(`Failed to fetch top rewards: HTTP ${topRewardsResponse.status}${topRewardsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const topRewardsData = await topRewardsResponse.json();
        setTopRewards(topRewardsData);

        // Fetch Recommendations
        const recommendationsResponse = await fetch(`${API_BASE_URL}/dashboard/recommendations`, { headers });
        if (!recommendationsResponse.ok) {
          throw new Error(`Failed to fetch recommendations: HTTP ${recommendationsResponse.status}${recommendationsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const recommendationsData = await recommendationsResponse.json();
        setCustomerRecommendations(recommendationsData);

        // Fetch Transactions
        const transactionsResponse = await fetch(`${API_BASE_URL}/transactions?search=&type=all&date_range=1825`, { headers });
        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch transactions: HTTP ${transactionsResponse.status}${transactionsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const transactionsData = await transactionsResponse.json();
        if (!transactionsData.transactions || !Array.isArray(transactionsData.transactions)) {
          throw new Error('Invalid transactions data');
        }
        setTransactions(transactionsData.transactions);

        // Fetch Segments
        const segmentsResponse = await fetch(`${API_BASE_URL}/dashboard/segments`, { headers });
        if (!segmentsResponse.ok) {
          throw new Error(`Failed to fetch segments: HTTP ${segmentsResponse.status}${segmentsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const segmentsData = await segmentsResponse.json();
        setSegments(segmentsData);

        // Fetch Charts
        const chartsResponse = await fetch(`${API_BASE_URL}/dashboard/charts/`, { headers });
        if (!chartsResponse.ok) {
          throw new Error(`Failed to fetch charts: HTTP ${chartsResponse.status}${chartsResponse.status === 401 ? ' (Unauthorized)' : ''}`);
        }
        const rawChartsData = await chartsResponse.json();
        console.log('Raw Charts Data:', rawChartsData);

        // Points Activity
        const labels = rawChartsData.pointsActivity?.labels || [];
        const earnedValues = rawChartsData.pointsActivity?.earned || [];
        const redeemedValues = rawChartsData.pointsActivity?.redeemed || [];
        if (labels.length === 0 || earnedValues.length === 0 || redeemedValues.length === 0 || labels.length !== earnedValues.length || labels.length !== redeemedValues.length) {
          console.warn('Points Activity data is invalid:', { labels, earnedValues, redeemedValues });
        }

        // Tier Distribution and Reward Popularity
        const tierLabels = rawChartsData.tierDistribution?.labels || [];
        const tierData = rawChartsData.tierDistribution?.data || [];
        const rewardPopularity = rawChartsData.rewardPopularity || [];

        // Customer Segments
        const segmentLabels = segmentsData.map((s: Segment) => s.name);
        const segmentData = segmentsData.map((s: Segment) => s.count);
        const segmentColors = segmentsData.map((s: Segment) => {
          switch (s.color) {
            case 'green': return '#34D399';
            case 'red': return '#EF4444';
            case 'blue': return '#3B82F6';
            case 'purple': return '#A855F7';
            default: return '#6B7280';
          }
        });

        // Campaign Engagement
        const campaignLabels = rawChartsData.campaignEngagement?.labels || [];
        const campaignData = rawChartsData.campaignEngagement?.data || [];

        // Campaign Participation Over Time
        const participationLabels = rawChartsData.campaignParticipationOverTime?.labels || [];
        const participationDatasets = rawChartsData.campaignParticipationOverTime?.datasets || [];

        // Customer Engagement by Tier
        const engagementLabels = rawChartsData.customerEngagementByTier?.labels || [];
        const engagementData = rawChartsData.customerEngagementByTier?.data || [];

        // Transaction Points by Type
        const transactionTypes = ['Birthday', 'Earn', 'Referral', 'Redeem', 'Welcome'];
        const pointsByType = transactionTypes.map(type =>
          transactionsData.transactions
            .filter((t: Transaction) => t.type.toLowerCase() === type.toLowerCase())
            .reduce((sum: number, t: Transaction) => sum + Math.abs(t.points || 0), 0)
        );

        console.log('Transaction Types Data:', { transactionTypes, pointsByType });

        setChartsData({
          transactionsByType: { labels: transactionTypes, data: pointsByType },
          customerSegments: { labels: segmentLabels, data: segmentData, colors: segmentColors },
          tierDistribution: { labels: tierLabels, data: tierData },
          pointsActivity: { labels, earned: earnedValues, redeemed: redeemedValues },
          rewardPopularity,
          campaignEngagement: { labels: campaignLabels, data: campaignData },
          campaignParticipationOverTime: { labels: participationLabels, datasets: participationDatasets },
          customerEngagementByTier: { labels: engagementLabels, data: engagementData }
        });

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Dashboard: Fetch error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [user, isLoading]);

  // Transaction Points by Type chart
  const transactionsByTypeData = {
    labels: chartsData.transactionsByType.labels,
    datasets: [
      {
        label: 'Points',
        data: chartsData.transactionsByType.data,
        backgroundColor: ['#34D399', '#EF4444', '#3B82F6', '#A855F7', '#F59E0B'],
        borderColor: ['#10B981', '#DC2626', '#2563EB', '#9333EA', '#D97706'],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const transactionsByTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: { 
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      }
    }
  };

  // Customer Segments chart
  const customerSegmentsData = {
    labels: chartsData.customerSegments.labels,
    datasets: [
      {
        data: chartsData.customerSegments.data,
        backgroundColor: chartsData.customerSegments.colors,
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const customerSegmentsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: { font: { size: 12 } }
      },
      title: { display: false }
    }
  };

  // Campaign Engagement chart
  const campaignEngagementData = {
    labels: chartsData.campaignEngagement.labels,
    datasets: [
      {
        label: 'Participants',
        data: chartsData.campaignEngagement.data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const campaignEngagementOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 12 }
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      }
    }
  };

  // Points Activity chart
  const pointsActivityData = {
    labels: chartsData.pointsActivity.labels,
    datasets: [
      {
        label: 'Points Earned',
        data: chartsData.pointsActivity.earned,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Points Redeemed',
        data: chartsData.pointsActivity.redeemed,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pointsActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: { font: { size: 12 } }
      },
      title: { display: false }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 12 }
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      },
    },
  };

  // Tier Distribution chart
  const tierDistributionData = {
    labels: chartsData.tierDistribution.labels,
    datasets: [
      {
        data: chartsData.tierDistribution.data,
        backgroundColor: ['#CD7F32', '#C0C0C0', '#FFD700'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const tierDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: { font: { size: 12 } }
      },
      title: { display: false }
    }
  };

  // Reward Popularity chart
  const rewardPopularityData = {
    labels: chartsData.rewardPopularity.map(r => r.name),
    datasets: [
      {
        label: 'Popularity Score',
        data: chartsData.rewardPopularity.map(r => r.score),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const rewardPopularityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  };

  // Campaign Participation Over Time chart
  const campaignParticipationOverTimeData = {
    labels: chartsData.campaignParticipationOverTime.labels,
    datasets: chartsData.campaignParticipationOverTime.datasets
  };

  const campaignParticipationOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: { font: { size: 12 } }
      },
      title: { display: false }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 12 }
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      }
    }
  };

  // Customer Engagement by Tier chart
  const customerEngagementByTierData = {
    labels: chartsData.customerEngagementByTier.labels,
    datasets: [
      {
        label: 'Average Points Earned',
        data: chartsData.customerEngagementByTier.data,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const customerEngagementByTierOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      }
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      case 'teal': return 'bg-teal-100 text-teal-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      case 'cyan': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h1>
        <p className="text-gray-600">Monitor your loyalty program performance and AI-powered insights</p>
      </div>

      {/* 12 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = icons[kpi.icon];
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</h3>
                  <p className={`text-sm font-medium flex items-center ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {kpi.trend === 'up' ? '↗' : '↘'}
                    </span>
                    {kpi.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${getColorClasses(kpi.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Points by Type</h3>
          <div style={{ height: '300px' }}>
            {chartsData.transactionsByType.labels.length > 0 && chartsData.transactionsByType.data.length > 0 ? (
              <Bar data={transactionsByTypeData} options={transactionsByTypeOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segment Distribution</h3>
          <div style={{ height: '300px' }}>
            {chartsData.customerSegments.labels.length > 0 && chartsData.customerSegments.data.length > 0 ? (
              <Pie data={customerSegmentsData} options={customerSegmentsOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Participation</h3>
          <div style={{ height: '300px' }}>
            {chartsData.campaignEngagement.labels.length > 0 && chartsData.campaignEngagement.data.length > 0 ? (
              <Bar data={campaignEngagementData} options={campaignEngagementOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Points Activity</h3>
          <div style={{ height: '300px' }}>
            {chartsData.pointsActivity.labels.length > 0 &&
            chartsData.pointsActivity.earned.length > 0 &&
            chartsData.pointsActivity.redeemed.length > 0 ? (
              <Bar data={pointsActivityData} options={pointsActivityOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tier Distribution</h3>
          <div style={{ height: '300px' }}>
            {chartsData.tierDistribution.labels.length > 0 && chartsData.tierDistribution.data.length > 0 ? (
              <Doughnut data={tierDistributionData} options={tierDistributionOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Reward Popularity</h3>
          <div style={{ height: '300px' }}>
            {chartsData.rewardPopularity.length > 0 ? (
              <Radar data={rewardPopularityData} options={rewardPopularityOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Participation Over Time</h3>
          <div style={{ height: '300px' }}>
            {chartsData.campaignParticipationOverTime.labels.length > 0 &&
            chartsData.campaignParticipationOverTime.datasets.length > 0 ? (
              <Bar data={campaignParticipationOverTimeData} options={campaignParticipationOverTimeOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Engagement by Tier</h3>
          <div style={{ height: '300px' }}>
            {chartsData.customerEngagementByTier.labels.length > 0 && chartsData.customerEngagementByTier.data.length > 0 ? (
              <Bar data={customerEngagementByTierData} options={customerEngagementByTierOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Rewards Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Rewards</h3>
        </div>
        {topRewards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redemptions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topRewards.map((reward, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reward.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reward.redemptions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reward.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reward data available</p>
          </div>
        )}
      </div>

      {/* Customer Recommendations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Recommendations</h3>
        </div>
        {customerRecommendations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted CLV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerRecommendations.map((rec, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        rec.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                        rec.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rec.clv}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rec.predictedClv}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rec.recommendedReward}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{rec.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available</p>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiInsights.map((insight, index) => {
          const Icon = icons[insight.icon];
          return (
            <div key={index} className={`bg-${insight.bgColor} rounded-xl p-6 shadow-sm border border-${insight.borderColor}`}>
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg bg-white shadow-sm mr-3`}>
                  <Icon className={`h-5 w-5 text-${insight.color}`} />
                </div>
                <h3 className={`text-lg font-semibold text-${insight.color}`}>{insight.title}</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;