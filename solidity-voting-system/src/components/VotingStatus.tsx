"use client";

import { useState, useEffect } from 'react';
import { Web3Provider, Contract } from '../utils/contract';

interface VotingStatusProps {
  contract: Contract | null;
  account: string | null;
}

interface VoteCount {
  [candidate: string]: string;
}

export default function VotingStatus({ contract, account }: VotingStatusProps) {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount>({});
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotingData = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get candidates
        const candidatesList = await contract.getCandidates();
        setCandidates(candidatesList);

        // Get vote counts for each candidate
        const votes: VoteCount = {};
        for (const candidate of candidatesList) {
          const voteCount = await contract.getVotes(candidate);
          votes[candidate] = voteCount.toString();
        }
        setVoteCounts(votes);

        // Check if current account has voted
        const voted = await contract.hasVoted(account);
        setHasVoted(voted);
      } catch (err: any) {
        console.error('Error loading voting data:', err);
        setError(err.message || 'Failed to load voting data');
      } finally {
        setLoading(false);
      }
    };

    fetchVotingData();
  }, [contract, account]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!contract || !account) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-4">
        Please connect your wallet and enter a contract address to view voting status.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Voting Status</h2>
      
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <p className="mb-2">
          <span className="font-semibold">Your Address:</span> {account}
        </p>
        <p>
          <span className="font-semibold">Voting Status:</span>{' '}
          <span className={hasVoted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
            {hasVoted ? 'You have already voted' : 'You have not voted yet'}
          </span>
        </p>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Candidates and Results</h3>
      
      {candidates.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <th className="py-2 px-4 text-left">Candidate</th>
                <th className="py-2 px-4 text-left">Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr 
                  key={index}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-2 px-4">{candidate}</td>
                  <td className="py-2 px-4">{voteCounts[candidate] || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No candidates found in this contract.</p>
      )}
    </div>
  );
}
