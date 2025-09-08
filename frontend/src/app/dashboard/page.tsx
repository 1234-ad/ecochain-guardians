'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Coins, 
  TrendingUp, 
  Calendar,
  Award,
  Leaf,
  Target,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';
import Navbar from '@/components/Navbar';
import GuardianCard from '@/components/GuardianCard';
import ActionHistory from '@/components/ActionHistory';
import ImpactChart from '@/components/ImpactChart';

export default function Dashboard() {
  const { 
    account, 
    ecoBalance, 
    guardianData, 
    guardianTokenId,
    userActions, 
    totalImpact,
    connectWallet 
  } = useWeb3();

  const [stats, setStats] = useState({
    weeklyActions: 0,
    carbonOffset: 0,
    streak: 0,
    rank: 0
  });

  useEffect(() => {
    if (userActions.length > 0) {
      calculateStats();
    }
  }, [userActions]);

  const calculateStats = () => {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const weeklyActions = userActions.filter(action => 
      action.timestamp * 1000 > weekAgo
    ).length;

    const carbonOffset = guardianData?.carbonOffset || 0;
    
    // Calculate streak (simplified)
    let streak = 0;
    const sortedActions = [...userActions].sort((a, b) => b.timestamp - a.timestamp);
    
    for (let i = 0; i < sortedActions.length; i++) {
      const actionDate = new Date(sortedActions[i].timestamp * 1000);
      const daysDiff = Math.floor((now - actionDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysDiff <= i + 1) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      weeklyActions,
      carbonOffset: Math.floor(carbonOffset / 1000), // Convert to kg
      streak,
      rank: Math.floor(Math.random() * 1000) + 1 // Mock rank
    });
  };

  const getGuardianLevelName = (level: number) => {
    const levels = ['Seedling', 'Sprout', 'Sapling', 'Young Tree', 'Mature Tree', 'Ancient Tree'];
    return levels[level] || 'Unknown';
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view your Guardian dashboard
            </p>
            <button onClick={connectWallet} className="btn-primary">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Guardian! 🌱
            </h1>
            <p className="text-gray-600">
              Track your environmental impact and watch your Guardian evolve
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                icon: Coins,
                label: 'ECO Balance',
                value: `${parseFloat(ecoBalance).toFixed(2)} ECO`,
                color: 'from-green-500 to-emerald-500',
                change: '+12.5%'
              },
              {
                icon: TrendingUp,
                label: 'Impact Score',
                value: totalImpact,
                color: 'from-blue-500 to-cyan-500',
                change: '+8.2%'
              },
              {
                icon: Activity,
                label: 'Weekly Actions',
                value: stats.weeklyActions.toString(),
                color: 'from-purple-500 to-pink-500',
                change: '+15.3%'
              },
              {
                icon: Award,
                label: 'Global Rank',
                value: `#${stats.rank}`,
                color: 'from-orange-500 to-red-500',
                change: '+5 positions'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-full`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guardian Card */}
            <div className="lg:col-span-1">
              <GuardianCard 
                guardianData={guardianData}
                guardianTokenId={guardianTokenId}
                totalImpact={totalImpact}
              />
            </div>

            {/* Impact Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Impact Over Time</h3>
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                </div>
                <ImpactChart userActions={userActions} />
              </motion.div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Carbon Impact</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Offset:</span>
                  <span className="font-medium">{stats.carbonOffset} kg CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-medium text-green-600">+{Math.floor(stats.carbonOffset * 0.3)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.carbonOffset / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.streak}
                </div>
                <p className="text-gray-600">consecutive days</p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < stats.streak ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Community</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Global Rank:</span>
                  <span className="font-medium">#{stats.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guardian Level:</span>
                  <span className="font-medium text-purple-600">
                    {guardianData ? getGuardianLevelName(guardianData.level) : 'No Guardian'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Actions:</span>
                  <span className="font-medium">{userActions.length}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <ActionHistory userActions={userActions.slice(0, 5)} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}