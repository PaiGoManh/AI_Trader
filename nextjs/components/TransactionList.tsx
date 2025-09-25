"use client";
import React from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface TradeConfirmationProps {
  tradeParams: any;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const TradeConfirmation: React.FC<TradeConfirmationProps> = ({
  tradeParams,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  if (!tradeParams) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Confirm Trade</h3>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Token In:</span>
            <span className="text-white">{tradeParams.tokenIn}</span>
          </div>
          <div className="flex justify-between">
            <span>Token Out:</span>
            <span className="text-white">{tradeParams.tokenOut}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="text-white">{tradeParams.amountIn}</span>
          </div>
          <div className="flex justify-between">
            <span>Expected Out:</span>
            <span className="text-white">{tradeParams.expectedAmountOut}</span>
          </div>
        </div>

        {isProcessing ? (
          <div className="flex items-center justify-center mt-4">
            <Loader className="w-5 h-5 animate-spin text-orange-500 mr-2" />
            <span className="text-white">Processing transaction...</span>
          </div>
        ) : (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeConfirmation;