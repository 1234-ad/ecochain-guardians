'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Leaf,
  Sun,
  Recycle,
  Bus,
  Zap,
  Droplets
} from 'lucide-react';

interface ActionHistoryProps {
  userActions: any[];
}

export default function ActionHistory({ userActions }: ActionHistoryProps) {
  const getActionIcon = (actionType: number) => {
    const icons = [
      Leaf,      // Tree Planting
      Sun,       // Solar Install
      Recycle,   // Waste Reduction
      Bus,       // Public Transport
      Zap,       // Energy Efficiency
      Droplets,  // Water Conservation
      Recycle,   // Recycling
      Leaf       // Carbon Offset
    ];
    const IconComponent = icons[actionType] || Leaf;
    return IconComponent;
  };

  const getActionName = (actionType: number) => {
    const names = [
      'Tree Planting',
      'Solar Installation',
      'Waste Reduction',
      'Public Transport',
      'Energy Efficiency',
      'Water Conservation',
      'Recycling',
      'Carbon Offset'
    ];
    return names[actionType] || 'Unknown Action';
  };

  const getActionColor = (actionType: number) => {
    const colors = [
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-indigo-500 to-blue-500',
      'from-cyan-500 to-teal-500',
      'from-emerald-500 to-green-500',
      'from-teal-500 to-emerald-500'
    ];
    return colors[actionType] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (verified: boolean, requiresVerification: boolean) => {
    if (!requiresVerification) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (verified) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (verified: boolean, requiresVerification: boolean) => {
    if (!requiresVerification) {
      return 'Auto-approved';
    }
    
    if (verified) {
      return 'Verified';
    }
    
    return 'Pending verification';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const formatReward = (reward: string | number) => {
    const num = typeof reward === 'string' ? parseFloat(reward) : reward;
    return (num / 1e18).toFixed(2); // Convert from wei to ECO
  };

  if (userActions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Actions Yet
          </h3>
          <p className="text-gray-600">
            Start taking eco-actions to see your history here
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Actions</h3>
        <Clock className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {userActions.map((action, index) => {
          const IconComponent = getActionIcon(action.actionType || 0);
          const actionColor = getActionColor(action.actionType || 0);
          const actionName = getActionName(action.actionType || 0);
          
          return (
            <motion.div
              key={action.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Action Icon */}
              <div className={`p-3 bg-gradient-to-r ${actionColor} rounded-full flex-shrink-0`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>

              {/* Action Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {actionName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(action.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(action.verified, true)}
                    <span className="text-xs text-gray-600">
                      {getStatusText(action.verified, true)}
                    </span>
                  </div>
                  
                  {action.tokenReward && action.tokenReward !== '0' && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-green-600">
                        +{formatReward(action.tokenReward)} ECO
                      </span>
                    </div>
                  )}
                </div>

                {/* Impact Score */}
                {action.impactScore && action.impactScore !== '0' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Impact Score:</span>
                      <span className="font-medium text-blue-600">
                        +{action.impactScore} points
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Badge */}
              <div className="flex-shrink-0">
                {action.verified ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Actions Button */}
      {userActions.length >= 5 && (
        <div className="mt-6 text-center">
          <button className="btn-secondary text-sm">
            View All Actions
          </button>
        </div>
      )}
    </motion.div>
  );
}