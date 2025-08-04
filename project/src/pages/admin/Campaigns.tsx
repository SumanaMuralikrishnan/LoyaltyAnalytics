import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Pause, BarChart3, Calendar, Target, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Campaign {
  error: string;
  id: string;
  name: string;
  type: 'points_multiplier' | 'tier_promotion' | 'referral' | 'birthday';
  status: 'active' | 'paused' | 'scheduled' | 'ended';
  startDate: string;
  endDate: string;
  rules: {
    multiplier?: number;
    categories?: string[];
    minSpend?: number;
    targetTier?: string;
    bonusPoints?: number;
    timeLimit?: number;
    referrerBonus?: number;
    refereeBonus?: number;
    maxReferrals?: number;
    bonusMultiplier?: number;
    extraPoints?: number;
    freeShipping?: boolean;
  };
  participants: number;
  pointsIssued: number;
  revenue: number;
}

interface User {
  id: string;
  role?: string;
}

const Campaigns = () => {
  const { user, isLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    type: 'points_multiplier',
    status: 'scheduled',
    startDate: '',
    endDate: '',
    rules: {},
  });
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user || isLoading) {
        console.warn('Campaigns: No user or still loading, skipping fetch');
        setError('User not authenticated');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
          headers: { 'X-User-ID': user.id },
        });
        const data: Campaign[] = await response.json();
        if (response.status !== 200 || (data as any).error) {
          throw new Error((data as any).error || `HTTP ${response.status}`);
        }
        console.log('Fetched campaigns:', data);
        setCampaigns(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Campaigns fetch error:', errorMessage);
        setError(errorMessage);
      }
    };

    if (!isLoading) {
      fetchCampaigns();
    }
  }, [user, isLoading]);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'points_multiplier':
        return Target;
      case 'tier_promotion':
        return BarChart3;
      case 'referral':
        return Users;
      case 'birthday':
        return Calendar;
      default:
        return Target;
    }
  };

  const toggleCampaignStatus = async (id: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign) return;
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.status !== 200 || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Toggle campaign status error:', errorMessage);
      setError(errorMessage);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': user.id },
      });
      const data = await response.json();
      if (response.status !== 200 || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Delete campaign error:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleCreateOrUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      const url = editingCampaign
        ? `${API_BASE_URL}/campaigns/${editingCampaign.id}`
        : `${API_BASE_URL}/campaigns`;
      const method = editingCampaign ? 'PATCH' : 'POST';
      const body = editingCampaign
        ? { status: newCampaign.status }
        : newCampaign;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        body: JSON.stringify(body),
      });
      const data: Campaign = await response.json();
      if (response.status !== (editingCampaign ? 200 : 201) || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      setCampaigns((prev) =>
        editingCampaign
          ? prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
          : [...prev, data]
      );
      setShowCreateModal(false);
      setNewCampaign({
        name: '',
        type: 'points_multiplier',
        status: 'scheduled',
        startDate: '',
        endDate: '',
        rules: {},
      });
      setEditingCampaign(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Create/Update campaign error:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewCampaign((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRulesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewCampaign((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [name]: type === 'checkbox' ? checked : parseFloat(value) || value,
      },
    }));
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      rules: campaign.rules,
    });
    setShowCreateModal(true);
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
          <p className="text-gray-600">Create and manage loyalty program campaigns</p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setNewCampaign({
              name: '',
              type: 'points_multiplier',
              status: 'scheduled',
              startDate: '',
              endDate: '',
              rules: {},
            });
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {campaigns.filter((c) => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {campaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {campaigns.reduce((sum, c) => sum + c.pointsIssued, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Points Issued</div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Revenue Impact</div>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {campaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type);
            return (
              <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <TypeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>
                          {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.participants.toLocaleString()} participants
                      </div>
                      <div className="text-sm text-gray-600">
                        {campaign.pointsIssued.toLocaleString()} points issued
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title={campaign.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                      >
                        {campaign.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditCampaign(campaign)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit campaign"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campaign Rules Preview */}
                <div className="mt-4 ml-16">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700">
                      <strong>Rules:</strong>
                      {campaign.type === 'points_multiplier' && (
                        <span>
                          {' '}
                          {campaign.rules.multiplier}x points on{' '}
                          {campaign.rules.categories?.join(', ')} (min. $
                          {campaign.rules.minSpend})
                        </span>
                      )}
                      {campaign.type === 'tier_promotion' && (
                        <span>
                          {' '}
                          {campaign.rules.bonusPoints} bonus points for reaching{' '}
                          {campaign.rules.targetTier} tier within {campaign.rules.timeLimit}{' '}
                          days
                        </span>
                      )}
                      {campaign.type === 'referral' && (
                        <span>
                          {' '}
                          {campaign.rules.referrerBonus} pts for referrer,{' '}
                          {campaign.rules.refereeBonus} pts for referee (max{' '}
                          {campaign.rules.maxReferrals} referrals)
                        </span>
                      )}
                      {campaign.type === 'birthday' && (
                        <span>
                          {' '}
                          {campaign.rules.bonusMultiplier}x points +{' '}
                          {campaign.rules.extraPoints} bonus points during birthday month
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first campaign to start engaging customers</p>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setNewCampaign({
                  name: '',
                  type: 'points_multiplier',
                  status: 'scheduled',
                  startDate: '',
                  endDate: '',
                  rules: {},
                });
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <form onSubmit={handleCreateOrUpdateCampaign}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newCampaign.name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!!editingCampaign}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={newCampaign.type || 'points_multiplier'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!!editingCampaign}
                  >
                    <option value="points_multiplier">Points Multiplier</option>
                    <option value="tier_promotion">Tier Promotion</option>
                    <option value="referral">Referral</option>
                    <option value="birthday">Birthday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={newCampaign.status || 'scheduled'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={newCampaign.startDate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!!editingCampaign}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={newCampaign.endDate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!!editingCampaign}
                  />
                </div>
                {newCampaign.type === 'points_multiplier' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Multiplier</label>
                      <input
                        type="number"
                        name="multiplier"
                        value={newCampaign.rules?.multiplier || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categories (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="categories"
                        value={newCampaign.rules?.categories?.join(', ') || ''}
                        onChange={(e) =>
                          setNewCampaign((prev) => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              categories: e.target.value.split(',').map((s) => s.trim()),
                            },
                          }))
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Spend</label>
                      <input
                        type="number"
                        name="minSpend"
                        value={newCampaign.rules?.minSpend || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                  </div>
                )}
                {newCampaign.type === 'tier_promotion' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Tier</label>
                      <input
                        type="text"
                        name="targetTier"
                        value={newCampaign.rules?.targetTier || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bonus Points</label>
                      <input
                        type="number"
                        name="bonusPoints"
                        value={newCampaign.rules?.bonusPoints || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Time Limit (days)
                      </label>
                      <input
                        type="number"
                        name="timeLimit"
                        value={newCampaign.rules?.timeLimit || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                  </div>
                )}
                {newCampaign.type === 'referral' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referrer Bonus</label>
                      <input
                        type="number"
                        name="referrerBonus"
                        value={newCampaign.rules?.referrerBonus || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referee Bonus</label>
                      <input
                        type="number"
                        name="refereeBonus"
                        value={newCampaign.rules?.refereeBonus || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Referrals</label>
                      <input
                        type="number"
                        name="maxReferrals"
                        value={newCampaign.rules?.maxReferrals || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                  </div>
                )}
                {newCampaign.type === 'birthday' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bonus Multiplier</label>
                      <input
                        type="number"
                        name="bonusMultiplier"
                        value={newCampaign.rules?.bonusMultiplier || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Extra Points</label>
                      <input
                        type="number"
                        name="extraPoints"
                        value={newCampaign.rules?.extraPoints || ''}
                        onChange={handleRulesChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                        disabled={!!editingCampaign}
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="freeShipping"
                          checked={newCampaign.rules?.freeShipping || false}
                          onChange={handleRulesChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!!editingCampaign}
                        />
                        <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCampaign(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700"
                >
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Optimization Suggestions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Campaign Optimization</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Recommended: Electronics Boost</h4>
            <p className="text-sm text-gray-600 mb-3">
              AI suggests 1.5x points on electronics based on customer purchase patterns and inventory levels.
            </p>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setNewCampaign({
                  name: 'Electronics Boost',
                  type: 'points_multiplier',
                  status: 'scheduled',
                  startDate: new Date().toISOString().slice(0, 16),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16),
                  rules: { multiplier: 1.5, categories: ['electronics'], minSpend: 50 },
                });
                setShowCreateModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create Campaign →
            </button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Optimize: Referral Program</h4>
            <p className="text-sm text-gray-600 mb-3">
              Increase referral bonus to 250 points to improve conversion rate by estimated 23%.
            </p>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setNewCampaign({
                  name: 'Referral Program Optimization',
                  type: 'referral',
                  status: 'scheduled',
                  startDate: new Date().toISOString().slice(0, 16),
                  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16),
                  rules: { referrerBonus: 250, refereeBonus: 200, maxReferrals: 10 },
                });
                setShowCreateModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Apply Suggestion →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;