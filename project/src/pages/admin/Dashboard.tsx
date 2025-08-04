import { useState, useEffect } from 'react';
import { TrendingUp, Users, Gift, Award, DollarSign, Megaphone, Percent, List } from 'lucide-react';
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
  List
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
        borderWidth: 1
      }
    ]
  };

  const transactionsByTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Transaction Points by Type' }
    },
    scales: {
      x: { title: { display: true, text: 'Transaction Type' } },
      y: { title: { display: true, text: 'Points' }, beginAtZero: true }
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
      legend: { position: 'right' as const },
      title: { display: true, text: 'Customer Segment Distribution' }
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
        borderWidth: 1
      }
    ]
  };

  const campaignEngagementOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Participants by Campaign' }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 45
        },
        title: { display: true, text: 'Campaign' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Participants' }
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
      },
      {
        label: 'Points Redeemed',
        data: chartsData.pointsActivity.redeemed,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  };

  const pointsActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Points Activity (All Historical Data)' }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Points' },
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
      legend: { position: 'right' as const },
      title: { display: true, text: 'Tier Distribution' }
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
      legend: { position: 'top' as const },
      title: { display: true, text: 'Reward Popularity' }
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
      legend: { position: 'top' as const },
      title: { display: true, text: 'Campaign Participation Over Time' }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45
        },
        title: { display: true, text: 'Month' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Participants' },
        stacked: true
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
        borderWidth: 1
      }
    ]
  };

  const customerEngagementByTierOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Customer Engagement by Tier' }
    },
    scales: {
      x: {
        title: { display: true, text: 'Tier' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Average Points Earned' }
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
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h1>
        <p className="text-gray-600">Monitor your loyalty program performance and AI-powered insights</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = icons[kpi.icon];
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{kpi.value}</h3>
                  <p className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} {kpi.trend === 'up' ? '↑' : '↓'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(kpi.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Transaction Points by Type</h3>
            {chartsData.transactionsByType.labels.length > 0 && chartsData.transactionsByType.data.length > 0 ? (
              <Bar data={transactionsByTypeData} options={transactionsByTypeOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Customer Segment Distribution</h3>
            {chartsData.customerSegments.labels.length > 0 && chartsData.customerSegments.data.length > 0 ? (
              <Pie data={customerSegmentsData} options={customerSegmentsOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Participants by Campaign</h3>
            {chartsData.campaignEngagement.labels.length > 0 && chartsData.campaignEngagement.data.length > 0 ? (
              <Bar data={campaignEngagementData} options={campaignEngagementOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Points Activity (All Historical Data)</h3>
            {chartsData.pointsActivity.labels.length > 0 &&
            chartsData.pointsActivity.earned.length > 0 &&
            chartsData.pointsActivity.redeemed.length > 0 ? (
              <Bar data={pointsActivityData} options={pointsActivityOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Tier Distribution</h3>
            {chartsData.tierDistribution.labels.length > 0 && chartsData.tierDistribution.data.length > 0 ? (
              <Doughnut data={tierDistributionData} options={tierDistributionOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Reward Popularity</h3>
            {chartsData.rewardPopularity.length > 0 ? (
              <Radar data={rewardPopularityData} options={rewardPopularityOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Campaign Participation Over Time</h3>
            {chartsData.campaignParticipationOverTime.labels.length > 0 &&
            chartsData.campaignParticipationOverTime.datasets.length > 0 ? (
              <Bar data={campaignParticipationOverTimeData} options={campaignParticipationOverTimeOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Customer Engagement by Tier</h3>
            {chartsData.customerEngagementByTier.labels.length > 0 && chartsData.customerEngagementByTier.data.length > 0 ? (
              <Bar data={customerEngagementByTierData} options={customerEngagementByTierOptions} />
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold mb-4">Top Rewards</h3>
        {topRewards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Reward</th>
                  <th scope="col" className="px-6 py-3">Redemptions</th>
                  <th scope="col" className="px-6 py-3">Points Cost</th>
                </tr>
              </thead>
              <tbody>
                {topRewards.map((reward, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-6 py-4">{reward.name}</td>
                    <td className="px-6 py-4">{reward.redemptions}</td>
                    <td className="px-6 py-4">{reward.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No reward data available</p>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold mb-4">Customer Recommendations</h3>
        {customerRecommendations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Tier</th>
                  <th scope="col" className="px-6 py-3">CLV</th>
                  <th scope="col" className="px-6 py-3">Predicted CLV</th>
                  <th scope="col" className="px-6 py-3">Recommended Reward</th>
                  <th scope="col" className="px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {customerRecommendations.map((rec, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-6 py-4">{rec.customer}</td>
                    <td className="px-6 py-4">{rec.tier}</td>
                    <td className="px-6 py-4">{rec.clv}</td>
                    <td className="px-6 py-4">{rec.predictedClv}</td>
                    <td className="px-6 py-4">{rec.recommendedReward}</td>
                    <td className="px-6 py-4">{rec.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recommendations available</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiInsights.map((insight, index) => {
          const Icon = icons[insight.icon];
          return (
            <div key={index} className={`bg-${insight.bgColor} p-6 rounded-lg shadow-sm border border-${insight.borderColor}`}>
              <div className="flex items-center mb-4">
                <Icon className={`h-6 w-6 text-${insight.color} mr-2`} />
                <h3 className={`text-lg font-semibold text-${insight.color}`}>{insight.title}</h3>
              </div>
              <p className="text-gray-600">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;