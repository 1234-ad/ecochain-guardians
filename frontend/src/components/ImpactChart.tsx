'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ImpactChartProps {
  userActions: any[];
}

export default function ImpactChart({ userActions }: ImpactChartProps) {
  const chartData = useMemo(() => {
    if (!userActions || userActions.length === 0) {
      return [];
    }

    // Sort actions by timestamp
    const sortedActions = [...userActions].sort((a, b) => a.timestamp - b.timestamp);
    
    // Create cumulative impact data
    let cumulativeImpact = 0;
    const data = [];
    
    // Group actions by day
    const actionsByDay = new Map();
    
    sortedActions.forEach(action => {
      const date = new Date(action.timestamp * 1000);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!actionsByDay.has(dayKey)) {
        actionsByDay.set(dayKey, {
          date: dayKey,
          actions: [],
          dailyImpact: 0,
          dailyReward: 0
        });
      }
      
      const dayData = actionsByDay.get(dayKey);
      dayData.actions.push(action);
      dayData.dailyImpact += parseInt(action.impactScore || '0');
      dayData.dailyReward += parseFloat(action.tokenReward || '0') / 1e18;
    });

    // Convert to array and calculate cumulative values
    const sortedDays = Array.from(actionsByDay.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedDays.forEach((day, index) => {
      cumulativeImpact += day.dailyImpact;
      
      data.push({
        date: day.date,
        displayDate: new Date(day.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        cumulativeImpact,
        dailyImpact: day.dailyImpact,
        dailyReward: day.dailyReward,
        actionCount: day.actions.length
      });
    });

    // If we have less than 7 days, pad with recent days
    if (data.length < 7) {
      const today = new Date();
      const paddedData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        
        const existingDay = data.find(d => d.date === dayKey);
        if (existingDay) {
          paddedData.push(existingDay);
        } else {
          paddedData.push({
            date: dayKey,
            displayDate: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            cumulativeImpact: paddedData.length > 0 ? paddedData[paddedData.length - 1].cumulativeImpact : 0,
            dailyImpact: 0,
            dailyReward: 0,
            actionCount: 0
          });
        }
      }
      
      return paddedData;
    }

    return data.slice(-30); // Show last 30 days
  }, [userActions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Total Impact: {data.cumulativeImpact.toLocaleString()} points
            </p>
            <p className="text-sm text-green-600">
              Daily Impact: +{data.dailyImpact} points
            </p>
            <p className="text-sm text-purple-600">
              Daily Reward: +{data.dailyReward.toFixed(2)} ECO
            </p>
            <p className="text-sm text-gray-600">
              Actions: {data.actionCount}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            📊
          </div>
          <p>No data to display</p>
          <p className="text-sm">Complete eco-actions to see your impact chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="displayDate" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="cumulativeImpact"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#impactGradient)"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}