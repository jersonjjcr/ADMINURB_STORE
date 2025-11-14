const StatCard = ({ title, value, icon, color = 'blue', trend, trendValue }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600'
  };

  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    pink: 'bg-pink-50',
    red: 'bg-red-50'
  };

  const iconColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    pink: 'text-pink-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{value}</h3>
          
          {trend && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-gray-500">vs último mes</span>
            </div>
          )}
        </div>
        
        <div className={`${bgColor[color]} rounded-xl p-4`}>
          <span className={`text-3xl ${iconColor[color]}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
