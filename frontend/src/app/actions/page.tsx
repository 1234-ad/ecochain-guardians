'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Sun, 
  Recycle, 
  Bus, 
  Zap, 
  Droplets,
  Plus,
  Upload,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

interface EcoAction {
  id: number;
  actionType: number;
  impactScore: number;
  tokenReward: string;
  carbonOffset: number;
  requiresVerification: boolean;
  isActive: boolean;
}

export default function ActionsPage() {
  const { account, ecoActions, refreshUserData, connectWallet } = useWeb3();
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<EcoAction | null>(null);
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    loadActions();
  }, [ecoActions]);

  const loadActions = async () => {
    if (!ecoActions) return;

    try {
      // Load predefined actions (IDs 1-5 from contract)
      const actionPromises = [];
      for (let i = 1; i <= 5; i++) {
        actionPromises.push(ecoActions.ecoActions(i));
      }

      const actionResults = await Promise.all(actionPromises);
      const formattedActions = actionResults.map((action, index) => ({
        id: index + 1,
        actionType: action.actionType,
        impactScore: parseInt(action.impactScore.toString()),
        tokenReward: action.tokenReward.toString(),
        carbonOffset: parseInt(action.carbonOffset.toString()),
        requiresVerification: action.requiresVerification,
        isActive: action.isActive
      }));

      setActions(formattedActions.filter(action => action.isActive));
    } catch (error) {
      console.error('Error loading actions:', error);
    }
  };

  const getActionDetails = (actionType: number) => {
    const actionDetails = [
      {
        name: 'Tree Planting',
        description: 'Plant trees to offset carbon and improve air quality',
        icon: Leaf,
        color: 'from-green-500 to-emerald-500',
        tips: ['Choose native species', 'Ensure proper spacing', 'Water regularly'],
        examples: ['Community tree planting', 'Backyard planting', 'Forest restoration']
      },
      {
        name: 'Solar Installation',
        description: 'Install solar panels to generate clean energy',
        icon: Sun,
        color: 'from-yellow-500 to-orange-500',
        tips: ['Check roof orientation', 'Calculate energy needs', 'Get professional installation'],
        examples: ['Rooftop solar panels', 'Solar water heaters', 'Community solar projects']
      },
      {
        name: 'Waste Reduction',
        description: 'Reduce waste through reuse, recycling, and composting',
        icon: Recycle,
        color: 'from-blue-500 to-cyan-500',
        tips: ['Use reusable containers', 'Compost organic waste', 'Buy in bulk'],
        examples: ['Zero waste challenge', 'Composting setup', 'Plastic-free lifestyle']
      },
      {
        name: 'Public Transport',
        description: 'Use public transportation to reduce carbon emissions',
        icon: Bus,
        color: 'from-purple-500 to-pink-500',
        tips: ['Plan your route', 'Use transit apps', 'Consider monthly passes'],
        examples: ['Daily commute by bus', 'Train travel', 'Bike sharing']
      },
      {
        name: 'Energy Efficiency',
        description: 'Improve energy efficiency in your home or workplace',
        icon: Zap,
        color: 'from-indigo-500 to-blue-500',
        tips: ['Use LED bulbs', 'Insulate properly', 'Upgrade appliances'],
        examples: ['LED light installation', 'Smart thermostat', 'Energy audit']
      }
    ];

    return actionDetails[actionType] || actionDetails[0];
  };

  const handleSubmitAction = async () => {
    if (!selectedAction || !ecoActions || !account) return;

    if (selectedAction.requiresVerification && !evidence.trim()) {
      toast.error('Please provide evidence for verification');
      return;
    }

    setIsSubmitting(true);
    try {
      const evidenceText = evidence.trim() || 'No evidence required';
      const tx = await ecoActions.submitAction(selectedAction.id, evidenceText);
      
      toast.success('Action submitted successfully!');
      await tx.wait();
      
      if (selectedAction.requiresVerification) {
        toast.success('Action submitted for verification. You will receive rewards once approved.');
      } else {
        toast.success('Action auto-approved! Rewards have been credited.');
      }

      await refreshUserData();
      setShowSubmitForm(false);
      setSelectedAction(null);
      setEvidence('');
    } catch (error: any) {
      console.error('Error submitting action:', error);
      toast.error(error.message || 'Failed to submit action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatReward = (reward: string) => {
    return (parseFloat(reward) / 1e18).toFixed(2);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Leaf className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start taking eco-actions
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Eco Actions 🌍
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take verified environmental actions to earn ECO tokens and level up your Guardian
            </p>
          </motion.div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {actions.map((action, index) => {
              const details = getActionDetails(action.actionType);
              const IconComponent = details.icon;

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover-lift cursor-pointer"
                  onClick={() => {
                    setSelectedAction(action);
                    setShowSubmitForm(true);
                  }}
                >
                  {/* Action Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${details.color} rounded-full`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {details.name}
                      </h3>
                      {action.requiresVerification && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Requires Verification
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {details.description}
                  </p>

                  {/* Rewards */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ECO Reward:</span>
                      <span className="font-semibold text-green-600">
                        +{formatReward(action.tokenReward)} ECO
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Impact Score:</span>
                      <span className="font-semibold text-blue-600">
                        +{action.impactScore} points
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Carbon Offset:</span>
                      <span className="font-semibold text-purple-600">
                        {Math.floor(action.carbonOffset / 1000)} kg CO₂
                      </span>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Examples:</p>
                    <div className="flex flex-wrap gap-1">
                      {details.examples.slice(0, 2).map((example, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Submit Action</span>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Submit Action Modal */}
          {showSubmitForm && selectedAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl max-w-md w-full p-6"
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getActionDetails(selectedAction.actionType).color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    {React.createElement(getActionDetails(selectedAction.actionType).icon, {
                      className: "h-8 w-8 text-white"
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Submit {getActionDetails(selectedAction.actionType).name}
                  </h3>
                  <p className="text-gray-600">
                    {getActionDetails(selectedAction.actionType).description}
                  </p>
                </div>

                {/* Rewards Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Rewards:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ECO Tokens:</span>
                      <span className="font-medium text-green-600">
                        +{formatReward(selectedAction.tokenReward)} ECO
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Impact Score:</span>
                      <span className="font-medium text-blue-600">
                        +{selectedAction.impactScore} points
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Carbon Offset:</span>
                      <span className="font-medium text-purple-600">
                        {Math.floor(selectedAction.carbonOffset / 1000)} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence Input */}
                {selectedAction.requiresVerification && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence (Required for Verification)
                    </label>
                    <textarea
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder="Describe your action or provide links to photos/documents..."
                      className="input-field h-24 resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide details about your action for community verification
                    </p>
                  </div>
                )}

                {/* Tips */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {getActionDetails(selectedAction.actionType).tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSubmitForm(false);
                      setSelectedAction(null);
                      setEvidence('');
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAction}
                    disabled={isSubmitting || (selectedAction.requiresVerification && !evidence.trim())}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <div className="loading-spinner" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Action'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}