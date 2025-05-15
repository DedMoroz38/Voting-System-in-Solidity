"use client";

import { useState, useEffect } from 'react';
import { Contract } from '../utils/contract';

interface VotingFormProps {
  contract: Contract | null;
  account: string | null;
  onVoteSuccess: () => void;
}

interface MessageState {
  type: 'success' | 'error' | '';
  text: string;
}

export default function VotingForm({ contract, account, onVoteSuccess }: VotingFormProps) {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' });

  useEffect(() => {
    const loadCandidates = async () => {
      if (!contract) return;
      
      try {
        const candidatesList = await contract.getCandidates();
        setCandidates(candidatesList);
        if (candidatesList.length > 0) {
          setSelectedCandidate(candidatesList[0]);
        }
      } catch (err: any) {
        console.error("Failed to load candidates:", err);
        setMessage({ 
          type: 'error', 
          text: err.message || 'Failed to load candidates list'
        });
      }
    };

    loadCandidates();
  }, [contract]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account || !selectedCandidate) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Check if user already voted
      const voted = await contract.hasVoted(account);
      if (voted) {
        setMessage({ type: 'error', text: 'You have already voted!' });
        setLoading(false);
        return;
      }
      
      // Submit vote transaction
      const tx = await contract.vote(selectedCandidate);
      await tx.wait();
      
      setMessage({ 
        type: 'success', 
        text: `Successfully voted for ${selectedCandidate}!` 
      });
      
      // Notify parent to refresh
      onVoteSuccess();
      
    } catch (err: any) {
      console.error("Voting error:", err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to submit vote. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contract || !account) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative">
        Connect your wallet and enter a contract address to vote.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Cast Your Vote</h2>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'error' 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleVote}>
        <div className="mb-4">
          <label htmlFor="candidate-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select a candidate:
          </label>
          <select
            id="candidate-select"
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => (
                <option key={index} value={candidate}>
                  {candidate}
                </option>
              ))
            ) : (
              <option value="">No candidates available</option>
            )}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !selectedCandidate}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${loading || !selectedCandidate
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {loading ? 'Processing...' : 'Vote'}
        </button>
      </form>
    </div>
  );
}
