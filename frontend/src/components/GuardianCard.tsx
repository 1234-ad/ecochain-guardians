'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Star, 
  TrendingUp, 
  Calendar,
  Award,
  Sparkles,
  Plus
} from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';
import toast from 'react-hot-toast';

interface GuardianCardProps {
  guardianData: any;
  guardianTokenId: number | null;
  totalImpact: string;
}

export default function GuardianCard({ guardianData, guardianTokenId, totalImpact }: GuardianCardProps) {
  const { guardianNFT, account, refreshUserData } = useWeb3();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [guardianName, setGuardianName] = useState('');

  const getGuardianLevel = (level: number) => {
    const levels = [
      { name: 'Seedling', color: 'from-green-300 to-green-500', emoji: '🌱' },
      { name: 'Sprout', color: 'from-green-400 to-green-600', emoji: '🌿' },
      { name: 'Sapling', color: 'from-emerald-400 to-emerald-600', emoji: '🌳' },
      { name: 'Young Tree', color: 'from-emerald-500 to-teal-600', emoji: '🌲' },
      { name: 'Mature Tree', color: 'from-teal-500 to-cyan-600', emoji: '🌴' },
      { name: 'Ancient Tree', color: 'from-cyan-500 to-blue-600', emoji: '🌺' }
    ];
    return levels[level] || levels[0];
  };

  const getNextLevelRequirement = (currentLevel: number) => {
    const requirements = [100, 500, 2000, 5000, 10000];
    return requirements[currentLevel] || 10000;
  };

  const calculateProgress = (currentImpact: number, currentLevel: number) => {
    const nextRequirement = getNextLevelRequirement(currentLevel);
    const prevRequirement = currentLevel > 0 ? getNextLevelRequirement(currentLevel - 1) : 0;
    
    const progress = ((currentImpact - prevRequirement) / (nextRequirement - prevRequirement)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleCreateGuardian = async () => {
    if (!guardianNFT || !account || !guardianName.trim()) {
      toast.error('Please enter a guardian name');
      return;
    }

    setIsCreating(true);
    try {
      const tx = await guardianNFT.mintGuardian(account, guardianName.trim());
      toast.success('Creating your Guardian...');
      
      await tx.wait();
      toast.success('Guardian created successfully! 🎉');
      
      await refreshUserData();
      setShowCreateForm(false);
      setGuardianName('');
    } catch (error: any) {
      console.error('Error creating guardian:', error);
      toast.error(error.message || 'Failed to create Guardian');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!guardianTokenId || !guardianData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-12 w-12 text-gray-500" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Create Your Guardian
          </h3>
          <p className="text-gray-600 mb-6">
            Mint your unique Guardian NFT to start your eco journey
          </p>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Guardian</span>
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your Guardian's name"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="input-field"
                maxLength={32}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateGuardian}
                  disabled={isCreating || !guardianName.trim()}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <div className="loading-spinner" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>{isCreating ? 'Creating...' : 'Mint Guardian'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setGuardianName('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const level = getGuardianLevel(guardianData.level);
  const currentImpact = parseInt(totalImpact);
  const progress = calculateProgress(currentImpact, guardianData.level);
  const nextRequirement = getNextLevelRequirement(guardianData.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Guardian Avatar */}
      <div className="text-center mb-6">
        <div className={`w-24 h-24 bg-gradient-to-r ${level.color} rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg`}>
          {level.emoji}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {guardianData.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {level.name} Guardian
        </p>
        <div className="flex items-center justify-center space-x-1">
          {[...Array(guardianData.level + 1)].map((_, i) => (
            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Impact Score:</span>
          <span className="font-semibold text-gray-900">{currentImpact.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Carbon Offset:</span>
          <span className="font-semibold text-green-600">
            {Math.floor(guardianData.carbonOffset / 1000)} kg CO₂
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Born:</span>
          <span className="font-semibold text-gray-900">
            {formatDate(guardianData.birthTime)}
          </span>
        </div>
      </div>

      {/* Level Progress */}
      {guardianData.level < 5 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Next Level:</span>
            <span className="text-sm font-medium text-gray-900">
              {currentImpact} / {nextRequirement.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${level.color} rounded-full`}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-1 text-center">
            {(nextRequirement - currentImpact).toLocaleString()} points to next level
          </p>
        </div>
      )}

      {/* Achievements */}
      {guardianData.achievements && guardianData.achievements.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900">Achievements</span>
          </div>
          
          <div className="space-y-2">
            {guardianData.achievements.slice(0, 3).map((achievement: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-xs text-gray-700">{achievement}</span>
              </div>
            ))}
            
            {guardianData.achievements.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{guardianData.achievements.length - 3} more achievements
              </p>
            )}
          </div>
        </div>
      )}

      {/* Guardian Actions */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary text-xs py-2">
            View Details
          </button>
          <button className="btn-primary text-xs py-2">
            Share Guardian
          </button>
        </div>
      </div>
    </motion.div>
  );
}