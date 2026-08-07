// src/components/ChartCard.jsx
'use client';

export default function ChartCard({ title, type, data = [], inboxStats = {} }) {
  // --- Spam Ratio Chart Logic ---
  const renderSpamRatioChart = () => {
    const spam = inboxStats?.spamCount || 0;
    const total = Math.max(inboxStats?.totalEmails || 0, spam + 1); // Avoids division by zero
    const spamPct = Math.min(100, Math.round((spam / total) * 100));
    const legitPct = 100 - spamPct;

    return (
      <div className="flex items-center gap-6 w-full mt-4">
        <div
          className="w-24 h-24 rounded-full"
          style={{ 
            background: `conic-gradient(from 0deg, rgba(255,255,255,0.2) ${spamPct}%, rgba(255,255,255,1) 0)`
          }}
        />
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-white" />
            <span className="text-white/80 font-bold">Legitimate ({legitPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-white/20" />
            <span className="text-white/80 font-bold">Spam ({spamPct}%)</span>
          </div>
        </div>
      </div>
    );
  };

  // --- Traffic Chart Logic ---
  const renderTrafficChart = () => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="h-40 flex items-end gap-2 mt-4">
        {data.map((value, idx) => {
          const height = (value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                style={{ height: `${height}%` }}
                className="w-full bg-white/20 rounded-t transition-colors hover:bg-white"
                title={`${value} emails`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="surface-card bg-white/5 rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      
      {/* Conditionally render the correct chart based on the 'type' prop */}
      {type === 'traffic' && renderTrafficChart()}
      {type === 'spamRatio' && renderSpamRatioChart()}
    </div>
  );
}